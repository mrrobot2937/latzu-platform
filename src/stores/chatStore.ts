import { create } from "zustand";
import type { ChatMessage, ChatSession, ProactiveSuggestion } from "@/types/chat";

interface ChatState {
  // Current session
  currentSession: ChatSession | null;
  sessions: ChatSession[];

  // Messages
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;

  // Proactive features
  suggestions: ProactiveSuggestion[];
  showSuggestions: boolean;

  // Input state
  inputValue: string;
  isTyping: boolean;

  // Actions
  setCurrentSession: (session: ChatSession | null) => void;
  addSession: (session: ChatSession) => void;
  removeSession: (sessionId: string) => void;

  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;

  setSuggestions: (suggestions: ProactiveSuggestion[]) => void;
  dismissSuggestion: (id: string) => void;
  toggleSuggestions: () => void;

  setInputValue: (value: string) => void;
  setTyping: (isTyping: boolean) => void;

  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  currentSession: null,
  sessions: [],
  messages: [],
  isStreaming: false,
  streamingContent: "",
  suggestions: [],
  showSuggestions: true,
  inputValue: "",
  isTyping: false,

  // Session actions
  setCurrentSession: (session) => set({ currentSession: session }),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSession: session,
    })),

  removeSession: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
      currentSession:
        state.currentSession?.sessionId === sessionId
          ? null
          : state.currentSession,
    })),

  // Message actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  clearMessages: () => set({ messages: [] }),

  // Streaming actions
  setStreaming: (isStreaming) => set({ isStreaming }),

  appendStreamingContent: (content) =>
    set((state) => ({
      streamingContent: state.streamingContent + content,
    })),

  clearStreamingContent: () => set({ streamingContent: "" }),

  // Suggestion actions
  setSuggestions: (suggestions) => set({ suggestions }),

  dismissSuggestion: (id) =>
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.id !== id),
    })),

  toggleSuggestions: () =>
    set((state) => ({ showSuggestions: !state.showSuggestions })),

  // Input actions
  setInputValue: (value) => set({ inputValue: value }),
  setTyping: (isTyping) => set({ isTyping }),

  // Reset
  reset: () =>
    set({
      currentSession: null,
      messages: [],
      isStreaming: false,
      streamingContent: "",
      suggestions: [],
      showSuggestions: true,
      inputValue: "",
      isTyping: false,
    }),
}));

// Selectors
export const useMessages = () => useChatStore((state) => state.messages);
export const useIsStreaming = () => useChatStore((state) => state.isStreaming);
export const useStreamingContent = () => useChatStore((state) => state.streamingContent);
export const useSuggestions = () => useChatStore((state) => state.suggestions);
export const useCurrentSession = () => useChatStore((state) => state.currentSession);



