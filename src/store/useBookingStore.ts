import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeJSONStorage } from "@/lib/storage";
import { Booking, BookingStatus, getSlotStatus, releaseSeatsFIFO } from "@/lib/booking";
import { generateBookingId } from "@/lib/ids";
import { generateAvailabilityData } from "@/data/availability";
import { bookingDetailsSchema } from "@/lib/validation";
import { isPastSlot, toLocalISODate, addDays } from "@/lib/date";
import {
  MIN_PARTY_SIZE,
  MAX_PARTY_SIZE,
  BOOKING_WINDOW_DAYS,
} from "@/lib/config";

export type BookingFailureReason =
  | "PAST"
  | "TOO_LATE"
  | "OUT_OF_WINDOW"
  | "PARTY_TOO_SMALL"
  | "PARTY_TOO_LARGE"
  | "NO_SEATS"
  | "DUPLICATE"
  | "NOT_FOUND"
  | "INVALID";

export type BookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: BookingFailureReason; message: string };

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: BookingFailureReason; message: string };

interface BookingState {
  bookings: Booking[];
  released: Record<string, number>; // key "date|time" -> seats released

  confirmBooking: (data: {
    date: string;
    time: string;
    partySize: number;
    name: string;
    phone: string;
  }) => BookingResult;

  joinWaitlist: (data: {
    date: string;
    time: string;
    partySize: number;
    name: string;
    phone: string;
  }) => BookingResult;

  cancelBooking: (id: string) => ActionResult;
  leaveWaitlist: (id: string) => ActionResult;
  acceptOffer: (id: string) => ActionResult;
  declineOffer: (id: string) => ActionResult;

  simulateSeatsOpening: (date: string, time: string, seatsToRelease?: number) => { promoted: number };
  resetBookings: () => void;
  loadSampleBookings: (sampleBookings: Booking[]) => void;
  hasActiveOffers: () => boolean;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      released: {},

