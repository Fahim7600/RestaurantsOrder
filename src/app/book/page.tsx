import { Users, Clock, Calendar } from "lucide-react";

export default function BookPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto">
        <Calendar className="w-8 h-8" />
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Reserve a Table
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        This placeholder route confirms reservation navigation and layout consistency. Table booking functionality will be built in subsequent prompts.
      </p>
    </div>
  );
}
