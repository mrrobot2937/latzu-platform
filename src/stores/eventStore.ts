import { create } from "zustand";
import type { UserInteractionEvent, EventQueueItem } from "@/types/events";

interface EventState {
  // Event queue
  eventQueue: EventQueueItem[];

  // Connection state
  isConnected: boolean;
  lastEventSent: Date | null;

  // Real-time notifications
  notifications: Notification[];
  unreadCount: number;

  // Actions
  queueEvent: (event: UserInteractionEvent) => void;
  markEventSent: (eventId: string) => void;
  clearQueue: () => void;

  setConnected: (isConnected: boolean) => void;

  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "suggestion" | "achievement" | "reminder" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  eventQueue: [],
  isConnected: false,
  lastEventSent: null,
  notifications: [],
  unreadCount: 0,

  // Event queue actions
  queueEvent: (event) => {
    const queueItem: EventQueueItem = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date(),
      status: "pending",
      retryCount: 0,
    };

    set((state) => ({
      eventQueue: [...state.eventQueue, queueItem],
    }));
  },

  markEventSent: (eventId) =>
    set((state) => ({
      eventQueue: state.eventQueue.map((item) =>
        item.id === eventId ? { ...item, status: "sent" as const } : item
      ),
      lastEventSent: new Date(),
    })),

  clearQueue: () =>
    set((state) => ({
      eventQueue: state.eventQueue.filter((item) => item.status !== "sent"),
    })),

  // Connection actions
  setConnected: (isConnected) => set({ isConnected }),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));

// Selectors
export const useEventQueue = () => useEventStore((state) => state.eventQueue);
export const useIsConnected = () => useEventStore((state) => state.isConnected);
export const useNotifications = () => useEventStore((state) => state.notifications);
export const useUnreadCount = () => useEventStore((state) => state.unreadCount);



