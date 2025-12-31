// Event types for Latzu Platform - aligned with backend events.py

export type EventSource = "user" | "ai_model" | "system";

export type InteractionType =
  | "chat_message"
  | "lesson_progress"
  | "concept_exploration"
  | "question_asked"
  | "feedback_given"
  | "navigation"
  | "quiz_attempt"
  | "exercise_submission";

export type FeedbackType =
  | "explicit_positive"
  | "explicit_negative"
  | "implicit_positive"
  | "implicit_negative";

export interface BaseEvent {
  eventId: string;
  eventType: string;
  source: EventSource;
  timestamp: Date;
  tenantId: string;
  userId?: string;
  sessionId?: string;
  graphId?: string;
  metadata?: Record<string, unknown>;
  schemaVersion: string;
}

export interface UserInteractionEvent extends BaseEvent {
  eventType: "user_interaction";
  source: "user";
  interactionType: InteractionType;
  content: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  currentTopic?: string;
  userIntent?: string;
  previousAction?: string;
  timeOnPage?: number;
}

export interface FeedbackEvent extends BaseEvent {
  eventType: "feedback";
  source: "user";
  feedbackType: FeedbackType;
  targetResponseId?: string;
  targetConceptId?: string;
  feedbackText?: string;
  rating?: number; // 1-5 stars
  actionTaken?: string;
  timeToFeedback?: number;
}

export interface LessonProgressEvent extends BaseEvent {
  eventType: "lesson_progress";
  source: "user";
  lessonId: string;
  blockIndex: number;
  blockType: string;
  action: "started" | "completed" | "skipped" | "revisited";
  timeSpent: number; // seconds
  score?: number; // for quiz blocks
  attempts?: number;
}

export interface EventQueueItem {
  id: string;
  event: UserInteractionEvent | FeedbackEvent | LessonProgressEvent;
  timestamp: Date;
  status: "pending" | "sending" | "sent" | "failed";
  retryCount: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: "event" | "ping" | "pong" | "subscribe" | "unsubscribe";
  payload?: unknown;
}

export interface ServerPushEvent {
  type: "proactive_suggestion" | "knowledge_update" | "lesson_unlocked" | "achievement" | "notification";
  data: unknown;
  timestamp: Date;
}
