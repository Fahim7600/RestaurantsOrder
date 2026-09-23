"use client";

import Link from "next/link";
import { CUISINES } from "@/data/menu";
import { Utensils, ArrowRight } from "lucide-react";

export default function CuisineStrip() {
  return (
    <section className="py-12 bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Explore Cuisines
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              A World of Culinary Traditions
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CUISINES.map((cuisine) => (
            <Link
              key={cuisine.id}
              href={`/menu?cuisine=${cuisine.id}`}
              className="group p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/60 hover:bg-secondary/60 transition-all duration-300 flex flex-col items-center text-center space-y-3 shadow-sm hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary group-hover:bg-primary/15 text-accent group-hover:text-primary border border-border group-hover:border-primary/30 flex items-center justify-center transition-all">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {cuisine.name}
                </h3>
                <span className="text-[10px] text-muted-foreground group-hover:text-accent transition-colors">
                  Explore Dishes →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
