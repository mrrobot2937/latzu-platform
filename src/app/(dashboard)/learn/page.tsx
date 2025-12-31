"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLearningPaths } from "@/hooks/useLessons";
import {
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
} from "lucide-react";

// Mock lessons for display
const lessons = [
  {
    id: "intro-ai",
    title: "Introducción a la Inteligencia Artificial",
    description: "Aprende los conceptos fundamentales de la IA",
    estimatedMinutes: 15,
    difficulty: "beginner",
    tags: ["IA", "Fundamentos"],
    progress: 0,
    isLocked: false,
  },
  {
    id: "ml-basics",
    title: "Fundamentos de Machine Learning",
    description: "Descubre cómo las máquinas aprenden de los datos",
    estimatedMinutes: 25,
    difficulty: "beginner",
    tags: ["Machine Learning"],
    progress: 0,
    isLocked: true,
  },
  {
    id: "neural-networks",
    title: "Redes Neuronales",
    description: "Entiende la arquitectura detrás del deep learning",
    estimatedMinutes: 30,
    difficulty: "intermediate",
    tags: ["Deep Learning", "Redes Neuronales"],
    progress: 0,
    isLocked: true,
  },
];

export default function LearnPage() {
  const { paths } = useLearningPaths();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold mb-2">Aprendizaje</h1>
        <p className="text-muted-foreground">
          Explora lecciones interactivas diseñadas para ti
        </p>
      </div>

      {/* Learning Paths */}
      {paths.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rutas de Aprendizaje</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {paths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">
                          {path.difficulty}
                        </Badge>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {path.description}
                        </CardDescription>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{path.lessons.length} lecciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimatedHours}h estimadas</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span className="text-muted-foreground">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {path.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/learn/${path.lessons[0]}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Comenzar ruta
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Individual Lessons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Lecciones Disponibles</h2>
        <div className="grid gap-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`glass transition-colors ${
                  lesson.isLocked
                    ? "opacity-60"
                    : "hover:border-primary/50 cursor-pointer"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        lesson.progress === 100
                          ? "bg-emerald-500/10"
                          : lesson.isLocked
                          ? "bg-muted"
                          : "bg-primary/10"
                      }`}
                    >
                      {lesson.progress === 100 ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : lesson.isLocked ? (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{lesson.title}</h3>
                        <Badge variant="outline" className="capitalize text-xs">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes} min
                        </span>
                        <div className="flex gap-1">
                          {lesson.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress / Action */}
                    <div className="flex-shrink-0">
                      {lesson.isLocked ? (
                        <span className="text-sm text-muted-foreground">
                          Completa la anterior
                        </span>
                      ) : lesson.progress > 0 && lesson.progress < 100 ? (
                        <div className="text-center">
                          <Progress value={lesson.progress} className="w-20 h-2 mb-1" />
                          <span className="text-xs text-muted-foreground">
                            {lesson.progress}%
                          </span>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/learn/${lesson.id}`}>
                            {lesson.progress === 100 ? "Revisar" : "Empezar"}
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}



