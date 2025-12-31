"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AdaptiveCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  size?: "small" | "medium" | "large";
  className?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: "default" | "accent" | "primary";
}

export function AdaptiveCard({
  title,
  description,
  icon,
  size = "medium",
  className,
  children,
  action,
  variant = "default",
}: AdaptiveCardProps) {
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-1 md:col-span-2",
    large: "col-span-1 md:col-span-2 lg:col-span-3",
  };

  const variantClasses = {
    default: "glass",
    accent: "glass border-accent/30 bg-accent/5",
    primary: "glass border-primary/30 bg-primary/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(sizeClasses[size], className)}
    >
      <Card className={cn("h-full", variantClasses[variant])}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                  <CardDescription className="mt-0.5">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}