      confirmBooking: (data) => {
        const now = new Date();
        const todayStr = toLocalISODate(now);
        const maxWindowDate = addDays(todayStr, BOOKING_WINDOW_DAYS - 1);

        // 1. Validate inputs
        const valResult = bookingDetailsSchema.safeParse({
          name: data.name,
          phone: data.phone,
        });
        if (!valResult.success) {
          return { ok: false, reason: "INVALID", message: "Invalid name or phone number." };
        }

        if (data.partySize < MIN_PARTY_SIZE) {
          return { ok: false, reason: "PARTY_TOO_SMALL", message: "Party size must be at least 1." };
        }
        if (data.partySize > MAX_PARTY_SIZE) {
          return { ok: false, reason: "PARTY_TOO_LARGE", message: "Parties over 12 must contact large group reservations." };
        }

        if (data.date < todayStr || data.date > maxWindowDate) {
          return { ok: false, reason: "OUT_OF_WINDOW", message: "Date is outside our 14-day booking window." };
        }

        // 2. Check for duplicate active booking or waitlist entry for SAME date+time
        const isDuplicate = get().bookings.some(
          (b) =>
            b.date === data.date &&
            b.time === data.time &&
            (b.status === "confirmed" || b.status === "waitlisted" || b.status === "offered")
        );
        if (isDuplicate) {
          return {
            ok: false,
            reason: "DUPLICATE",
            message: "You already have an active booking or waitlist entry for this date and time.",
          };
        }

        // 3. Re-evaluate slot capacity against mock data & existing bookings
        const availData = generateAvailabilityData(now);
        const dayData = availData.find((d) => d.date === data.date);
        const slotData = dayData?.slots.find((s) => s.time === data.time);

        if (!slotData) {
          return { ok: false, reason: "INVALID", message: "Selected time slot is invalid." };
        }

        const slotKey = `${data.date}|${data.time}`;
        const releasedCount = get().released[slotKey] || 0;

        const status = getSlotStatus(
          data.date,
          data.time,
          data.partySize,
          slotData.totalSeats,
          slotData.bookedSeats,
          releasedCount,
          get().bookings,
          now
        );

        if (status.state === "past") {
          return { ok: false, reason: "PAST", message: "This time slot has already passed." };
        }
        if (status.state === "too-late") {
          return { ok: false, reason: "TOO_LATE", message: "Bookings require at least 60 minutes notice." };
        }
        if (status.state === "full" || status.state === "insufficient") {
          return { ok: false, reason: "NO_SEATS", message: status.reason || "Not enough seats available." };
        }

        // 4. Create confirmed booking
        const newBooking: Booking = {
          id: generateBookingId(),
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          name: valResult.data.name,
          phone: valResult.data.phone,
          status: "confirmed",
          createdAt: now.toISOString(),
        };

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
        }));

        return { ok: true, booking: newBooking };
      },

      joinWaitlist: (data) => {
        const now = new Date();
        const valResult = bookingDetailsSchema.safeParse({
          name: data.name,
          phone: data.phone,
        });
        if (!valResult.success) {
          return { ok: false, reason: "INVALID", message: "Invalid name or phone number." };
        }

        const isDuplicate = get().bookings.some(
          (b) =>
            b.date === data.date &&
            b.time === data.time &&
            (b.status === "confirmed" || b.status === "waitlisted" || b.status === "offered")
        );
        if (isDuplicate) {
          return {
            ok: false,
            reason: "DUPLICATE",
            message: "You already have an active reservation or waitlist entry for this slot.",
          };
        }

        const newBooking: Booking = {
          id: generateBookingId("FS-WL"),
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          name: valResult.data.name,
          phone: valResult.data.phone,
          status: "waitlisted",
          createdAt: now.toISOString(),
          joinedWaitlistAt: now.toISOString(),
        };

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
        }));

        return { ok: true, booking: newBooking };
      },

      cancelBooking: (id: string) => {
        const booking = get().bookings.find((b) => b.id === id);
        if (!booking) {
          return { ok: false, reason: "NOT_FOUND", message: "Booking not found." };
        }

        const now = new Date();
        const updatedBookings = get().bookings.map((b) =>
          b.id === id
            ? { ...b, status: "cancelled" as BookingStatus, cancelledAt: now.toISOString() }
            : b
        );

        // If this freed seats for a confirmed booking, try FIFO waitlist promotion
        if (booking.status === "confirmed") {
          const slotKey = `${booking.date}|${booking.time}`;
          const releasedSeats = get().released[slotKey] || 0;
          const availData = generateAvailabilityData(now);
          const dayData = availData.find((d) => d.date === booking.date);
          const slotData = dayData?.slots.find((s) => s.time === booking.time);

          if (slotData) {
            const statusResult = getSlotStatus(
              booking.date,
              booking.time,
              1,
              slotData.totalSeats,
              slotData.bookedSeats,
              releasedSeats,
              updatedBookings,
              now
            );

            if (statusResult.seatsLeft > 0) {
              const fifoResult = releaseSeatsFIFO(
                booking.date,
                booking.time,
                statusResult.seatsLeft,
                updatedBookings
              );
              set({ bookings: fifoResult.updatedBookings });
              return { ok: true };
            }
          }
        }

        set({ bookings: updatedBookings });
        return { ok: true };
      },

      leaveWaitlist: (id: string) => {
        return get().cancelBooking(id);
      },

      acceptOffer: (id: string) => {
        const booking = get().bookings.find((b) => b.id === id);
        if (!booking || booking.status !== "offered") {
          return { ok: false, reason: "NOT_FOUND", message: "Offer expired or not found." };
        }

        const now = new Date();
        const slotKey = `${booking.date}|${booking.time}`;
        const releasedCount = get().released[slotKey] || 0;
        const availData = generateAvailabilityData(now);
        const dayData = availData.find((d) => d.date === booking.date);
        const slotData = dayData?.slots.find((s) => s.time === booking.time);

        if (!slotData) {
          return { ok: false, reason: "INVALID", message: "Slot no longer exists." };
        }

        // Re-check capacity before confirming
        const otherConfirmed = get().bookings.filter((b) => b.id !== id);
        const status = getSlotStatus(
          booking.date,
          booking.time,
          booking.partySize,
          slotData.totalSeats,
          slotData.bookedSeats,
          releasedCount,
          otherConfirmed,
          now
        );

        if (status.state === "full" || status.state === "insufficient" || status.state === "past") {
          // Revert back to waitlisted
          set((state) => ({
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: "waitlisted" } : b
            ),
          }));
          return {
            ok: false,
            reason: "NO_SEATS",
            message: "Table was claimed by another guest. You are back on the waitlist.",
          };
        }

        // Confirm table
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: "confirmed" } : b
          ),
        }));

        return { ok: true };
      },

      declineOffer: (id: string) => {
        return get().cancelBooking(id);
      },

      simulateSeatsOpening: (date, time, seatsToRelease = 4) => {
        const now = new Date();
        const slotKey = `${date}|${time}`;

        const availData = generateAvailabilityData(now);
        const dayData = availData.find((d) => d.date === date);
        const slotData = dayData?.slots.find((s) => s.time === time);
        const baseBooked = slotData ? slotData.bookedSeats : 30;

        const currentReleased = get().released[slotKey] || 0;
        const newReleased = Math.min(baseBooked, currentReleased + seatsToRelease);

        const newReleasedRecord = {
          ...get().released,
          [slotKey]: newReleased,
        };

        // Calculate newly available seats
        const statusResult = getSlotStatus(
          date,
          time,
          1,
          slotData?.totalSeats || 30,
          baseBooked,
          newReleased,
          get().bookings,
          now
        );

        const fifoResult = releaseSeatsFIFO(
          date,
          time,
          statusResult.seatsLeft,
          get().bookings
        );

        set({
          released: newReleasedRecord,
          bookings: fifoResult.updatedBookings,
        });

        return { promoted: fifoResult.promotedCount };
      },

      resetBookings: () => set({ bookings: [], released: {} }),

      loadSampleBookings: (sampleBookings) => {
        set((state) => {
          // Remove existing sample bookings (idempotent replacement)
          const nonSampleBookings = state.bookings.filter(
            (b) => !b.isSample && !b.id.startsWith("FS-SAMPLE-")
          );
          return {
            bookings: [...sampleBookings, ...nonSampleBookings],
          };
        });
      },

      hasActiveOffers: () => {
        return get().bookings.some((b) => b.status === "offered");
      },
    }),
    {
      name: "flame-spice-bookings",
      version: 1,
      storage: createJSONStorage(() => safeJSONStorage),
      migrate: (persistedState, version) => {
        if (version === 0 || !persistedState) {
          return { bookings: [], released: {} };
        }
        return persistedState as BookingState;
      },
    }
  )
);
