import { describe, it, expect, beforeEach } from "vitest";
import {
  generateSampleOrders,
  generateSampleBookings,
  loadSampleHistory,
} from "@/lib/sampleData";
import { getBookingDisplayStatus, Booking } from "@/lib/booking";
import { getDerivedOrderStatus } from "@/app/profile/page";
import { useOrderStore, Order } from "@/store/useOrderStore";
import { useBookingStore } from "@/store/useBookingStore";
import { toLocalISODate, addDays } from "@/lib/date";

describe("Sample Generator & Idempotency", () => {
  const now = new Date(2026, 8, 24, 18, 0, 0); // Fixed date for deterministic test

  beforeEach(() => {
    useOrderStore.getState().resetOrders();
    useBookingStore.getState().resetBookings();
  });

  it("generates sample orders with FS-SAMPLE- prefix and isSample flag", () => {
    const orders = generateSampleOrders(now);
    expect(orders).toHaveLength(4);
    orders.forEach((o) => {
      expect(o.id).toMatch(/^FS-SAMPLE-ORD-/);
      expect(o.isSample).toBe(true);
      expect(o.subtotal).toBeGreaterThan(0);
      expect(o.total).toBe(o.subtotal);
      expect(o.items.length).toBeGreaterThan(0);
    });
  });

  it("generates sample bookings with FS-SAMPLE- prefix", () => {
    const bookings = generateSampleBookings(now);
    expect(bookings).toHaveLength(5);
    bookings.forEach((b) => {
      expect(b.id).toMatch(/^FS-SAMPLE-BK-/);
      expect(b.isSample).toBe(true);
    });
  });

  it("ensures upcoming sample booking is on a future non-full slot", () => {
    const todayStr = toLocalISODate(now);
    const bookings = generateSampleBookings(now);
    const upcoming = bookings.find((b) => b.id === "FS-SAMPLE-BK-4");

    expect(upcoming).toBeDefined();
    expect(upcoming!.date > todayStr).toBe(true);
    expect(upcoming!.status).toBe("confirmed");
  });

  it("is idempotent: calling loadSampleHistory twice does not create duplicate entries", () => {
    const res1 = loadSampleHistory();
    expect(res1.ordersLoaded).toBe(4);
    expect(res1.bookingsLoaded).toBe(5);

    const ordersCount1 = useOrderStore.getState().orders.length;
    const bookingsCount1 = useBookingStore.getState().bookings.length;

    // Second run
    const res2 = loadSampleHistory();
    expect(res2.ordersLoaded).toBe(4);
    expect(res2.bookingsLoaded).toBe(5);

    const ordersCount2 = useOrderStore.getState().orders.length;
    const bookingsCount2 = useBookingStore.getState().bookings.length;

    expect(ordersCount2).toBe(ordersCount1);
    expect(bookingsCount2).toBe(bookingsCount1);
  });

  it("preserves real user bookings when loading sample history", () => {
    const todayStr = toLocalISODate(now);
    const userBooking: Booking = {
      id: "FS-USER-BK-1",
      date: addDays(todayStr, 2),
      time: "19:00",
      partySize: 2,
      name: "User Real",
      phone: "01700000000",
      status: "confirmed",
      createdAt: now.toISOString(),
      isSample: false,
    };

    useBookingStore.setState({ bookings: [userBooking] });

    loadSampleHistory();

    const allBookings = useBookingStore.getState().bookings;
    const foundUserBooking = allBookings.find((b) => b.id === "FS-USER-BK-1");
    expect(foundUserBooking).toBeDefined();
    expect(foundUserBooking!.name).toBe("User Real");
  });
});

describe("getBookingDisplayStatus boundaries", () => {
  const now = new Date(2026, 8, 24, 19, 0, 0); // Sept 24, 2026 7:00 PM
  const todayStr = toLocalISODate(now);
  const yesterdayStr = addDays(todayStr, -1);
  const tomorrowStr = addDays(todayStr, 1);

  it("returns Cancelled when status is cancelled regardless of date", () => {
    const b: Booking = {
      id: "b1",
      date: tomorrowStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "cancelled",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b, now)).toBe("Cancelled");
  });

  it("returns Confirmed for future confirmed booking", () => {
    const b: Booking = {
      id: "b2",
      date: tomorrowStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "confirmed",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b, now)).toBe("Confirmed");
  });

  it("returns Completed for confirmed booking past 2h after slot time", () => {
    const b: Booking = {
      id: "b3",
      date: yesterdayStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "confirmed",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b, now)).toBe("Completed");
  });

  it("returns Expired for passed waitlisted or offered booking", () => {
    const b1: Booking = {
      id: "b4",
      date: yesterdayStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "waitlisted",
      createdAt: now.toISOString(),
    };
    const b2: Booking = {
      id: "b5",
      date: yesterdayStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "offered",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b1, now)).toBe("Expired");
    expect(getBookingDisplayStatus(b2, now)).toBe("Expired");
  });

  it("returns Offered for active future offered booking", () => {
    const b: Booking = {
      id: "b6",
      date: tomorrowStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "offered",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b, now)).toBe("Offered");
  });

  it("returns Waitlisted for active future waitlisted booking", () => {
    const b: Booking = {
      id: "b7",
      date: tomorrowStr,
      time: "19:00",
      partySize: 2,
      name: "Test",
      phone: "01712345678",
      status: "waitlisted",
      createdAt: now.toISOString(),
    };
    expect(getBookingDisplayStatus(b, now)).toBe("Waitlisted");
  });
});

describe("Derived Order Status", () => {
  const now = new Date("2026-09-24T19:30:00.000Z");

  it("returns In progress for order placed recently before estimatedReadyTo", () => {
    const order: Order = {
      id: "ORD-1",
      placedAt: new Date("2026-09-24T19:15:00.000Z").toISOString(),
      type: "takeaway",
      items: [],
      subtotal: 500,
      total: 500,
      customer: { name: "Test" },
      kitchen: { tier: "busy", label: "Busy", waitRange: "30-35 min", emoji: "🟡" },
      estimatedReadyFrom: "7:45 PM",
      estimatedReadyTo: "7:55 PM",
    };
    expect(getDerivedOrderStatus(order, now)).toBe("In progress");
  });

  it("returns Completed for order placed more than 60 min ago", () => {
    const order: Order = {
      id: "ORD-2",
      placedAt: new Date("2026-09-24T17:00:00.000Z").toISOString(),
      type: "takeaway",
      items: [],
      subtotal: 500,
      total: 500,
      customer: { name: "Test" },
      kitchen: { tier: "calm", label: "Calm", waitRange: "10-15 min", emoji: "🟢" },
      estimatedReadyFrom: "5:15 PM",
      estimatedReadyTo: "5:20 PM",
    };
    expect(getDerivedOrderStatus(order, now)).toBe("Completed");
  });
});
