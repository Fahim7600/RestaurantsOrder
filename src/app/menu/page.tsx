"use client";

import { useState, useMemo } from "react";
import { MENU_ITEMS } from "@/data/menu";
import { MenuItem, DietaryTag } from "@/lib/types";
import MenuCard from "@/components/menu/MenuCard";
import MenuFilters from "@/components/menu/MenuFilters";
import MenuItemModal from "@/components/menu/MenuItemModal";
import MenuEmptyState from "@/components/menu/MenuEmptyState";
import { Filter, Flame, X, Utensils } from "lucide-react";

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

        {/* Mobile Filter Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-colors relative"
          >
            <Filter className="w-4 h-4 text-accent" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-28 h-fit">
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm">
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

        {/* Menu Grid Section */}
        <main className="lg:col-span-3 space-y-6">
          {/* Results Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-accent" />
              Showing <span className="text-accent">{filteredItems.length}</span> of{" "}
              {MENU_ITEMS.length} dishes
            </span>
            {activeFilterCount > 0 && (
              <span>
                Filtered by {activeFilterCount} criteria
              </span>
            )}
          </div>

          {/* Grid or Empty State */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onSelect={(selected) => setSelectedItem(selected)}
                />
              ))}
            </div>
          ) : (
            <MenuEmptyState onClearFilters={handleClearAll} />
          )}
        </main>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-card border-l border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-accent" /> Filter Dishes
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
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

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md mt-auto"
            >
              Apply Filters ({filteredItems.length} dishes)
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <MenuItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
