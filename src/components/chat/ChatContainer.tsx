"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useIsGuest } from "@/stores/userStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ProactiveSuggestions } from "./ProactiveSuggestions";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { getTemplate } from "@/config/templates";
import { Send, Square, Sparkles, Trash2 } from "lucide-react";

interface ChatContainerProps {
  sessionId?: string;
  className?: string;
}

export function ChatContainer({ sessionId, className }: ChatContainerProps) {
  const { data: session } = useSession();
  const isGuest = useIsGuest();
  const profileType = useUserStore((state) => state.profileType);
  const showSuggestions = useChatStore((state) => state.showSuggestions);
  const toggleSuggestions = useChatStore((state) => state.toggleSuggestions);

  // Get user info for display
  const userName = isGuest ? "Invitado" : session?.user?.name;
  const userImage = isGuest ? undefined : session?.user?.image;

  const {
    messages,
    isStreaming,
    suggestions,
    inputValue,
    error,
    sendMessage,
    setInputValue,
    handleSuggestionClick,
    dismissSuggestion,
    stopGeneration,
    clearChat,
  } = useChat({
    sessionId,
    autoFetchSuggestions: true,
  });

  const template = getTemplate(profileType || undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isStreaming) {
      sendMessage(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">
              {template.chatPersonality === "tutor" && "Tutor IA"}
              {template.chatPersonality === "mentor" && "Mentor IA"}
              {template.chatPersonality === "advisor" && "Asesor IA"}
              {template.chatPersonality === "assistant" && "Asistente IA"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isStreaming ? "Escribiendo..." : "En línea"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
      >
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              ¡Hola! Soy tu {template.chatPersonality === "tutor" ? "tutor" :
                template.chatPersonality === "mentor" ? "mentor" :
                template.chatPersonality === "advisor" ? "asesor" : "asistente"}
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {template.welcomeMessage}
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "¿Qué puedo aprender hoy?",
                "Dame una recomendación",
                "Explica un concepto",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <MessageBubble
                  message={message}
                  userImage={userImage || undefined}
                  userName={userName || undefined}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 mt-4 rounded-lg bg-destructive/10 text-destructive text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </ScrollArea>

      {/* Proactive Suggestions */}
      <div className="px-4">
        <ProactiveSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          onDismiss={dismissSuggestion}
          show={showSuggestions}
          onToggle={toggleSuggestions}
        />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isStreaming}
            />
            <div className="absolute right-2 bottom-2">
              {isStreaming ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8"
                  onClick={stopGeneration}
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="w-8 h-8"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  );
}

