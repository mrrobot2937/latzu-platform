"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { chatApi, learningApi } from "@/lib/api";
import { trackChatMessage } from "@/lib/events";
import type { ChatMessage, ProactiveSuggestion, StreamChunk } from "@/types/chat";

interface UseChatOptions {
  sessionId?: string;
  autoFetchSuggestions?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const { data: session } = useSession();
  const tenantId = useUserStore((state) => state.tenantId);
  const isGuest = useUserStore((state) => state.isGuest);
  const guestId = useUserStore((state) => state.guestId);

  // Get user ID - either from session or guest ID
  const userId = session?.user?.id || guestId || "anonymous";

  const {
    currentSession,
    messages,
    isStreaming,
    streamingContent,
    suggestions,
    inputValue,
    setCurrentSession,
    addSession,
    addMessage,
    updateMessage,
    setStreaming,
    appendStreamingContent,
    clearStreamingContent,
    setSuggestions,
    dismissSuggestion,
    setInputValue,
  } = useChatStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize or fetch session
  useEffect(() => {
    if (options.sessionId && !currentSession) {
      fetchSession(options.sessionId);
    }
  }, [options.sessionId, currentSession]);

  // Fetch proactive suggestions
  useEffect(() => {
    if (options.autoFetchSuggestions && session?.user?.id) {
      fetchProactiveSuggestions();
    }
  }, [options.autoFetchSuggestions, session?.user?.id, messages.length]);

  const fetchSession = async (sessionId: string) => {
    try {
      const sessionData = await chatApi.getSession(sessionId);
      setCurrentSession({
        sessionId: sessionData.session_id,
        tenantId: sessionData.tenant_id,
        userId: sessionData.user_id,
        createdAt: new Date(sessionData.created_at),
        updatedAt: new Date(sessionData.updated_at),
        messageCount: sessionData.message_count,
        hasActiveFlow: sessionData.has_active_flow,
      });

      // Load existing messages
      sessionData.messages.forEach((msg) => {
        addMessage({
          id: crypto.randomUUID(),
          role: msg.role as ChatMessage["role"],
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        });
      });
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError("No se pudo cargar la conversación");
    }
  };

  const createSession = async (): Promise<string> => {
    try {
      const response = await chatApi.createSession({
        tenant_id: tenantId,
        user_id: userId,
        metadata: {
          source: "web",
          profileType: session?.user?.profileType,
          isGuest,
        },
      });

      addSession({
        sessionId: response.session_id,
        tenantId: response.tenant_id,
        userId,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.created_at),
        messageCount: 0,
        hasActiveFlow: false,
      });

      return response.session_id;
    } catch (err) {
      console.error("Failed to create session:", err);
      throw new Error("No se pudo crear la conversación");
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    setIsLoading(true);

    // Get or create session
    let sessionId = currentSession?.sessionId;
    if (!sessionId) {
      try {
        sessionId = await createSession();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creating session");
        setIsLoading(false);
        return;
      }
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInputValue("");

    // Track event for knowledge graph
    trackChatMessage(content, sessionId, {
      tenantId,
      userId,
    });

    // Create placeholder for assistant response
    const assistantMessageId = crypto.randomUUID();
    addMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    });

    setStreaming(true);
    clearStreamingContent();

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content,
          tenantId,
          userId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let receivedSuggestions: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const data: StreamChunk = JSON.parse(line.slice(6));

            switch (data.type) {
              case "content":
                fullContent += data.content || "";
                appendStreamingContent(data.content || "");
                updateMessage(assistantMessageId, { content: fullContent });
                break;

              case "suggestions":
                receivedSuggestions = data.suggestions || [];
                break;

              case "done":
                updateMessage(assistantMessageId, {
                  content: fullContent,
                  isStreaming: false,
                  suggestions: receivedSuggestions,
                });
                break;

              case "error":
                throw new Error(data.error);
            }
          } catch (parseError) {
            console.warn("Failed to parse SSE chunk:", parseError);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Stream error:", err);
        setError("Error al enviar el mensaje. Inténtalo de nuevo.");
        updateMessage(assistantMessageId, {
          content: "Lo siento, hubo un error al procesar tu mensaje.",
          isStreaming: false,
        });
      }
    } finally {
      setStreaming(false);
      setIsLoading(false);
      clearStreamingContent();
      abortControllerRef.current = null;
    }
  }, [
    currentSession,
    isStreaming,
    tenantId,
    session,
    addMessage,
    updateMessage,
    setStreaming,
    appendStreamingContent,
    clearStreamingContent,
    setInputValue,
  ]);

  const fetchProactiveSuggestions = async () => {
    if (!userId || userId === "anonymous") return;

    try {
      const response = await learningApi.getRecommendations(
        userId,
        "default" // TODO: get active graph ID
      );

      const mappedSuggestions: ProactiveSuggestion[] = (
        response.recommendations as Array<{
          concept_id: string;
          concept_name: string;
          reason: string;
        }>
      ).map((rec) => ({
        id: rec.concept_id,
        type: "concept" as const,
        title: rec.concept_name,
        description: rec.reason,
        priority: 5,
        action: {
          label: "Explorar",
          prompt: `Cuéntame más sobre ${rec.concept_name}`,
        },
      }));

      setSuggestions(mappedSuggestions);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  };

  const handleSuggestionClick = (suggestion: ProactiveSuggestion) => {
    if (suggestion.action?.prompt) {
      sendMessage(suggestion.action.prompt);
    }
    dismissSuggestion(suggestion.id);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
    }
  };

  const clearChat = () => {
    useChatStore.getState().reset();
  };

  return {
    // State
    session: currentSession,
    messages,
    isStreaming,
    streamingContent,
    suggestions,
    inputValue,
    error,
    isLoading,

    // Actions
    sendMessage,
    setInputValue,
    handleSuggestionClick,
    dismissSuggestion,
    stopGeneration,
    clearChat,
    createSession,
    fetchProactiveSuggestions,
  };
}

