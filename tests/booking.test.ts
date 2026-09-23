import { describe, it, expect, beforeEach } from "vitest";
import {
  toLocalISODate,
  parseLocalDate,
  addDays,
  isSameDay,
  isPastSlot,
} from "../src/lib/date";
import {
  getSlotStatus,
  getEffectiveBookedSeats,
  releaseSeatsFIFO,
  Booking,
} from "../src/lib/booking";
import {
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
  BOOKING_WINDOW_DAYS,
  MIN_LEAD_MINUTES,
} from "../src/lib/config";
import { useBookingStore } from "../src/store/useBookingStore";

describe("1. Date Helpers & Local Timezone Safety", () => {
  it("toLocalISODate keeps 00:30 local time on the correct local date", () => {
    const date = new Date(2026, 8, 24, 0, 30, 0); // Sep 24, 2026 00:30
    const localISO = toLocalISODate(date);
    expect(localISO).toBe("2026-09-24");
  });

  it("parseLocalDate parses YYYY-MM-DD into midnight local time", () => {
    const parsed = parseLocalDate("2026-09-24");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(24);
    expect(parsed.getHours()).toBe(0);
  });

  it("addDays adds days correctly to local ISO date string", () => {
    expect(addDays("2026-09-24", 1)).toBe("2026-09-25");
    expect(addDays("2026-09-24", 13)).toBe("2026-10-07");
  });

  it("isSameDay accurately compares dates", () => {
    expect(isSameDay("2026-09-24", "2026-09-24")).toBe(true);
    expect(isSameDay("2026-09-24", "2026-09-25")).toBe(false);
  });
});

describe("2. Past Slot & Lead-Time Cutoff", () => {
  it("detects past time slots correctly", () => {
    const now = new Date(2026, 8, 24, 14, 0, 0); // 2:00 PM
    const pastSlot = isPastSlot("2026-09-24", "13:00", now, MIN_LEAD_MINUTES);
    expect(pastSlot.isPast).toBe(true);
    expect(pastSlot.reason).toBe("PAST");
  });

  it("enforces minimum lead time cutoff (60 minutes)", () => {
    const now = new Date(2026, 8, 24, 11, 15, 0); // 11:15 AM
    const lateSlot = isPastSlot("2026-09-24", "12:00", now, 60);
    expect(lateSlot.isPast).toBe(true);
    expect(lateSlot.reason).toBe("TOO_LATE");

    const validSlot = isPastSlot("2026-09-24", "13:00", now, 60);
    expect(validSlot.isPast).toBe(false);
  });
});

describe("3. Slot Capacity Evaluation & Party Sizes", () => {
  const now = new Date(2026, 8, 24, 10, 0, 0); // 10:00 AM

  it("returns available for exact fit (seatsLeft === partySize)", () => {
    const status = getSlotStatus("2026-09-24", "19:00", 2, 30, 28, 0, [], now);
    expect(status.seatsLeft).toBe(2);
    expect(status.state).toBe("limited"); // <= 20% capacity left
  });

  it("returns insufficient when seatsLeft < partySize but seatsLeft > 0", () => {
    const status = getSlotStatus("2026-09-24", "19:00", 4, 30, 28, 0, [], now);
    expect(status.seatsLeft).toBe(2);
    expect(status.state).toBe("insufficient");
  });

  it("returns full when seatsLeft === 0", () => {
    const status = getSlotStatus("2026-09-24", "19:00", 2, 30, 30, 0, [], now);
    expect(status.seatsLeft).toBe(0);
    expect(status.state).toBe("full");
  });
});

describe("4. Store Integration & Validation Rules", () => {
  beforeEach(() => {
    useBookingStore.getState().resetBookings();
  });

  it("prevents party size < 1 or > 12 from being confirmed online", () => {
    const futureDate = addDays(toLocalISODate(new Date()), 3);

    const resultSmall = useBookingStore.getState().confirmBooking({
      date: futureDate,
      time: "19:00",
      partySize: 0,
      name: "Valid Name",
      phone: "01700000000",
    });
    expect(resultSmall.ok).toBe(false);
    if (!resultSmall.ok) {
      expect(resultSmall.reason).toBe("PARTY_TOO_SMALL");
    }

    const resultLarge = useBookingStore.getState().confirmBooking({
      date: futureDate,
      time: "19:00",
      partySize: 13,
      name: "Valid Name",
      phone: "01700000000",
    });
    expect(resultLarge.ok).toBe(false);
    if (!resultLarge.ok) {
      expect(resultLarge.reason).toBe("PARTY_TOO_LARGE");
    }
  });

  it("detects and rejects duplicate bookings for same date + time", () => {
    const futureDate = addDays(toLocalISODate(new Date()), 3);

    // 1st booking succeeds
    const res1 = useBookingStore.getState().confirmBooking({
      date: futureDate,
      time: "20:00",
      partySize: 2,
      name: "Guest One",
      phone: "01700000000",
    });
    expect(res1.ok).toBe(true);

    // 2nd booking attempt for same date + time fails as DUPLICATE
    const res2 = useBookingStore.getState().confirmBooking({
      date: futureDate,
      time: "20:00",
      partySize: 2,
      name: "Guest One",
      phone: "01700000000",
    });
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.reason).toBe("DUPLICATE");
    }
  });

  it("promotes waitlist entries FIFO when seats are released", () => {
    const date = "2026-09-25";
    const time = "19:00";

    const dummyBookings: Booking[] = [
      {
        id: "WL-1",
        date,
        time,
        partySize: 2,
        name: "First Waitlister",
        phone: "01700000000",
        status: "waitlisted",
        createdAt: "2026-09-24T10:00:00Z",
        joinedWaitlistAt: "2026-09-24T10:00:00Z",
      },
      {
        id: "WL-2",
        date,
        time,
        partySize: 4,
        name: "Second Waitlister",
        phone: "01800000000",
        status: "waitlisted",
        createdAt: "2026-09-24T10:05:00Z",
        joinedWaitlistAt: "2026-09-24T10:05:00Z",
      },
    ];

    const fifoResult = releaseSeatsFIFO(date, time, 3, dummyBookings);
    expect(fifoResult.promotedCount).toBe(1);

    const promotedWL1 = fifoResult.updatedBookings.find((b) => b.id === "WL-1");
    const promotedWL2 = fifoResult.updatedBookings.find((b) => b.id === "WL-2");

    expect(promotedWL1?.status).toBe("offered");
    expect(promotedWL2?.status).toBe("waitlisted");
  });

  it("bounds released seats so baseBooked never drops below zero", () => {
    const date = "2026-09-25";
    const time = "19:00";

    useBookingStore.getState().simulateSeatsOpening(date, time, 100);
    const key = `${date}|${time}`;
    const releasedValue = useBookingStore.getState().released[key];

    expect(releasedValue).toBeGreaterThan(0);
    expect(releasedValue).toBeLessThanOrEqual(40);
  });
});
