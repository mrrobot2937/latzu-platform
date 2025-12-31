"use client";

import { use } from "react";
import { InteractiveLesson } from "@/components/lessons/InteractiveLesson";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="max-w-4xl mx-auto">
      <InteractiveLesson lessonId={resolvedParams.lessonId} />
    </div>
  );
}



