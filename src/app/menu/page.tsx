import { Utensils } from "lucide-react";

export default function MenuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
        <Utensils className="w-8 h-8" />
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Our Menu & Culinary Offerings
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        This placeholder route confirms the persistent layout and navbar navigation. The interactive menu experience will be implemented in subsequent steps.
      </p>
    </div>
  );
}
