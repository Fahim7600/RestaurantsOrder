"use client";

import { CATEGORIES, CUISINES } from "@/data/menu";
import { DietaryTag } from "@/lib/types";
import { Search, X, Filter, RotateCcw, Utensils, Check } from "lucide-react";

interface MenuFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[] | ((prev: string[]) => string[])) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
  selectedDietary: DietaryTag[];
  setSelectedDietary: (tags: DietaryTag[] | ((prev: DietaryTag[]) => DietaryTag[])) => void;
  onClearAll: () => void;
  totalResults: number;
}

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "nut-free", label: "Nut-Free" },
];

export default function MenuFilters({
  searchQuery,
  setSearchQuery,
  selectedCuisines,
  setSelectedCuisines,
  selectedCategories,
  setSelectedCategories,
  selectedDietary,
  setSelectedDietary,
  onClearAll,
  totalResults,
}: MenuFiltersProps) {
  const toggleCuisine = (id: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleDietary = (tag: DietaryTag) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const activeCount =
    (searchQuery ? 1 : 0) +
    selectedCuisines.length +
    selectedCategories.length +
    selectedDietary.length;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dish name or ingredient..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Bar */}
      {activeCount > 0 && (
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Active Filters ({activeCount})
            </span>
            <button
              onClick={onClearAll}
              className="text-[11px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-xs text-foreground border border-border">
                &quot;{searchQuery}&quot;
                <X
                  className="w-3 h-3 cursor-pointer hover:text-primary"
                  onClick={() => setSearchQuery("")}
                />
              </span>
            )}

            {selectedCuisines.map((id) => {
              const c = CUISINES.find((item) => item.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium border border-primary/20"
                >
                  {c?.name || id}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-foreground"
                    onClick={() => toggleCuisine(id)}
                  />
                </span>
              );
            })}

            {selectedCategories.map((id) => {
              const cat = CATEGORIES.find((item) => item.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-medium border border-accent/20"
                >
                  {cat?.name || id}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-foreground"
                    onClick={() => toggleCategory(id)}
                  />
                </span>
              );
            })}

            {selectedDietary.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20"
              >
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleDietary(tag)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cuisines Section */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Cuisines</span>
          {selectedCuisines.length > 0 && (
            <span className="text-xs text-accent font-sans">{selectedCuisines.length} selected</span>
          )}
        </h4>
        <div className="space-y-1.5">
          {CUISINES.map((c) => {
            const isChecked = selectedCuisines.includes(c.id);
            return (
              <label
                key={c.id}
                onClick={() => toggleCuisine(c.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "bg-primary/10 border-primary text-primary font-semibold"
                    : "bg-card border-border/80 text-foreground/80 hover:border-border hover:bg-secondary/50"
                }`}
              >
                <span>{c.name}</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isChecked
                      ? "bg-primary border-primary text-white"
                      : "border-border/80 bg-background"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Categories</span>
          {selectedCategories.length > 0 && (
            <span className="text-xs text-accent font-sans">{selectedCategories.length} selected</span>
          )}
        </h4>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "bg-accent/10 border-accent text-accent font-semibold"
                    : "bg-card border-border/80 text-foreground/80 hover:border-border hover:bg-secondary/50"
                }`}
              >
                <span>{cat.name}</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isChecked
                      ? "bg-accent border-accent text-background font-bold"
                      : "border-border/80 bg-background"
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dietary Tags Section */}
      <div className="space-y-3">
        <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
          <span>Dietary Preferences</span>
          {selectedDietary.length > 0 && (
            <span className="text-xs text-accent font-sans">{selectedDietary.length} selected</span>
          )}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {DIETARY_OPTIONS.map((option) => {
            const isChecked = selectedDietary.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleDietary(option.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  isChecked
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold shadow-sm"
                    : "bg-card border-border/80 text-foreground/80 hover:border-border"
                }`}
              >
                {isChecked && <Check className="w-3 h-3" />}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
