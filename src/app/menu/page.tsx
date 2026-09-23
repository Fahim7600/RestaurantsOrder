"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MENU_ITEMS, CUISINES, CATEGORIES } from "@/data/menu";
import { MenuItem, DietaryTag } from "@/lib/types";
import MenuCard from "@/components/menu/MenuCard";
import MenuFilters from "@/components/menu/MenuFilters";
import MenuItemModal from "@/components/menu/MenuItemModal";
import MenuEmptyState from "@/components/menu/MenuEmptyState";
import { Filter, Flame, X, Utensils } from "lucide-react";

const VALID_DIETARY_TAGS: DietaryTag[] = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "nut-free",
];

function MenuContent() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read URL query parameter presets on mount
  useEffect(() => {
    const cuisineParam = searchParams.get("cuisine");
    const categoryParam = searchParams.get("category");
    const dietaryParam = searchParams.get("dietary");

    if (cuisineParam) {
      const validCuisineIds = new Set(CUISINES.map((c) => c.id));
      const requested = cuisineParam.split(",").filter((id) => validCuisineIds.has(id));
      if (requested.length > 0) {
        setSelectedCuisines(requested);
      }
    }

    if (categoryParam) {
      const validCatIds = new Set(CATEGORIES.map((c) => c.id));
      const requested = categoryParam.split(",").filter((id) => validCatIds.has(id));
      if (requested.length > 0) {
        setSelectedCategories(requested);
      }
    }

    if (dietaryParam) {
      const requested = dietaryParam
        .split(",")
        .filter((tag): tag is DietaryTag =>
          VALID_DIETARY_TAGS.includes(tag as DietaryTag)
        );
      if (requested.length > 0) {
        setSelectedDietary(requested);
      }
    }
  }, [searchParams]);

  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedCuisines([]);
    setSelectedCategories([]);
    setSelectedDietary([]);
  };

  // Filter items dynamically with AND logic
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Cuisine Filter
      if (selectedCuisines.length > 0) {
        if (!selectedCuisines.includes(item.cuisineId)) return false;
      }

      // 3. Category Filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(item.categoryId)) return false;
      }

      // 4. Dietary Tags Filter (item must satisfy all selected dietary tags)
      if (selectedDietary.length > 0) {
        const hasAllTags = selectedDietary.every((tag) =>
          item.dietaryTags.includes(tag)
        );
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCuisines, selectedCategories, selectedDietary]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedCuisines.length +
    selectedCategories.length +
    selectedDietary.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Artisanal Menu</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Explore Our Culinary Creations
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover wood-fired delicacies, traditional recipes, and authentic global flavors.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm shadow-sm hover:border-primary/50 transition-colors"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter Menu</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-6 shadow-sm">
            <MenuFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCuisines={selectedCuisines}
              setSelectedCuisines={setSelectedCuisines}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedDietary={selectedDietary}
              setSelectedDietary={setSelectedDietary}
              onClearAll={handleClearAll}
              totalResults={filteredItems.length}
            />
          </div>
        </aside>

        {/* Mobile Slide-Over Filter Panel */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-card h-full p-6 space-y-6 overflow-y-auto border-l border-border shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Filters
                    </h2>
                  </div>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <MenuFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCuisines={selectedCuisines}
                  setSelectedCuisines={setSelectedCuisines}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedDietary={selectedDietary}
                  setSelectedDietary={setSelectedDietary}
                  onClearAll={handleClearAll}
                  totalResults={filteredItems.length}
                />
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md"
                >
                  Show {filteredItems.length} Dishes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Grid Column */}
        <main className="lg:col-span-9 space-y-6">
          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-secondary/40 border border-border">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Active filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-foreground font-medium">
                  &quot;{searchQuery}&quot;
                  <X
                    className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </span>
              )}

              {selectedCuisines.map((id) => {
                const name = CUISINES.find((c) => c.id === id)?.name || id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-accent font-medium"
                  >
                    {name}
                    <X
                      className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400 cursor-pointer"
                      onClick={() =>
                        setSelectedCuisines(selectedCuisines.filter((c) => c !== id))
                      }
                    />
                  </span>
                );
              })}

              {selectedCategories.map((id) => {
                const name = CATEGORIES.find((c) => c.id === id)?.name || id;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-foreground font-medium"
                  >
                    {name}
                    <X
                      className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400 cursor-pointer"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== id)
                        )
                      }
                    />
                  </span>
                );
              })}

              {selectedDietary.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-emerald-400 font-medium uppercase"
                >
                  {tag}
                  <X
                    className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400 cursor-pointer"
                    onClick={() =>
                      setSelectedDietary(selectedDietary.filter((t) => t !== tag))
                    }
                  />
                </span>
              ))}

              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-primary hover:underline ml-auto pl-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
            <span>Showing {filteredItems.length} of {MENU_ITEMS.length} dishes</span>
          </div>

          {/* Grid or Empty State */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onSelect={(item) => setSelectedItem(item)}
                />
              ))}
            </div>
          ) : (
            <MenuEmptyState onClearFilters={handleClearAll} />
          )}
        </main>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="h-16 bg-card rounded-2xl border border-border" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 h-96 bg-card rounded-2xl border border-border" />
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-2xl border border-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent />
    </Suspense>
  );
}
