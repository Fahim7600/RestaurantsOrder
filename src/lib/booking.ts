import { TimeSlot } from "@/lib/types";
import { isPastSlot, parseLocalDate, toLocalISODate } from "./date";
import { MIN_LEAD_MINUTES, BOOKING_WINDOW_DAYS } from "./config";

export type BookingStatus = "confirmed" | "cancelled" | "waitlisted" | "offered";

export interface Booking {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "19:00"
  partySize: number;
  name: string;
  phone: string;
  status: BookingStatus;
  createdAt: string; // ISO string
  joinedWaitlistAt?: string;
  offeredAt?: string;
  cancelledAt?: string;
}

export type SlotState =
  | "available"
  | "limited"
  | "insufficient"
  | "full"
  | "past"
  | "too-late";

export interface SlotStatusResult {
  seatsLeft: number;
  totalSeats: number;
  state: SlotState;
  reason?: string;
}

/**
 * Calculate effective booked seats for a slot considering base mock data, released seats,
 * and user's confirmed bookings.
 * Cancelled, waitlisted, or offered bookings NEVER hold seats.
 */
export function getEffectiveBookedSeats(
  date: string,
  time: string,
  baseBooked: number,
  released: number = 0,
  confirmedBookings: Booking[] = []
): number {
  const userConfirmedSeats = confirmedBookings
    .filter((b) => b.date === date && b.time === time && b.status === "confirmed")
    .reduce((sum, b) => sum + b.partySize, 0);

  const baseAfterRelease = Math.max(0, baseBooked - released);
  return baseAfterRelease + userConfirmedSeats;
}

/**
 * Evaluate detailed slot availability status for a specific date, time, and party size.
 */
export function getSlotStatus(
  date: string,
  time: string,
  partySize: number,
  totalSeats: number,
  baseBooked: number,
  released: number = 0,
  confirmedBookings: Booking[] = [],
  now: Date = new Date()
): SlotStatusResult {
  // 1. Check if past or within lead time cutoff (60 min)
  const pastCheck = isPastSlot(date, time, now, MIN_LEAD_MINUTES);
  if (pastCheck.isPast) {
    if (pastCheck.reason === "PAST") {
      return { seatsLeft: 0, totalSeats, state: "past", reason: "Time passed" };
    }
    return {
      seatsLeft: 0,
      totalSeats,
      state: "too-late",
      reason: "Needs 60 min notice",
    };
  }

  // 2. Calculate effective seats left
  const effectiveBooked = getEffectiveBookedSeats(
    date,
    time,
    baseBooked,
    released,
    confirmedBookings
  );

  const seatsLeft = Math.max(0, totalSeats - effectiveBooked);

  // 3. Evaluate capacity states
  if (seatsLeft === 0) {
    return { seatsLeft: 0, totalSeats, state: "full", reason: "Fully booked" };
  }

  if (seatsLeft < partySize) {
    return {
      seatsLeft,
      totalSeats,
      state: "insufficient",
      reason: `Only ${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`,
    };
  }

  // Check if capacity is limited (<= 20% left)
  const percentLeft = (seatsLeft / totalSeats) * 100;
  if (percentLeft <= 20) {
    return {
      seatsLeft,
      totalSeats,
      state: "limited",
      reason: `Only ${seatsLeft} left`,
    };
  }

  return {
    seatsLeft,
    totalSeats,
    state: "available",
    reason: `${seatsLeft} seats available`,
  };
}

/**
 * Find up to 3 alternative bookable slots for a party size (same day first, then nearest future dates).
 */
