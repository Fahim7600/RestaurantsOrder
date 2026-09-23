/**
 * Pure checkout helpers — no imports from stores, components, or external state.
 * All functions take explicit parameters and are fully testable with Vitest.
 */

import { MenuItem } from "@/lib/types";
import { CartItem } from "@/store/useCartStore";
import { Booking } from "@/lib/booking";
import { KitchenStatus } from "@/lib/kitchenStatus";
import { OPENING_HOURS, MAX_QTY_PER_ITEM, TABLE_COUNT } from "@/lib/config";
import { toLocalISODate } from "@/lib/date";

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

/**
 * Format an integer BDT amount as "৳ 1,250".
 */
export function formatBDT(amount: number): string {
  return `৳ ${Math.round(amount).toLocaleString("en-US")}`;
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

const ORDER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderId(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ORDER_CHARS.charAt(Math.floor(Math.random() * ORDER_CHARS.length));
  }
  return `FS-ORD-${code}`;
}

// ---------------------------------------------------------------------------
// Cart reconciliation
// ---------------------------------------------------------------------------

export interface ReconciliationNotice {
  type: "removed" | "price_changed" | "qty_clamped";
  name: string;
  detail: string;
}

export interface ReconciliationResult {
  items: CartItem[];
  notices: ReconciliationNotice[];
}

/**
 * Validate cart items against the live menu data.
 * - Drops items whose menuItemId no longer exists in menuItems.
 * - Refreshes price if it changed.
 * - Clamps qty to 1..MAX_QTY_PER_ITEM.
 */
export function reconcileCart(
  cartItems: CartItem[],
  menuItems: MenuItem[]
): ReconciliationResult {
  const notices: ReconciliationNotice[] = [];
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  const items: CartItem[] = [];

  for (const item of cartItems) {
    const menuItem = menuMap.get(item.menuItemId);

    if (!menuItem) {
      notices.push({
        type: "removed",
        name: item.name,
        detail: `"${item.name}" is no longer on the menu and was removed from your order.`,
      });
      continue;
    }

    let updatedItem = { ...item };

    if (menuItem.price !== item.price) {
      notices.push({
        type: "price_changed",
        name: item.name,
        detail: `"${item.name}" price updated from ${formatBDT(item.price)} to ${formatBDT(menuItem.price)}.`,
      });
      updatedItem = { ...updatedItem, price: menuItem.price };
    }

    if (item.qty > MAX_QTY_PER_ITEM) {
      notices.push({
        type: "qty_clamped",
        name: item.name,
        detail: `"${item.name}" quantity clamped to ${MAX_QTY_PER_ITEM} (maximum per dish).`,
      });
      updatedItem = { ...updatedItem, qty: MAX_QTY_PER_ITEM };
    }

    if (item.qty < 1) {
      updatedItem = { ...updatedItem, qty: 1 };
    }

    items.push(updatedItem);
  }

  return { items, notices };
}

// ---------------------------------------------------------------------------
// Dine-in eligibility
// ---------------------------------------------------------------------------

export interface EligibleBooking {
  booking: Booking;
  eligible: boolean;
  /** Shown when eligible = false */
  disabledReason?: string;
}

/**
 * Returns all confirmed (non-cancelled/waitlisted) bookings with eligibility:
 * - Eligible: booking date is TODAY and slot start is NOW or up to 3 h ago.
 * - Ineligible: other day → shows date; past 3h today → shows reason.
 */
export function getEligibleDineInBookings(
  bookings: Booking[],
  now: Date
): EligibleBooking[] {
  const todayStr = toLocalISODate(now);

  return bookings
    .filter((b) => b.status === "confirmed")
    .map((booking) => {
      if (booking.date !== todayStr) {
        const [y, m, d] = booking.date.split("-").map(Number);
        const bookDate = new Date(y, m - 1, d);
        const label = bookDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        return {
          booking,
          eligible: false,
          disabledReason: `Booked for ${label}, dine-in orders open on the day`,
        };
      }

      // Today: check if slot is within last 3 hours
      const [slotH, slotM] = booking.time.split(":").map(Number);
      const slotMs =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          slotH,
          slotM,
          0,
          0
        ).getTime();
      const diffHours = (now.getTime() - slotMs) / (1000 * 60 * 60);

      if (diffHours > 3) {
        return {
          booking,
          eligible: false,
          disabledReason: "This booking slot was more than 3 hours ago",
        };
      }

      return { booking, eligible: true };
    });
}

