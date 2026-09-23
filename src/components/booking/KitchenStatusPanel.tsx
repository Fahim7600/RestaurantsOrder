"use client";

import { useKitchenStatus } from "@/hooks/useKitchenStatus";
import { KitchenTier } from "@/lib/kitchenStatus";
import { cn } from "@/lib/utils";
import { Clock, Flame, ChefHat, Utensils } from "lucide-react";

// ---------------------------------------------------------------------------
// Per-tier accent colours (Tailwind utility strings — must be complete so
// Tailwind's JIT can detect them as static strings).
// ---------------------------------------------------------------------------

const TIER_STYLES: Record<
  KitchenTier,
  { border: string; bg: string; text: string; iconBg: string }
> = {
  closed: {
    border: "border-border",
    bg: "bg-secondary/30",
    text: "text-muted-foreground",
    iconBg: "bg-muted",
  },
  calm: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  steady: {
    border: "border-sky-400/40",
    bg: "bg-sky-400/5",
    text: "text-sky-400",
    iconBg: "bg-sky-400/10",
  },
  busy: {
    border: "border-yellow-400/40",
    bg: "bg-yellow-400/5",
    text: "text-yellow-400",
    iconBg: "bg-yellow-400/10",
  },
  rush: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
    iconBg: "bg-orange-500/10",
  },
  full: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    text: "text-red-400",
    iconBg: "bg-red-500/10",
  },
};

/** Maps tier → icon component */
function TierIcon({ tier, className }: { tier: KitchenTier; className?: string }) {
  switch (tier) {
    case "calm":
      return <Utensils className={className} />;
    case "steady":
      return <ChefHat className={className} />;
    case "busy":
      return <Flame className={className} />;
    case "rush":
      return <Flame className={className} />;
    case "full":
      return <Flame className={className} />;
    default:
      return <Clock className={className} />;
  }
}

/** Visual heat bar — 5 segments, filled up to the current tier level. */
function HeatBar({ tier }: { tier: KitchenTier }) {
  const ORDER: KitchenTier[] = ["calm", "steady", "busy", "rush", "full"];
  const fillCount = tier === "closed" ? 0 : ORDER.indexOf(tier) + 1;

  const segColors = [
    "bg-emerald-500",
    "bg-sky-400",
    "bg-yellow-400",
    "bg-orange-500",
    "bg-red-500",
  ];

  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`Kitchen heat: ${fillCount} out of 5`}
    >
      {ORDER.map((t, i) => (
        <div
          key={t}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500",
            i < fillCount ? segColors[i] : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface KitchenStatusPanelProps {
  className?: string;
}

/**
 * A detailed kitchen status card for the /book page.
 * Shows tier label, wait-time range, descriptive message, heat bar, and a
 * live-clock note. Pure display — no actions, never blocks ordering.
 */
export default function KitchenStatusPanel({
  className,
}: KitchenStatusPanelProps) {
  const status = useKitchenStatus();
  const styles = TIER_STYLES[status.tier];

  return (
    <section
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-colors duration-700",
        styles.border,
        styles.bg,
        className
      )}
      aria-label={status.ariaLabel}
      role="region"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            styles.iconBg
          )}
          aria-hidden="true"
        >
          <TierIcon
            tier={status.tier}
            className={cn("w-5 h-5", styles.text)}
          />
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn("font-semibold text-sm leading-none", styles.text)}>
              Kitchen Status
            </h3>
            {/* Tier pill */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold",
                styles.iconBg,
                styles.text
              )}
            >
              {/* Colour dot — redundant info for colour-blind safety */}
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  status.dotColor,
                  ["rush", "full"].includes(status.tier) && "animate-pulse"
                )}
                aria-hidden="true"
              />
              {status.emoji} {status.label}
            </span>
          </div>

          {status.tier !== "closed" ? (
            <>
              {/* Wait time */}
              <p className="mt-1.5 text-xs text-muted-foreground">
                <Clock
                  className="inline w-3 h-3 mr-1 -mt-0.5"
                  aria-hidden="true"
                />
                Estimated wait:{" "}
                <span className={cn("font-semibold", styles.text)}>
                  {status.waitRange}
                </span>
              </p>

              {/* Message */}
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {status.message}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {status.message}
            </p>
          )}
        </div>
      </div>

      {/* Heat bar */}
      {status.tier !== "closed" && (
        <div className="mt-3">
          <HeatBar tier={status.tier} />
        </div>
      )}

      {/* Live-update note */}
      <p className="mt-2.5 text-[11px] text-muted-foreground/60 leading-none">
        Updates automatically · for reference only
      </p>
    </section>
  );
}
