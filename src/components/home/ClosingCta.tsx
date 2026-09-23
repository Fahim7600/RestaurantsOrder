"use client";

import Link from "next/link";
import { Utensils, Calendar, Flame, ArrowRight } from "lucide-react";

export default function ClosingCta() {
  return (
    <section className="py-16 bg-gradient-to-r from-card via-secondary/70 to-card border-b border-border/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center mx-auto shadow-lg">
          <Flame className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Ready for a Taste of Perfection?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re ordering takeaway for a cozy evening or reserving a table for celebration, Flame &amp; Spice awaits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-105 transition-all"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu &amp; Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm border border-border/80 hover:border-accent/50 transition-all"
          >
            <Calendar className="w-4 h-4 text-accent" />
            <span>Reserve Your Table</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
