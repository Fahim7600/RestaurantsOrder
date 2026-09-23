"use client";

import FoodImage from "@/components/shared/FoodImage";
import { MenuItem, DietaryTag } from "@/lib/types";
import { Leaf, Wheat, ShieldAlert, Flame, Utensils } from "lucide-react";
import { CUISINES } from "@/data/menu";

interface MenuCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function DietaryBadge({ tag }: { tag: DietaryTag }) {
  if (tag === "none") return null;

  switch (tag) {
    case "vegetarian":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
          <Leaf className="w-3 h-3" /> Veg
        </span>
      );
    case "vegan":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-semibold">
          <Leaf className="w-3 h-3" /> Vegan
        </span>
      );
    case "gluten-free":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
          <Wheat className="w-3 h-3" /> GF
        </span>
      );
    case "nut-free":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold">
          <ShieldAlert className="w-3 h-3" /> Nut-Free
        </span>
      );
    default:
      return null;
  }
}

export default function MenuCard({ item, onSelect }: MenuCardProps) {
  const cuisine = CUISINES.find((c) => c.id === item.cuisineId);

  return (
    <div
      onClick={() => onSelect(item)}
      className="group cursor-pointer rounded-2xl bg-card border border-border/80 overflow-hidden flex flex-col hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-secondary">
        <FoodImage
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Cuisine Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-md border border-border/80 text-accent text-xs font-semibold shadow-md flex items-center gap-1">
            <Utensils className="w-3 h-3 text-primary" />
            {cuisine?.name || item.cuisineId}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-xl bg-primary text-white font-display font-bold text-sm shadow-lg shadow-primary/30">
            ৳ {item.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
          {item.dietaryTags.map((tag) => (
            <DietaryBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}
