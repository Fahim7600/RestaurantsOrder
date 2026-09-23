import { LARGE_GROUP_PHONE } from "@/lib/config";
import { Phone, Users, Sparkles, ArrowLeft } from "lucide-react";

interface LargeGroupCardProps {
  onReduceTo12: () => void;
}

export default function LargeGroupCard({ onReduceTo12 }: LargeGroupCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-secondary/60 to-card border border-accent/40 space-y-6 shadow-xl text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center shrink-0">
          <Users className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Large Party Dining
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Parties over 12 need a personal touch
          </h3>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        For celebrations, corporate events, and large gatherings over 12 guests, our culinary team prepares custom tasting menus and dedicated seating arrangements.
      </p>

      <div className="p-4 rounded-2xl bg-background/80 border border-border/80 space-y-2">
        <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
          What to share when calling:
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground text-left">
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>Exact Guest Count</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>Preferred Dining Area</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span>Special Dietary Needs</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={`tel:${LARGE_GROUP_PHONE}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-lg shadow-primary/25 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Call Host Team ({LARGE_GROUP_PHONE})</span>
        </a>

        <button
          type="button"
          onClick={onReduceTo12}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs border border-border transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-accent" />
          <span>Reduce Party to 12</span>
        </button>
      </div>
    </div>
  );
}
