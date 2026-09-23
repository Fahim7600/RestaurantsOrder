"use client";

import { useState } from "react";
import Link from "next/link";
import { getFeaturedDishes } from "@/data/featured";
import { MenuItem } from "@/lib/types";
import MenuCard from "@/components/menu/MenuCard";
import MenuItemModal from "@/components/menu/MenuItemModal";
import { Sparkles, ArrowRight } from "lucide-react";

export default function SignatureDishes() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const featuredDishes = getFeaturedDishes();

  // If fewer than 3 resolve, skip section gracefully
  if (featuredDishes.length < 3) {
    return null;
  }

  return (
    <section className="py-12 bg-card/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Chef&apos;s Highlights
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Signature Dishes &amp; Crowd Favorites
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Explore All Dishes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDishes.map((dish) => (
            <MenuCard
              key={dish.id}
              item={dish}
              onSelect={(item) => setSelectedItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Modal on click */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}
