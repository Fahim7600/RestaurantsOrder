import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-secondary border border-border text-accent flex items-center justify-center mx-auto">
        <User className="w-8 h-8" />
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Guest Profile & Preferences
      </h1>
      <p className="text-muted-foreground max-w-xl mx-auto">
        This placeholder route confirms user profile navigation. User account and order history management will be added in upcoming prompts.
      </p>
    </div>
  );
}