export function findAlternatives(
  targetDate: string,
  targetTime: string,
  partySize: number,
  availabilityData: { date: string; slots: TimeSlot[] }[],
  releasedRecord: Record<string, number> = {},
  confirmedBookings: Booking[] = [],
  now: Date = new Date()
): { date: string; time: string; seatsLeft: number }[] {
  const alternatives: { date: string; time: string; seatsLeft: number }[] = [];

  for (const day of availabilityData) {
    if (day.date < targetDate) continue; // Skip past dates

    for (const slot of day.slots) {
      if (day.date === targetDate && slot.time === targetTime) continue; // Skip exact target slot

      const key = `${day.date}|${slot.time}`;
      const released = releasedRecord[key] || 0;
      const status = getSlotStatus(
        day.date,
        slot.time,
        partySize,
        slot.totalSeats,
        slot.bookedSeats,
        released,
        confirmedBookings,
        now
      );

      if (status.state === "available" || status.state === "limited") {
        alternatives.push({
          date: day.date,
          time: slot.time,
          seatsLeft: status.seatsLeft,
        });
        if (alternatives.length >= 3) return alternatives;
      }
    }
  }

  return alternatives;
}

/**
 * Find the next available date starting from fromDateStr that has at least 1 bookable slot for partySize.
 */
export function findNextAvailableDate(
  fromDateStr: string,
  partySize: number,
  availabilityData: { date: string; slots: TimeSlot[] }[],
  releasedRecord: Record<string, number> = {},
  confirmedBookings: Booking[] = [],
  now: Date = new Date()
): string | null {
  for (const day of availabilityData) {
    if (day.date <= fromDateStr) continue;

    for (const slot of day.slots) {
      const key = `${day.date}|${slot.time}`;
      const released = releasedRecord[key] || 0;
      const status = getSlotStatus(
        day.date,
        slot.time,
        partySize,
        slot.totalSeats,
        slot.bookedSeats,
        released,
        confirmedBookings,
        now
      );

      if (status.state === "available" || status.state === "limited") {
        return day.date;
      }
    }
  }

  return null;
}

/**
 * Process FIFO promotion for waitlist entries when seats open up.
 * Returns updated waitlist bookings with entries promoted to 'offered'.
 */
export function releaseSeatsFIFO(
  date: string,
  time: string,
  availableSeats: number,
  allBookings: Booking[]
): { updatedBookings: Booking[]; promotedCount: number } {
  // Find waitlist entries for this slot sorted by joinedWaitlistAt (FIFO)
  const waitlistEntries = allBookings
    .filter((b) => b.date === date && b.time === time && b.status === "waitlisted")
    .sort(
      (a, b) =>
        new Date(a.joinedWaitlistAt || a.createdAt).getTime() -
        new Date(b.joinedWaitlistAt || b.createdAt).getTime()
    );

  let remainingSeats = availableSeats;
  let promotedCount = 0;

  const promotedIds = new Set<string>();

  for (const entry of waitlistEntries) {
    if (entry.partySize <= remainingSeats) {
      promotedIds.add(entry.id);
      remainingSeats -= entry.partySize;
      promotedCount++;
    }
  }

  const updatedBookings = allBookings.map((b) => {
    if (promotedIds.has(b.id)) {
      return {
        ...b,
        status: "offered" as BookingStatus,
        offeredAt: new Date().toISOString(),
      };
    }
    return b;
  });

  return { updatedBookings, promotedCount };
}

/**
 * Derived status helper for display purposes (never stored).
 */
export function getBookingDisplayStatus(
  booking: Booking,
  now: Date = new Date()
): "Confirmed" | "Completed" | "Waitlisted" | "Offered" | "Cancelled" | "Expired" {
  if (booking.status === "cancelled") return "Cancelled";

  const [hours, minutes] = booking.time.split(":").map(Number);
  const [year, month, day] = booking.date.split("-").map(Number);
  const slotDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // If slot date has passed
  if (now.getTime() > slotDate.getTime() + 2 * 60 * 60 * 1000) {
    // 2 hours after slot time
    if (booking.status === "confirmed") return "Completed";
    if (booking.status === "offered" || booking.status === "waitlisted")
      return "Expired";
  }

  if (booking.status === "confirmed") return "Confirmed";
  if (booking.status === "offered") return "Offered";
  if (booking.status === "waitlisted") return "Waitlisted";

  return "Confirmed";
}
