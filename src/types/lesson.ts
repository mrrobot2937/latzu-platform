// Lesson types for Latzu Platform

export type BlockType =
  | "content"
  | "quiz"
  | "exercise"
  | "reflection"
  | "ai-interaction"
  | "video"
  | "code";

export interface ContentBlock {
  type: "content";
  markdown: string;
}

export interface QuizBlock {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points?: number;
}

export interface ExerciseBlock {
  type: "exercise";
  prompt: string;
  hints?: string[];
  validator?: string; // AI validator prompt
  sampleSolution?: string;
}

export interface ReflectionBlock {
  type: "reflection";
  prompt: string;
  guidingQuestions?: string[];
}

export interface AIInteractionBlock {
  type: "ai-interaction";
  context: string;
  suggestedQuestions?: string[];
  concept?: string;
}

export interface VideoBlock {
  type: "video";
  url: string;
  title?: string;
  duration?: number; // seconds
  timestamps?: Array<{ time: number; label: string }>;
}

export interface CodeBlock {
  type: "code";
  language: string;
  starterCode?: string;
  solution?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
}

export type LessonBlock =
  | ContentBlock
  | QuizBlock
  | ExerciseBlock
  | ReflectionBlock
  | AIInteractionBlock
  | VideoBlock
  | CodeBlock;

export interface InteractiveLesson {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  blocks: LessonBlock[];
  prerequisites: string[]; // lesson IDs
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  concepts: string[]; // concept IDs covered
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  currentBlockIndex: number;
  completedBlocks: number[];
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  score: number; // 0-100
  timeSpent: number; // seconds
  quizScores: Record<number, number>; // blockIndex -> score
  exerciseSubmissions: Record<number, string>; // blockIndex -> submission
  reflections: Record<number, string>; // blockIndex -> reflection
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  lessons: string[]; // lesson IDs in order
  estimatedHours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  prerequisites?: string[]; // other learning path IDs
  outcomes: string[]; // what the user will learn
}

export interface UserLearningState {
  userId: string;
  activePath?: string; // learning path ID
  completedLessons: string[];
  inProgressLessons: Record<string, LessonProgress>;
  masteredConcepts: string[];
  strugglingConcepts: string[];
  totalTimeSpent: number; // seconds
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string;
  };
}
