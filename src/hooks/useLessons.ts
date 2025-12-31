"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/stores/userStore";
import { trackLessonProgress, TimeTracker } from "@/lib/events";
import type {
  InteractiveLesson,
  LessonProgress,
  LessonBlock,
  LearningPath,
} from "@/types/lesson";

interface UseLessonsOptions {
  lessonId?: string;
}

// Mock lessons data (in production, fetch from backend)
const mockLessons: InteractiveLesson[] = [
  {
    id: "intro-ai",
    title: "Introducción a la Inteligencia Artificial",
    description: "Aprende los conceptos fundamentales de la IA",
    estimatedMinutes: 15,
    difficulty: "beginner",
    tags: ["IA", "Fundamentos"],
    concepts: ["machine-learning", "neural-networks"],
    prerequisites: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: [
      {
        type: "content",
        markdown: `# ¿Qué es la Inteligencia Artificial?

La **Inteligencia Artificial (IA)** es un campo de la informática que se enfoca en crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana.

## Tipos principales de IA

1. **IA Estrecha (Narrow AI)**: Diseñada para tareas específicas
2. **IA General (AGI)**: Capacidad cognitiva similar a la humana
3. **Superinteligencia**: Supera la inteligencia humana

> La IA ya está presente en tu vida diaria: desde asistentes virtuales hasta recomendaciones de contenido.`,
      },
      {
        type: "quiz",
        question: "¿Cuál de los siguientes es un ejemplo de IA Estrecha?",
        options: [
          "Un robot que puede hacer cualquier tarea",
          "Un asistente virtual como Siri o Alexa",
          "Un sistema que supera la inteligencia humana",
          "Ninguna de las anteriores",
        ],
        correctIndex: 1,
        explanation:
          "Los asistentes virtuales como Siri o Alexa son ejemplos de IA Estrecha porque están diseñados para tareas específicas.",
        points: 10,
      },
      {
        type: "content",
        markdown: `## Machine Learning

El **Machine Learning** (Aprendizaje Automático) es una rama de la IA que permite a los sistemas aprender de datos sin ser programados explícitamente.

### Tipos de aprendizaje:

- **Supervisado**: Aprende de datos etiquetados
- **No supervisado**: Encuentra patrones en datos sin etiquetar
- **Por refuerzo**: Aprende mediante prueba y error`,
      },
      {
        type: "exercise",
        prompt:
          "Describe en tus propias palabras qué es el Machine Learning y da un ejemplo de su uso en la vida real.",
        hints: [
          "Piensa en aplicaciones que usas diariamente",
          "Considera cómo las apps aprenden de tu comportamiento",
        ],
      },
      {
        type: "ai-interaction",
        context:
          "El estudiante está aprendiendo sobre IA y Machine Learning. Ayúdale a profundizar en los conceptos.",
        suggestedQuestions: [
          "¿Cómo funciona exactamente el aprendizaje supervisado?",
          "¿Cuáles son las aplicaciones más comunes del ML?",
          "¿Necesito saber programar para trabajar en IA?",
        ],
      },
      {
        type: "reflection",
        prompt:
          "Reflexiona sobre cómo la IA podría impactar tu campo profesional o área de estudio en los próximos 5 años.",
        guidingQuestions: [
          "¿Qué tareas de tu trabajo podrían automatizarse?",
          "¿Qué nuevas habilidades serán importantes?",
          "¿Ves la IA como una amenaza o una oportunidad?",
        ],
      },
      {
        type: "quiz",
        question:
          "¿Qué tipo de aprendizaje automático se usa cuando tenemos datos con etiquetas conocidas?",
        options: [
          "Aprendizaje no supervisado",
          "Aprendizaje por refuerzo",
          "Aprendizaje supervisado",
          "Aprendizaje profundo",
        ],
        correctIndex: 2,
        explanation:
          "El aprendizaje supervisado utiliza datos etiquetados para entrenar modelos que pueden hacer predicciones.",
        points: 10,
      },
    ],
  },
];

