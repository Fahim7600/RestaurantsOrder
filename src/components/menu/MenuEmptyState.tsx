import { UtensilsCrossed, RotateCcw } from "lucide-react";

interface MenuEmptyStateProps {
  onClearFilters: () => void;
}

export default function MenuEmptyState({ onClearFilters }: MenuEmptyStateProps) {
  return (
    <div className="p-12 rounded-3xl bg-card border border-border/80 text-center space-y-5 max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
        <UtensilsCrossed className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground">
          No Dishes Found
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We couldn&apos;t find any culinary items matching your selected filter combination or search query.
        </p>
      </div>

      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-accent font-semibold text-xs border border-border transition-all hover:scale-105"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset All Filters</span>
      </button>
    </div>
  );
}