// ---------------------------------------------------------------------------
// Pickup slot generation (takeaway)
// ---------------------------------------------------------------------------

/** Parse "HH:MM" into total minutes since midnight */
function hhmm(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

/** Format total minutes as "HH:MM" */
function minsToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Generate available pickup time slots for today.
 *
 * Rules:
 * - 15-minute steps
 * - Earliest = now + max(kitchenStatus.waitMax, 20 min) rounded up to next 15-min boundary
 * - Latest = closing time − 15 min
 * - If kitchen is closed (tier === "closed"), use opening time as start
 * - Returns [] if no valid slots remain today
 */
export function generatePickupSlots(
  now: Date,
  kitchenStatus: Pick<KitchenStatus, "tier" | "waitRange">
): string[] {
  const openMins = hhmm(OPENING_HOURS.open);
  const closeMins = hhmm(OPENING_HOURS.close);
  const latestMins = closeMins - 15;

  if (latestMins <= openMins) return [];

  // Determine wait max in minutes from waitRange (e.g. "30–35 min" → 35)
  let waitMax = 20;
  if (kitchenStatus.tier !== "closed") {
    const match = kitchenStatus.waitRange.match(/(\d+)[^–\-\d]*$/);
    if (match) waitMax = parseInt(match[1], 10);
  }

  const nowMins = now.getHours() * 60 + now.getMinutes();

  let earliestMins: number;

  if (kitchenStatus.tier === "closed") {
    // Before opening: first slot is at opening + wait window
    if (nowMins < openMins) {
      earliestMins = openMins + Math.max(waitMax, 20);
    } else {
      // After closing today → no slots
      return [];
    }
  } else {
    const rawEarliest = nowMins + Math.max(waitMax, 20);
    // Round UP to next 15-min boundary
    earliestMins = Math.ceil(rawEarliest / 15) * 15;
  }

  if (earliestMins > latestMins) return [];

  const slots: string[] = [];
  for (let t = earliestMins; t <= latestMins; t += 15) {
    slots.push(minsToHHMM(t));
  }

  return slots;
}

// ---------------------------------------------------------------------------
// ETA computation
// ---------------------------------------------------------------------------

export interface ETARange {
  from: string; // e.g. "7:35 PM"
  to: string;   // e.g. "7:45 PM"
  /** Human-friendly label for display */
  label: string;
}

/** Format total minutes since midnight as "7:35 PM" */
function minsTo12h(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Compute the estimated ready window given order mode and kitchen status.
 */
export function computeETA(
  mode: "asap" | "scheduled",
  pickupTimeHHMM: string | undefined,
  kitchenStatus: Pick<KitchenStatus, "tier" | "waitRange">,
  now: Date
): ETARange {
  const openMins = hhmm(OPENING_HOURS.open);

  if (mode === "scheduled" && pickupTimeHHMM) {
    const base = hhmm(pickupTimeHHMM);
    return {
      from: minsTo12h(base),
      to: minsTo12h(base + 10),
      label: `Ready around ${minsTo12h(base)}–${minsTo12h(base + 10)}`,
    };
  }

  // ASAP — derive from wait range
  const [waitMin, waitMax] = kitchenStatus.tier === "closed"
    ? [0, 0]
    : kitchenStatus.waitRange
        .replace(" min", "")
        .split(/[–-]/)
        .map((s) => parseInt(s.trim(), 10));

  if (kitchenStatus.tier === "closed") {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    // Before opening: opens at 11:00 AM + wait
    const baseMin = nowMins < openMins ? openMins : openMins; // use opening
    const fromMins = baseMin + (waitMin || 10);
    const toMins = baseMin + (waitMax || 15);
    return {
      from: minsTo12h(fromMins),
      to: minsTo12h(toMins),
      label: `Ready around ${minsTo12h(fromMins)}–${minsTo12h(toMins)} (after opening)`,
    };
  }

  const nowMins = now.getHours() * 60 + now.getMinutes();
  return {
    from: minsTo12h(nowMins + (waitMin || 10)),
    to: minsTo12h(nowMins + (waitMax || 15)),
    label: `Ready around ${minsTo12h(nowMins + (waitMin || 10))}–${minsTo12h(nowMins + (waitMax || 15))}`,
  };
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------

export function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export { TABLE_COUNT };