export function useLessons(options: UseLessonsOptions = {}) {
  const { data: session } = useSession();
  const tenantId = useUserStore((state) => state.tenantId);

  const [lesson, setLesson] = useState<InteractiveLesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeTracker] = useState(() => new TimeTracker());

  // Fetch lesson
  useEffect(() => {
    if (options.lessonId) {
      fetchLesson(options.lessonId);
    }
  }, [options.lessonId]);

  const fetchLesson = async (lessonId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, fetch from backend
      const foundLesson = mockLessons.find((l) => l.id === lessonId);
      if (!foundLesson) {
        throw new Error("Lección no encontrada");
      }

      setLesson(foundLesson);

      // Initialize progress
      setProgress({
        lessonId,
        userId: session?.user?.id || "anonymous",
        currentBlockIndex: 0,
        completedBlocks: [],
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        score: 0,
        timeSpent: 0,
        quizScores: {},
        exerciseSubmissions: {},
        reflections: {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const goToBlock = useCallback(
    (index: number) => {
      if (!lesson) return;
      if (index < 0 || index >= lesson.blocks.length) return;

      // Track time on previous block
      const timeSpent = timeTracker.getElapsedSeconds();
      if (lesson.blocks[currentBlockIndex]) {
        trackLessonProgress(
          lesson.id,
          currentBlockIndex,
          lesson.blocks[currentBlockIndex].type,
          "completed",
          timeSpent,
          { tenantId, userId: session?.user?.id }
        );
      }

      // Reset timer for new block
      timeTracker.reset();
      setCurrentBlockIndex(index);

      // Track start of new block
      trackLessonProgress(
        lesson.id,
        index,
        lesson.blocks[index].type,
        "started",
        0,
        { tenantId, userId: session?.user?.id }
      );
    },
    [lesson, currentBlockIndex, timeTracker, tenantId, session]
  );

  const nextBlock = useCallback(() => {
    if (!lesson) return;
    if (currentBlockIndex < lesson.blocks.length - 1) {
      goToBlock(currentBlockIndex + 1);
    }
  }, [lesson, currentBlockIndex, goToBlock]);

  const previousBlock = useCallback(() => {
    if (currentBlockIndex > 0) {
      goToBlock(currentBlockIndex - 1);
    }
  }, [currentBlockIndex, goToBlock]);

  const completeBlock = useCallback(
    (blockIndex: number, data?: { score?: number; submission?: string }) => {
      setProgress((prev) => {
        if (!prev) return prev;

        const newProgress = { ...prev };
        if (!newProgress.completedBlocks.includes(blockIndex)) {
          newProgress.completedBlocks.push(blockIndex);
        }

        if (data?.score !== undefined) {
          newProgress.quizScores[blockIndex] = data.score;
          newProgress.score += data.score;
        }

        if (data?.submission) {
          newProgress.exerciseSubmissions[blockIndex] = data.submission;
        }

        newProgress.lastAccessedAt = new Date();
        newProgress.timeSpent += timeTracker.getElapsedSeconds();

        return newProgress;
      });
    },
    [timeTracker]
  );

  const submitQuizAnswer = useCallback(
    (blockIndex: number, selectedIndex: number): boolean => {
      if (!lesson) return false;

      const block = lesson.blocks[blockIndex];
      if (block.type !== "quiz") return false;

      const isCorrect = selectedIndex === block.correctIndex;
      const score = isCorrect ? (block.points || 10) : 0;

      completeBlock(blockIndex, { score });

      trackLessonProgress(
        lesson.id,
        blockIndex,
        "quiz",
        "completed",
        timeTracker.getElapsedSeconds(),
        {
          tenantId,
          userId: session?.user?.id,
          score,
        }
      );

      return isCorrect;
    },
    [lesson, completeBlock, timeTracker, tenantId, session]
  );

  const submitExercise = useCallback(
    (blockIndex: number, submission: string) => {
      if (!lesson) return;

      completeBlock(blockIndex, { submission });

      trackLessonProgress(
        lesson.id,
        blockIndex,
        "exercise",
        "completed",
        timeTracker.getElapsedSeconds(),
        { tenantId, userId: session?.user?.id }
      );
    },
    [lesson, completeBlock, timeTracker, tenantId, session]
  );

  const submitReflection = useCallback(
    (blockIndex: number, reflection: string) => {
      setProgress((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reflections: { ...prev.reflections, [blockIndex]: reflection },
        };
      });

      if (lesson) {
        trackLessonProgress(
          lesson.id,
          blockIndex,
          "reflection",
          "completed",
          timeTracker.getElapsedSeconds(),
          { tenantId, userId: session?.user?.id }
        );
      }
    },
    [lesson, timeTracker, tenantId, session]
  );

  const isBlockCompleted = useCallback(
    (blockIndex: number): boolean => {
      return progress?.completedBlocks.includes(blockIndex) ?? false;
    },
    [progress]
  );

  const getProgressPercentage = useCallback((): number => {
    if (!lesson || !progress) return 0;
    return Math.round(
      (progress.completedBlocks.length / lesson.blocks.length) * 100
    );
  }, [lesson, progress]);

  const isLessonComplete = useCallback((): boolean => {
    if (!lesson || !progress) return false;
    return progress.completedBlocks.length >= lesson.blocks.length;
  }, [lesson, progress]);

  return {
    // State
    lesson,
    progress,
    currentBlockIndex,
    currentBlock: lesson?.blocks[currentBlockIndex] ?? null,
    isLoading,
    error,

    // Navigation
    goToBlock,
    nextBlock,
    previousBlock,

    // Actions
    completeBlock,
    submitQuizAnswer,
    submitExercise,
    submitReflection,

    // Helpers
    isBlockCompleted,
    getProgressPercentage,
    isLessonComplete,
    totalBlocks: lesson?.blocks.length ?? 0,
  };
}

// Hook to fetch learning paths
export function useLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data
    setPaths([
      {
        id: "ai-fundamentals",
        title: "Fundamentos de IA",
        description: "Aprende los conceptos básicos de la Inteligencia Artificial",
        lessons: ["intro-ai", "ml-basics", "neural-networks"],
        estimatedHours: 4,
        difficulty: "beginner",
        tags: ["IA", "Machine Learning"],
        outcomes: [
          "Entender qué es la IA",
          "Conocer los tipos de aprendizaje automático",
          "Saber aplicar IA en tu campo",
        ],
      },
    ]);
  }, []);

  return { paths, isLoading };
}



