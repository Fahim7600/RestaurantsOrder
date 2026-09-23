import FoodLoader from "@/components/shared/FoodLoader";

export default function MenuLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex flex-col items-center justify-center space-y-8">
      <FoodLoader message="Preparing the menu..." />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-card rounded-2xl border border-border" />
        ))}
      </div>
    </div>
  );
}
