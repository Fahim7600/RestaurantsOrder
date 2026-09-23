import Link from "next/link";
import { Utensils, Home, Flame, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] py-16 px-4 flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border/80 text-center space-y-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center mx-auto shadow-md">
          <Flame className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest">
            404 — Page Not Found
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            This Dish is Off the Menu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We couldn&apos;t find the page you were looking for. It might have been moved or removed from our kitchen rotation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
          >
            <Home className="w-4 h-4 text-accent" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/25 transition-all"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
