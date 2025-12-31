"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QuizBlock } from "./QuizBlock";
import { ProgressTracker } from "./ProgressTracker";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useLessons } from "@/hooks/useLessons";
import type { LessonBlock } from "@/types/lesson";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Lightbulb,
  PenTool,
  Clock,
  Award,
  Send,
} from "lucide-react";

interface InteractiveLessonProps {
  lessonId: string;
}

export function InteractiveLesson({ lessonId }: InteractiveLessonProps) {
  const {
    lesson,
    progress,
    currentBlockIndex,
    currentBlock,
    isLoading,
    error,
    nextBlock,
    previousBlock,
    goToBlock,
    submitQuizAnswer,
    submitExercise,
    submitReflection,
    isBlockCompleted,
    getProgressPercentage,
    isLessonComplete,
    totalBlocks,
  } = useLessons({ lessonId });

  const [exerciseInput, setExerciseInput] = useState("");
  const [reflectionInput, setReflectionInput] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-primary/20" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <p className="text-destructive">{error || "Lección no encontrada"}</p>
          <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderBlock = (block: LessonBlock, index: number) => {
    switch (block.type) {
      case "content":
        return <ContentBlock key={index} block={block} />;

      case "quiz":
        return (
          <QuizBlock
            key={index}
            block={block}
            onSubmit={(selected) => submitQuizAnswer(index, selected)}
            isCompleted={isBlockCompleted(index)}
            previousAnswer={progress?.quizScores[index] !== undefined ? undefined : undefined}
          />
        );

      case "exercise":
        return (
          <ExerciseBlock
            key={index}
            block={block}
            value={exerciseInput}
            onChange={setExerciseInput}
            onSubmit={() => {
              submitExercise(index, exerciseInput);
              setExerciseInput("");
            }}
            isCompleted={isBlockCompleted(index)}
            submission={progress?.exerciseSubmissions[index]}
          />
        );

      case "reflection":
        return (
          <ReflectionBlock
            key={index}
            block={block}
            value={reflectionInput}
            onChange={setReflectionInput}
            onSubmit={() => {
              submitReflection(index, reflectionInput);
              setReflectionInput("");
            }}
            isCompleted={isBlockCompleted(index)}
            previousReflection={progress?.reflections[index]}
          />
        );

      case "ai-interaction":
        return (
          <AIInteractionBlock
            key={index}
            block={block}
            showChat={showAIChat}
            onToggleChat={() => setShowAIChat(!showAIChat)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {lesson.difficulty}
                </Badge>
                {lesson.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{lesson.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedMinutes} min</span>
              </div>
              {progress && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{progress.score} pts</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressTracker
            blocks={lesson.blocks}
            currentIndex={currentBlockIndex}
            completedBlocks={progress?.completedBlocks || []}
            onBlockClick={goToBlock}
          />
        </CardContent>
      </Card>

      {/* Current Block */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlockIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {currentBlock && renderBlock(currentBlock, currentBlockIndex)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousBlock}
          disabled={currentBlockIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentBlockIndex + 1} / {totalBlocks}
        </span>

        {currentBlockIndex < totalBlocks - 1 ? (
          <Button onClick={nextBlock}>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (isLessonComplete()) {
                // Navigate to completion or next lesson
                window.location.href = "/learn";
              }
            }}
            disabled={!isLessonComplete()}
          >
            <Award className="w-4 h-4 mr-2" />
            Completar
          </Button>
        )}
      </div>
    </div>
  );
}

// Content Block Component
function ContentBlock({ block }: { block: { type: "content"; markdown: string } }) {
  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Contenido</span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

// Exercise Block Component
function ExerciseBlock({
  block,
  value,
  onChange,
  onSubmit,
  isCompleted,
  submission,
}: {
  block: { type: "exercise"; prompt: string; hints?: string[] };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isCompleted: boolean;
  submission?: string;
}) {
  const [showHints, setShowHints] = useState(false);

  return (
    <Card className="glass">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <PenTool className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Ejercicio</p>
            <p className="font-medium">{block.prompt}</p>
          </div>
        </div>

        {block.hints && block.hints.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showHints ? "Ocultar pistas" : "Ver pistas"}
            </Button>
            {showHints && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {block.hints.map((hint, i) => (
                  <li key={i}>• {hint}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isCompleted && submission ? (
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm font-medium mb-1">Tu respuesta:</p>
            <p className="text-sm text-muted-foreground">{submission}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="min-h-[120px]"
            />
            <Button onClick={onSubmit} disabled={!value.trim()} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Enviar respuesta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Reflection Block Component
function ReflectionBlock({
  block,
  value,
  onChange,
  onSubmit,
  isCompleted,
  previousReflection,
}: {
  block: { type: "reflection"; prompt: string; guidingQuestions?: string[] };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isCompleted: boolean;
  previousReflection?: string;
}) {
  return (
    <Card className="glass border-primary/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reflexión</p>
            <p className="font-medium">{block.prompt}</p>
          </div>
        </div>

        {block.guidingQuestions && block.guidingQuestions.length > 0 && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs font-medium mb-2">Preguntas guía:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {block.guidingQuestions.map((q, i) => (
                <li key={i}>• {q}</li>
              ))}
            </ul>
          </div>
        )}

        {isCompleted && previousReflection ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm">{previousReflection}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Comparte tus reflexiones..."
              className="min-h-[150px]"
            />
            <Button onClick={onSubmit} disabled={!value.trim()} variant="secondary" className="w-full">
              Guardar reflexión
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AI Interaction Block Component
function AIInteractionBlock({
  block,
  showChat,
  onToggleChat,
}: {
  block: { type: "ai-interaction"; context: string; suggestedQuestions?: string[] };
  showChat: boolean;
  onToggleChat: () => void;
}) {
  return (
    <Card className="glass border-accent/20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interacción con IA</p>
              <p className="font-medium">Conversa para profundizar</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onToggleChat}>
            {showChat ? "Minimizar" : "Abrir chat"}
          </Button>
        </div>

        {block.suggestedQuestions && !showChat && (
          <div className="flex flex-wrap gap-2">
            {block.suggestedQuestions.map((q, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-accent/20"
                onClick={onToggleChat}
              >
                {q}
              </Badge>
            ))}
          </div>
        )}

        {showChat && (
          <div className="h-[400px] border rounded-lg overflow-hidden">
            <ChatContainer className="h-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}



