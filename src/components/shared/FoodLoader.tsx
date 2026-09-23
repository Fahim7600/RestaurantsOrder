"use client";

import { Flame, Utensils, Sparkles } from "lucide-react";

interface FoodLoaderProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Food-themed loading component:
 * - Animated flame & cooking icons with "Warming up the kitchen..."
 * - Respects prefers-reduced-motion
 */
export default function FoodLoader({
  message = "Warming up the kitchen...",
  className = "",
  size = "md",
}: FoodLoaderProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 select-none ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing background ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />

        {/* Icon container */}
        <div className="w-16 h-16 rounded-2xl bg-card border border-primary/30 text-primary flex items-center justify-center shadow-lg shadow-primary/20 relative z-10">
          <Flame className={`${iconSizes[size]} animate-bounce motion-reduce:animate-none text-primary`} />
        </div>

        {/* Accent floating sparkles */}
        <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-spin motion-reduce:animate-none z-20" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold font-serif text-foreground tracking-wide">
          {message}
        </p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Utensils className="w-3 h-3 text-accent" /> Flame &amp; Spice Kitchen
        </p>
      </div>
    </div>
  );
}

/**
 * Small button spinner variant for submit buttons e.g. "Place order", "Book a table"
 */
export function FoodSpinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Flame
      className={`${className} animate-spin motion-reduce:animate-none text-white inline-block`}
      aria-hidden="true"
    />
  );
}
