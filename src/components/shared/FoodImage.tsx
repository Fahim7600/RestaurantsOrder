"use client";

import { useState } from "react";
import Image from "next/image";
import { Utensils, Flame } from "lucide-react";

interface FoodImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g., "aspect-[4/3]", "aspect-square", "aspect-video"
}

/**
 * Resilient FoodImage component wrapping next/image:
 * - Fixed aspect ratio container (no layout shift)
 * - Shimmer skeleton overlay while loading
 * - On error -> renders charcoal fallback tile with dish name & food icon so dead Unsplash URLs never break UI
 * - Enforces accessible alt text and sizes
 */
export default function FoodImage({
  src,
  alt,
  fill = true,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = "object-cover transition-opacity duration-300",
  containerClassName = "",
  aspectRatio,
}: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // If image fails to load, render resilient fallback tile
  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full bg-secondary border border-border/80 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden relative ${
          aspectRatio ? aspectRatio : ""
        } ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-full bg-accent/15 text-accent border border-accent/30 flex items-center justify-center mb-2 shrink-0">
          <Utensils className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-foreground line-clamp-2 px-2">
          {alt}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Flame className="w-3 h-3 text-primary" /> Flame &amp; Spice
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${
        aspectRatio ? aspectRatio : "w-full h-full"
      } ${containerClassName}`}
    >
      {/* Shimmer skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-secondary/80 animate-pulse z-10 flex items-center justify-center">
          <Utensils className="w-6 h-6 text-muted-foreground/40 animate-pulse" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        className={`${className} ${
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
