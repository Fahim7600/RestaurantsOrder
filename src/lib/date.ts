import { MIN_LEAD_MINUTES } from "./config";

/**
 * Format a Date object as a local "YYYY-MM-DD" string.
 * Uses local getFullYear(), getMonth(), getDate() to prevent UTC offset shifts.
 */
export function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a local "YYYY-MM-DD" date string into a Date object at midnight local time.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Add N days to a local "YYYY-MM-DD" string and return the result as a "YYYY-MM-DD" string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalISODate(d);
}

/**
 * Check if two dates/strings represent the same local "YYYY-MM-DD" date.
 */
export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const str1 = typeof d1 === "string" ? d1 : toLocalISODate(d1);
  const str2 = typeof d2 === "string" ? d2 : toLocalISODate(d2);
  return str1 === str2;
}

/**
 * Check if a date + time slot is in the past or within the minimum lead time cutoff.
 */
export function isPastSlot(
  dateStr: string,
  timeStr: string,
  now: Date = new Date(),
  leadMinutes: number = MIN_LEAD_MINUTES
): { isPast: boolean; reason?: "PAST" | "TOO_LATE" } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const [year, month, day] = dateStr.split("-").map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  const diffMs = slotDate.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes <= 0) {
    return { isPast: true, reason: "PAST" };
  }

  if (diffMinutes < leadMinutes) {
    return { isPast: true, reason: "TOO_LATE" };
  }

  return { isPast: false };
}

/**
 * Format a "YYYY-MM-DD" string into a readable format like "Thursday, Sep 24, 2026".
 */
export function formatDateLong(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format "19:00" to "7:00 PM"
 */
export function formatTime12h(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const mStr = String(minutes).padStart(2, "0");
  return `${h12}:${mStr} ${period}`;
}
