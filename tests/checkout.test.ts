import { describe, it, expect, beforeEach } from "vitest";
import {
  formatBDT,
  generateOrderId,
  reconcileCart,
  getEligibleDineInBookings,
  generatePickupSlots,
  computeETA,
  computeSubtotal,
} from "@/lib/checkout";
import { CartItem } from "@/store/useCartStore";
import { MenuItem, DietaryTag } from "@/lib/types";
import { Booking } from "@/lib/booking";
import { toLocalISODate, addDays } from "@/lib/date";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDate(h: number, m = 0): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: "item-1",
    name: "Test Dish",
    description: "desc",
    price: 500,
    image: "https://example.com/img.jpg",
    cuisineId: "bangladeshi",
    categoryId: "mains",
    dietaryTags: [] as DietaryTag[],
    ...overrides,
  };
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    menuItemId: "item-1",
    name: "Test Dish",
    price: 500,
    image: "https://example.com/img.jpg",
    qty: 2,
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  const todayStr = new Date().toISOString().split("T")[0];
  return {
    id: "FS-BK-TEST1",
    date: todayStr,
    time: "19:00",
    partySize: 2,
    name: "Test User",
    phone: "01700000000",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatBDT
// ---------------------------------------------------------------------------

describe("formatBDT", () => {
  it("formats whole numbers", () => {
    expect(formatBDT(1250)).toBe("৳ 1,250");
  });

  it("formats small amounts", () => {
    expect(formatBDT(50)).toBe("৳ 50");
  });

  it("rounds floats", () => {
    expect(formatBDT(1249.9)).toBe("৳ 1,250");
  });

  it("formats zero", () => {
    expect(formatBDT(0)).toBe("৳ 0");
  });
});

// ---------------------------------------------------------------------------
// generateOrderId
// ---------------------------------------------------------------------------

describe("generateOrderId", () => {
  it("starts with FS-ORD-", () => {
    expect(generateOrderId()).toMatch(/^FS-ORD-[A-Z0-9]{6}$/);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateOrderId()));
    expect(ids.size).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// reconcileCart
// ---------------------------------------------------------------------------

describe("reconcileCart", () => {
  it("keeps valid items unchanged", () => {
    const cart = [makeCartItem()];
    const menu = [makeMenuItem()];
    const { items, notices } = reconcileCart(cart, menu);
    expect(items).toHaveLength(1);
    expect(notices).toHaveLength(0);
  });

  it("drops items not in menu", () => {
    const cart = [makeCartItem({ menuItemId: "gone" })];
    const menu = [makeMenuItem({ id: "item-1" })];
    const { items, notices } = reconcileCart(cart, menu);
    expect(items).toHaveLength(0);
    expect(notices[0].type).toBe("removed");
  });

  it("refreshes price if changed", () => {
    const cart = [makeCartItem({ price: 400 })]; // stale price
    const menu = [makeMenuItem({ price: 500 })]; // current
    const { items, notices } = reconcileCart(cart, menu);
    expect(items[0].price).toBe(500);
    expect(notices[0].type).toBe("price_changed");
  });

  it("clamps qty above MAX_QTY_PER_ITEM (20)", () => {
    const cart = [makeCartItem({ qty: 25 })];
    const menu = [makeMenuItem()];
    const { items, notices } = reconcileCart(cart, menu);
    expect(items[0].qty).toBe(20);
    expect(notices[0].type).toBe("qty_clamped");
  });

  it("handles multiple items with mixed states", () => {
    const cart = [
      makeCartItem({ menuItemId: "a", name: "A", price: 100 }),
      makeCartItem({ menuItemId: "b", name: "B", price: 200 }),
      makeCartItem({ menuItemId: "gone", name: "Gone", price: 50 }),
    ];
    const menu = [
      makeMenuItem({ id: "a", price: 100 }),
      makeMenuItem({ id: "b", price: 250 }), // price change
    ];
    const { items, notices } = reconcileCart(cart, menu);
    expect(items).toHaveLength(2);
    expect(notices).toHaveLength(2); // 1 removed + 1 price_changed
  });
});

// ---------------------------------------------------------------------------
// getEligibleDineInBookings
// ---------------------------------------------------------------------------

describe("getEligibleDineInBookings", () => {
  const todayStr = toLocalISODate(new Date());
  const yesterdayStr = addDays(todayStr, -1);
  const tomorrowStr = addDays(todayStr, 1);

  it("returns confirmed today booking as eligible", () => {
    const now = makeDate(19, 30); // 7:30 PM — within 3h of 7:00 PM slot
    const b = makeBooking({ date: todayStr, time: "19:00" });
    const result = getEligibleDineInBookings([b], now);
    expect(result).toHaveLength(1);
    expect(result[0].eligible).toBe(true);
  });

  it("excludes cancelled bookings", () => {
    const now = makeDate(19, 30);
    const b = makeBooking({ date: todayStr, time: "19:00", status: "cancelled" });
    const result = getEligibleDineInBookings([b], now);
    expect(result).toHaveLength(0);
  });

  it("marks other-day bookings as ineligible with reason", () => {
    const now = makeDate(19, 0);
    const b = makeBooking({ date: tomorrowStr, time: "19:00" });
    const result = getEligibleDineInBookings([b], now);
    expect(result[0].eligible).toBe(false);
    expect(result[0].disabledReason).toMatch(/dine-in orders open on the day/i);
  });

  it("marks today booking >3h ago as ineligible", () => {
    const now = makeDate(23, 0); // 11 PM
    const b = makeBooking({ date: todayStr, time: "19:00" }); // slot was 4h ago
    const result = getEligibleDineInBookings([b], now);
    expect(result[0].eligible).toBe(false);
  });

  it("marks slot within 3h window as eligible", () => {
    const now = makeDate(20, 0); // 8 PM
    const b = makeBooking({ date: todayStr, time: "18:00" }); // 2h ago → within 3h
    const result = getEligibleDineInBookings([b], now);
    expect(result[0].eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generatePickupSlots
// ---------------------------------------------------------------------------

describe("generatePickupSlots", () => {
  const openStatus = { tier: "calm" as const, waitRange: "10–15 min" };
  const rushStatus = { tier: "rush" as const, waitRange: "45–50 min" };
  const closedStatus = { tier: "closed" as const, waitRange: "—" };

  it("returns slots at 15-min intervals", () => {
    const now = makeDate(14, 0); // 2 PM — well within hours
    const slots = generatePickupSlots(now, openStatus);
    expect(slots.length).toBeGreaterThan(0);
    // Check all are HH:MM format and 15-min apart
    for (let i = 1; i < slots.length; i++) {
      const prev = slots[i - 1].split(":").map(Number);
      const curr = slots[i].split(":").map(Number);
      const prevMins = prev[0] * 60 + prev[1];
      const currMins = curr[0] * 60 + curr[1];
      expect(currMins - prevMins).toBe(15);
    }
  });

  it("earliest slot respects waitMax + rounding up to 15-min boundary", () => {
    const now = makeDate(14, 3); // 2:03 PM, calm (waitMax=15)
    // earliest raw = 14*60+3+15 = 858 min = 14:18, round up to next 15 → 14:30
    const slots = generatePickupSlots(now, openStatus);
    expect(slots[0]).toBe("14:30");
  });

  it("rush: uses higher waitMax (50 min)", () => {
    const now = makeDate(14, 0); // 2:00 PM
    // earliest raw = 840+50=890 min → 14:50, round up to 15 → 15:00
    const slots = generatePickupSlots(now, rushStatus);
    expect(slots[0]).toBe("15:00");
  });

  it("returns [] when after closing", () => {
    const now = makeDate(23, 30); // after closing
    const slots = generatePickupSlots(now, closedStatus);
    expect(slots).toHaveLength(0);
  });

  it("latest slot is closing - 15 min (22:45 for 23:00 close)", () => {
    const now = makeDate(11, 0); // opening
    const slots = generatePickupSlots(now, openStatus);
    expect(slots[slots.length - 1]).toBe("22:45");
  });

  it("returns [] when no slots remain today (late evening)", () => {
    const now = makeDate(22, 40); // 10:40 PM — only 5 min before cut-off
    // waitMax=15 → earliest = 22:40+15=22:55, round to 23:00, latestMins=22:45 → no slots
    const slots = generatePickupSlots(now, openStatus);
    expect(slots).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeETA
// ---------------------------------------------------------------------------

describe("computeETA", () => {
  it("ASAP mode returns from/to based on wait range", () => {
    const now = makeDate(14, 0); // 2:00 PM = 840 mins
    const status = { tier: "calm" as const, waitRange: "10–15 min" };
    const eta = computeETA("asap", undefined, status, now);
    expect(eta.from).toBe("2:10 PM"); // 840+10 = 850 mins
    expect(eta.to).toBe("2:15 PM");   // 840+15 = 855 mins
  });

  it("scheduled mode returns slot time and +10 min", () => {
    const now = makeDate(14, 0);
    const status = { tier: "calm" as const, waitRange: "10–15 min" };
    const eta = computeETA("scheduled", "15:30", status, now);
    expect(eta.from).toBe("3:30 PM");
    expect(eta.to).toBe("3:40 PM");
  });
});

// ---------------------------------------------------------------------------
// computeSubtotal
// ---------------------------------------------------------------------------

describe("computeSubtotal", () => {
  it("sums price * qty for all items", () => {
    const items: CartItem[] = [
      makeCartItem({ price: 500, qty: 2 }),
      makeCartItem({ menuItemId: "item-2", price: 300, qty: 3 }),
    ];
    expect(computeSubtotal(items)).toBe(1900); // 1000 + 900
  });

  it("returns 0 for empty cart", () => {
    expect(computeSubtotal([])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Schema edge cases (table number, phone)
// ---------------------------------------------------------------------------

import { tableNumberSchema, phoneSchema } from "@/lib/validation";

describe("tableNumberSchema", () => {
  it("accepts valid table numbers", () => {
    expect(tableNumberSchema.safeParse(1).success).toBe(true);
    expect(tableNumberSchema.safeParse(10).success).toBe(true);
    expect(tableNumberSchema.safeParse(20).success).toBe(true);
  });

  it("rejects 0", () => {
    expect(tableNumberSchema.safeParse(0).success).toBe(false);
  });

  it("rejects 21 (exceeds TABLE_COUNT)", () => {
    expect(tableNumberSchema.safeParse(21).success).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(tableNumberSchema.safeParse(2.5).success).toBe(false);
  });

  it("rejects negative", () => {
    expect(tableNumberSchema.safeParse(-1).success).toBe(false);
  });
});

describe("phoneSchema (BD)", () => {
  it("accepts valid 11-digit BD numbers", () => {
    expect(phoneSchema.safeParse("01712345678").success).toBe(true);
    expect(phoneSchema.safeParse("01812345678").success).toBe(true);
  });

  it("accepts with +88 prefix", () => {
    expect(phoneSchema.safeParse("+8801712345678").success).toBe(true);
  });

  it("rejects short numbers", () => {
    expect(phoneSchema.safeParse("0171234").success).toBe(false);
  });

  it("rejects numbers starting with 010 or 011", () => {
    expect(phoneSchema.safeParse("01012345678").success).toBe(false);
    expect(phoneSchema.safeParse("01112345678").success).toBe(false);
  });

  it("strips spaces and dashes before validating", () => {
    expect(phoneSchema.safeParse("017 1234 5678").success).toBe(true);
    expect(phoneSchema.safeParse("017-1234-5678").success).toBe(true);
  });
});
