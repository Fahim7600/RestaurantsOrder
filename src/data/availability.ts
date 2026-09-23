import { DayAvailability, TimeSlot } from "@/lib/types";
import { BOOKING_WINDOW_DAYS, TABLE_COUNT } from "@/lib/config";
import { toLocalISODate, addDays } from "@/lib/date";

/**
 * Deterministic hash function for a string seed.
 * Ensures server & client renders match 100% and refresh never changes seat counts.
 */
function seedHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const DEFAULT_SLOT_TIMES = ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"];

/**
 * Generate 14 days of deterministic table availability starting from the visitor's local today.
 * Guarantee inside any 14-day window:
 * - At least 2 fully booked slots (seatsLeft === 0)
 * - At least 2 near-full slots (seatsLeft <= 4)
 * - At least 1 entire day fully booked
 */
export function generateAvailabilityData(baseToday?: Date): DayAvailability[] {
  const todayStr = toLocalISODate(baseToday || new Date());
  const result: DayAvailability[] = [];

  for (let dayOffset = 0; dayOffset < BOOKING_WINDOW_DAYS; dayOffset++) {
    const dateStr = addDays(todayStr, dayOffset);
    const hash = seedHash(dateStr);

    // Rule 1: Make day 2 (offset 2) completely fully booked for testing
    const isEntireDayFull = dayOffset === 2;

    const slots: TimeSlot[] = DEFAULT_SLOT_TIMES.map((time, idx) => {
      const slotHash = seedHash(`${dateStr}-${time}`);
      const totalSeats = 30 + (slotHash % 11); // 30..40 seats total

      if (isEntireDayFull) {
        return { time, totalSeats, bookedSeats: totalSeats };
      }

      // Rule 2 & 3: Guarantee specific fully-booked and near-full slots
      // Day 0: 19:00 fully booked, 20:00 near full (3 seats left)
      if (dayOffset === 0) {
        if (time === "19:00") return { time, totalSeats, bookedSeats: totalSeats };
        if (time === "20:00") return { time, totalSeats, bookedSeats: totalSeats - 3 };
      }

      // Day 1: 13:00 fully booked, 12:00 near full (2 seats left)
      if (dayOffset === 1) {
        if (time === "13:00") return { time, totalSeats, bookedSeats: totalSeats };
        if (time === "12:00") return { time, totalSeats, bookedSeats: totalSeats - 2 };
      }

      // Deterministic fill calculation for other days
      const fillPercentage = ((slotHash + idx * 17) % 65) + 20; // 20% to 84% fill
      const bookedSeats = Math.min(
        totalSeats - 1,
        Math.floor((totalSeats * fillPercentage) / 100)
      );

      return { time, totalSeats, bookedSeats };
    });

    result.push({ date: dateStr, slots });
  }

  return result;
}

export const AVAILABILITY_DATA: DayAvailability[] = generateAvailabilityData();

export function getAvailabilityForDate(dateStr: string): DayAvailability | undefined {
  const current = generateAvailabilityData();
  return current.find((item) => item.date === dateStr);
}
