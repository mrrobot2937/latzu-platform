"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { LessonBlock } from "@/types/lesson";
import {
  FileText,
  HelpCircle,
  PenTool,
  MessageSquare,
  Lightbulb,
  Check,
} from "lucide-react";

interface ProgressTrackerProps {
  blocks: LessonBlock[];
  currentIndex: number;
  completedBlocks: number[];
  onBlockClick: (index: number) => void;
}

const blockIcons = {
  content: FileText,
  quiz: HelpCircle,
  exercise: PenTool,
  reflection: Lightbulb,
  "ai-interaction": MessageSquare,
  video: FileText,
  code: FileText,
};

export function ProgressTracker({
  blocks,
  currentIndex,
  completedBlocks,
  onBlockClick,
}: ProgressTrackerProps) {
  const progressPercentage = Math.round((completedBlocks.length / blocks.length) * 100);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Block Indicators */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {blocks.map((block, index) => {
            const Icon = blockIcons[block.type] || FileText;
            const isCompleted = completedBlocks.includes(index);
            const isCurrent = index === currentIndex;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onBlockClick(index)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                      "border-2",
                      isCurrent && "border-primary bg-primary/10 ring-2 ring-primary/30",
                      isCompleted && !isCurrent && "border-emerald-500 bg-emerald-500/10",
                      !isCurrent && !isCompleted && "border-border hover:border-primary/50"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{block.type.replace("-", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? "Completado" : isCurrent ? "Actual" : "Pendiente"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}



