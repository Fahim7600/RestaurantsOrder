"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Flame, CheckCircle2, X } from "lucide-react";

export default function Toast() {
  const toast = useCartStore((state) => state.toast);
  const clearToast = useCartStore((state) => state.clearToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-md border border-primary/40 shadow-xl shadow-primary/10 text-foreground max-w-sm">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-white animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toast.message}</span>
          </div>
          <div className="text-xs font-semibold text-foreground truncate">
            {toast.dishName}
          </div>
        </div>

        <button
          onClick={clearToast}
          className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
