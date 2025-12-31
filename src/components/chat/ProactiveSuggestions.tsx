"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProactiveSuggestion } from "@/types/chat";
import { Sparkles, X, BookOpen, Target, Lightbulb, MessageSquare } from "lucide-react";

interface ProactiveSuggestionsProps {
  suggestions: ProactiveSuggestion[];
  onSuggestionClick: (suggestion: ProactiveSuggestion) => void;
  onDismiss: (id: string) => void;
  show: boolean;
  onToggle: () => void;
}

const suggestionIcons = {
  task: Target,
  concept: BookOpen,
  exercise: Lightbulb,
  reminder: MessageSquare,
  tip: Sparkles,
};

export function ProactiveSuggestions({
  suggestions,
  onSuggestionClick,
  onDismiss,
  show,
  onToggle,
}: ProactiveSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Sugerencias ({suggestions.length})</span>
        </button>
        {show && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            Ocultar
          </Button>
        )}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {suggestions.slice(0, 3).map((suggestion, index) => {
              const Icon = suggestionIcons[suggestion.type] || Sparkles;

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {suggestion.title}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {suggestion.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {suggestion.description}
                      </p>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-7 px-2 text-xs"
                          onClick={() => onSuggestionClick(suggestion)}
                        >
                          {suggestion.action.label}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDismiss(suggestion.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



