"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Flame, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Global error caught:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-rose-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
            <Flame className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Critical Kitchen Outage
            </h1>
            <p className="text-xs text-muted-foreground">
              A global application error occurred. Click below to reload.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
