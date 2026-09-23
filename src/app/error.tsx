"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Flame, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console only in development environment
    if (process.env.NODE_ENV === "development") {
      console.error("Runtime error caught by error boundary:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] py-16 px-4 flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-rose-500/30 text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-md">
          <Flame className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            Kitchen Error
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Something Burned in the Kitchen
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            An unexpected glitch occurred while loading this dish. Please try refreshing or return to the main dining room.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
          >
            <Home className="w-4 h-4 text-accent" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
