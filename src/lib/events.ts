// Event tracking utilities for knowledge graph optimization
import { websocket } from "./websocket";
import { useEventStore } from "@/stores/eventStore";
import type { InteractionType, FeedbackType } from "@/types/events";

interface TrackEventOptions {
  tenantId?: string;
  userId?: string;
  sessionId?: string;
  graphId?: string;
}

// Track a user interaction event
export function trackInteraction(
  interactionType: InteractionType,
  content: string,
  options: TrackEventOptions & {
    currentTopic?: string;
    userIntent?: string;
    previousAction?: string;
    timeOnPage?: number;
  } = {}
): void {
  websocket.emitInteraction({
    eventType: "user_interaction",
    source: "user",
    interactionType,
    content,
    tenantId: options.tenantId || "default",
    userId: options.userId,
    sessionId: options.sessionId,
    graphId: options.graphId,
    currentTopic: options.currentTopic,
    userIntent: options.userIntent,
    previousAction: options.previousAction,
    timeOnPage: options.timeOnPage,
  });
}

// Track a chat message
export function trackChatMessage(
  message: string,
  sessionId: string,
  options: TrackEventOptions & { currentTopic?: string } = {}
): void {
  trackInteraction("chat_message", message, {
    ...options,
    sessionId,
  });
}

// Track lesson progress
export function trackLessonProgress(
  lessonId: string,
  blockIndex: number,
  blockType: string,
  action: "started" | "completed" | "skipped" | "revisited",
  timeSpent: number,
  options: TrackEventOptions & { score?: number; attempts?: number } = {}
): void {
  const eventStore = useEventStore.getState();

  eventStore.queueEvent({
    eventType: "user_interaction",
    source: "user",
    interactionType: "lesson_progress",
    content: JSON.stringify({
      lessonId,
      blockIndex,
      blockType,
      action,
      timeSpent,
      score: options.score,
      attempts: options.attempts,
    }),
    tenantId: options.tenantId || "default",
    userId: options.userId,
    sessionId: options.sessionId,
    timestamp: new Date(),
    eventId: crypto.randomUUID(),
    schemaVersion: "1.0",
  });
}

// Track concept exploration
export function trackConceptExploration(
  conceptId: string,
  conceptName: string,
  options: TrackEventOptions = {}
): void {
  trackInteraction("concept_exploration", conceptName, {
    ...options,
    currentTopic: conceptId,
  });
}

// Track quiz attempt
export function trackQuizAttempt(
  lessonId: string,
  questionIndex: number,
  isCorrect: boolean,
  selectedOption: number,
  timeSpent: number,
  options: TrackEventOptions = {}
): void {
  trackInteraction(
    "quiz_attempt",
    JSON.stringify({
      lessonId,
      questionIndex,
      isCorrect,
      selectedOption,
      timeSpent,
    }),
    options
  );
}

// Track feedback
export function trackFeedback(
  feedbackType: FeedbackType,
  targetId: string,
  options: TrackEventOptions & {
    feedbackText?: string;
    rating?: number;
    actionTaken?: string;
  } = {}
): void {
  trackInteraction(
    "feedback_given",
    JSON.stringify({
      feedbackType,
      targetId,
      feedbackText: options.feedbackText,
      rating: options.rating,
      actionTaken: options.actionTaken,
    }),
    options
  );
}

// Track navigation
export function trackNavigation(
  from: string,
  to: string,
  options: TrackEventOptions & { timeOnPage?: number } = {}
): void {
  trackInteraction("navigation", `${from} -> ${to}`, {
    ...options,
    previousAction: from,
  });
}

// Higher-order function to create a tracked action
export function withTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interactionType: InteractionType,
  getContent: (...args: Parameters<T>) => string,
  options: TrackEventOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    const content = getContent(...args);
    trackInteraction(interactionType, content, options);
    return fn(...args);
  }) as T;
}

// Debounced tracking for high-frequency events
export function createDebouncedTracker(
  interactionType: InteractionType,
  delay: number = 1000
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastContent: string = "";

  return (content: string, options: TrackEventOptions = {}) => {
    lastContent = content;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      trackInteraction(interactionType, lastContent, options);
      timeoutId = null;
    }, delay);
  };
}

// Time tracking utility
export class TimeTracker {
  private startTime: number;
  private pausedTime: number = 0;
  private isPaused: boolean = false;

  constructor() {
    this.startTime = Date.now();
  }

  pause(): void {
    if (!this.isPaused) {
      this.pausedTime = Date.now();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.isPaused) {
      this.startTime += Date.now() - this.pausedTime;
      this.isPaused = false;
    }
  }

  getElapsedSeconds(): number {
    const endTime = this.isPaused ? this.pausedTime : Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  reset(): void {
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.isPaused = false;
  }
}

