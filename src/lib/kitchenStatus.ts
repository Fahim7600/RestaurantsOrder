import { OPENING_HOURS } from "@/lib/config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KitchenTier = "closed" | "calm" | "steady" | "busy" | "rush" | "full";

export interface KitchenStatus {
  tier: KitchenTier;
  /** Short one-word label, e.g. "Calm" */
  label: string;
  /** Emoji indicator (for visual flair; text label is always shown for a11y) */
  emoji: string;
  /** Human-readable wait-time range, e.g. "10–15 min" */
  waitRange: string;
  /** Short sub-text shown beneath the label */
  message: string;
  /** Tailwind color token for the status dot (maps to a CSS variable colour) */
  dotColor: string;
  /** ARIA label combining label + wait time */
  ariaLabel: string;
}

// ---------------------------------------------------------------------------
// Hour → tier mapping
// ---------------------------------------------------------------------------

/** Keys are the hour in 24-h local time (parseInt of HH). */
const HOUR_TIER_MAP: Record<number, KitchenTier> = {
  11: "calm",
  12: "busy",
  13: "rush",
  14: "busy",
  15: "steady",
  16: "calm",
  17: "calm",
  18: "steady",
  19: "rush",
  20: "full",
  21: "rush",
  22: "busy",
};

// ---------------------------------------------------------------------------
// Tier metadata
// ---------------------------------------------------------------------------

const TIER_META: Record<KitchenTier, Omit<KitchenStatus, "ariaLabel">> = {
  closed: {
    tier: "closed",
    label: "Closed",
    emoji: "⚫",
    waitRange: "—",
    message: "We're closed right now. See you soon!",
    dotColor: "bg-muted-foreground",
  },
  calm: {
    tier: "calm",
    label: "Calm",
    emoji: "🟢",
    waitRange: "10–15 min",
    message: "Kitchen's quiet, food's coming out fast",
    dotColor: "bg-emerald-500",
  },
  steady: {
    tier: "steady",
    label: "Steady",
    emoji: "🙂",
    waitRange: "20–25 min",
    message: "Normal pace, nothing to worry about",
    dotColor: "bg-sky-400",
  },
  busy: {
    tier: "busy",
    label: "Busy",
    emoji: "🟡",
    waitRange: "30–35 min",
    message: "Filling up, a little longer than usual",
    dotColor: "bg-yellow-400",
  },
  rush: {
    tier: "rush",
    label: "Rush",
    emoji: "🟠",
    waitRange: "45–50 min",
    message: "Kitchen's slammed, thanks for hanging in there",
    dotColor: "bg-orange-500",
  },
  full: {
    tier: "full",
    label: "Full house",
    emoji: "🔴",
    waitRange: "60+ min",
    message: "At capacity, we're doing our best",
    dotColor: "bg-red-500",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "HH:MM" into { h, m } integers. */
function parseHHMM(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(":").map(Number);
  return { h, m };
}

/** Returns true if the given Date falls within OPENING_HOURS. */
function isOpen(date: Date): boolean {
  const { h: openH, m: openM } = parseHHMM(OPENING_HOURS.open);
  const { h: closeH, m: closeM } = parseHHMM(OPENING_HOURS.close);

  const minutesNow = date.getHours() * 60 + date.getMinutes();
  const minutesOpen = openH * 60 + openM;
  const minutesClose = closeH * 60 + closeM;

  return minutesNow >= minutesOpen && minutesNow < minutesClose;
}

// ---------------------------------------------------------------------------
// Main export — pure function, takes a Date, never calls Date.now()
// ---------------------------------------------------------------------------

/**
 * Returns the current kitchen status derived from the provided date's
 * local hour. Pure function — no side-effects, no Date.now() calls inside.
 */
export function getKitchenStatus(now: Date): KitchenStatus {
  if (!isOpen(now)) {
    const meta = TIER_META.closed;
    return {
      ...meta,
      ariaLabel: `Kitchen status: ${meta.label}`,
    };
  }

  const hour = now.getHours();
  const tier: KitchenTier = HOUR_TIER_MAP[hour] ?? "steady"; // fallback for unmapped hours inside opening window

  const meta = TIER_META[tier];
  return {
    ...meta,
    ariaLabel: `Kitchen status: ${meta.label} — estimated wait ${meta.waitRange}`,
  };
}
