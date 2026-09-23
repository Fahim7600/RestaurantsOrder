import { DayAvailability } from "@/lib/types";

// Generate 14 days of realistic table availability starting from today
function generate14DaysAvailability(): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();

  // Pattern matrix to create varied, non-identical booking levels
  const slotPatterns = [
    // Pattern 0 (Peak Weekend style - heavy bookings, some fully booked)
    [
      { time: "12:00", totalSeats: 30, bookedSeats: 30 }, // FULL
      { time: "13:00", totalSeats: 25, bookedSeats: 21 },
      { time: "14:00", totalSeats: 20, bookedSeats: 8 },
      { time: "19:00", totalSeats: 35, bookedSeats: 35 }, // FULL
      { time: "20:00", totalSeats: 40, bookedSeats: 38 },
      { time: "21:00", totalSeats: 30, bookedSeats: 14 },
    ],
    // Pattern 1 (Moderate weekday)
    [
      { time: "12:00", totalSeats: 24, bookedSeats: 12 },
      { time: "13:00", totalSeats: 30, bookedSeats: 26 },
      { time: "14:00", totalSeats: 20, bookedSeats: 4 },
      { time: "19:00", totalSeats: 40, bookedSeats: 28 },
      { time: "20:00", totalSeats: 40, bookedSeats: 40 }, // FULL
      { time: "21:00", totalSeats: 25, bookedSeats: 9 },
    ],
    // Pattern 2 (Light day)
    [
      { time: "12:00", totalSeats: 30, bookedSeats: 6 },
      { time: "13:00", totalSeats: 30, bookedSeats: 15 },
      { time: "14:00", totalSeats: 20, bookedSeats: 2 },
      { time: "19:00", totalSeats: 35, bookedSeats: 18 },
      { time: "20:00", totalSeats: 35, bookedSeats: 22 },
      { time: "21:00", totalSeats: 30, bookedSeats: 5 },
    ],
    // Pattern 3 (Dinner rush)
    [
      { time: "12:00", totalSeats: 20, bookedSeats: 8 },
      { time: "13:00", totalSeats: 25, bookedSeats: 14 },
      { time: "14:00", totalSeats: 25, bookedSeats: 5 },
      { time: "19:00", totalSeats: 30, bookedSeats: 30 }, // FULL
      { time: "20:00", totalSeats: 35, bookedSeats: 34 },
      { time: "21:00", totalSeats: 30, bookedSeats: 28 },
    ],
  ];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    // Format ISO string YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const patternIndex = i % slotPatterns.length;
    const slots = slotPatterns[patternIndex].map((s) => ({ ...s }));

    result.push({
      date: dateStr,
      slots,
    });
  }

  return result;
}

export const AVAILABILITY_DATA: DayAvailability[] = generate14DaysAvailability();

export function getAvailabilityForDate(dateStr: string): DayAvailability | undefined {
  return AVAILABILITY_DATA.find((item) => item.date === dateStr);
}
