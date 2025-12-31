"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizBlock as QuizBlockType } from "@/types/lesson";
import { Check, X, HelpCircle, Lightbulb } from "lucide-react";

interface QuizBlockProps {
  block: QuizBlockType;
  onSubmit: (selectedIndex: number) => boolean;
  isCompleted: boolean;
  previousAnswer?: number;
}

export function QuizBlock({
  block,
  onSubmit,
  isCompleted,
  previousAnswer,
}: QuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    previousAnswer ?? null
  );
  const [isSubmitted, setIsSubmitted] = useState(isCompleted);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    isCompleted ? previousAnswer === block.correctIndex : null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    const correct = onSubmit(selectedIndex);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const getOptionStyle = (index: number) => {
    if (!isSubmitted) {
      return selectedIndex === index
        ? "border-primary bg-primary/10"
        : "border-border hover:border-primary/50";
    }

    if (index === block.correctIndex) {
      return "border-emerald-500 bg-emerald-500/10";
    }

    if (index === selectedIndex && !isCorrect) {
      return "border-destructive bg-destructive/10";
    }

    return "border-border opacity-50";
  };

  return (
    <Card className="glass">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pregunta</p>
            <h3 className="font-semibold">{block.question}</h3>
          </div>
          {block.points && (
            <div className="ml-auto px-2 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium">
              {block.points} pts
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {block.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={!isSubmitted ? { scale: 1.01 } : {}}
              whileTap={!isSubmitted ? { scale: 0.99 } : {}}
              onClick={() => !isSubmitted && setSelectedIndex(index)}
              disabled={isSubmitted}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                getOptionStyle(index)
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  selectedIndex === index
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {isSubmitted && index === block.correctIndex && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
                {isSubmitted && index === selectedIndex && !isCorrect && (
                  <X className="w-4 h-4 text-destructive-foreground" />
                )}
              </div>
              <span className="flex-1">{option}</span>
            </motion.button>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  isCorrect
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium">¡Correcto!</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    <span className="font-medium">Incorrecto</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explanation */}
        {isSubmitted && block.explanation && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showExplanation ? "Ocultar explicación" : "Ver explicación"}
            </Button>

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-secondary/50 text-sm"
                >
                  {block.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="w-full"
          >
            Verificar respuesta
          </Button>
        )}
      </CardContent>
    </Card>
  );
}



