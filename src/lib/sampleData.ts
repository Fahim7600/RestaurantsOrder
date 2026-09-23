import { Order } from "@/store/useOrderStore";
import { Booking } from "@/lib/booking";
import { useOrderStore } from "@/store/useOrderStore";
import { useBookingStore } from "@/store/useBookingStore";
import { MENU_ITEMS } from "@/data/menu";
import { toLocalISODate, addDays } from "./date";

/**
 * Helper to construct a sample order item from real menu items.
 */
function getMenuItemSnapshot(id: string, qty: number, notes?: string) {
  const item = MENU_ITEMS.find((m) => m.id === id) || MENU_ITEMS[0];
  return {
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    qty,
    notes,
  };
}

/**
 * Generate 4 sample orders (1-20 days ago) using real menu items.
 */
export function generateSampleOrders(now: Date = new Date()): Order[] {
  const todayStr = toLocalISODate(now);

  const itemKacchi = getMenuItemSnapshot("bd-1", 2, "Extra salad please");
  const itemBorhani = getMenuItemSnapshot("bd-9", 2);
  const itemChicken = getMenuItemSnapshot("in-1", 1);
  const itemNaan = getMenuItemSnapshot("in-4", 3, "Well done");
  const itemMorog = getMenuItemSnapshot("bd-2", 2);
  const itemFirni = getMenuItemSnapshot("bd-8", 2);
  const itemKebab = getMenuItemSnapshot("in-3", 2);

  const order1Items = [itemKacchi, itemBorhani];
  const order1Total = order1Items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const order2Items = [itemChicken, itemNaan];
  const order2Total = order2Items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const order3Items = [itemMorog, itemFirni];
  const order3Total = order3Items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const order4Items = [itemKebab, itemBorhani];
  const order4Total = order4Items.reduce((acc, i) => acc + i.price * i.qty, 0);

  const d2DaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d5DaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const d10DaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const d15DaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "FS-SAMPLE-ORD-1",
      placedAt: d2DaysAgo,
      type: "dine-in",
      dineIn: { tableNumber: 4 },
      items: order1Items,
      subtotal: order1Total,
      total: order1Total,
      customer: { name: "Sample Guest", phone: "01712345678" },
      kitchen: {
        tier: "rush",
        label: "Rush",
        waitRange: "45-50 min",
        emoji: "🟠",
      },
      estimatedReadyFrom: "7:45 PM",
      estimatedReadyTo: "7:50 PM",
      isSample: true,
    },
    {
      id: "FS-SAMPLE-ORD-2",
      placedAt: d5DaysAgo,
      type: "takeaway",
      pickup: { mode: "asap" },
      items: order2Items,
      subtotal: order2Total,
      total: order2Total,
      customer: { name: "Sample Guest", phone: "01712345678" },
      kitchen: {
        tier: "steady",
        label: "Steady",
        waitRange: "20-25 min",
        emoji: "🙂",
      },
      estimatedReadyFrom: "8:20 PM",
      estimatedReadyTo: "8:25 PM",
      isSample: true,
    },
    {
      id: "FS-SAMPLE-ORD-3",
      placedAt: d10DaysAgo,
      type: "takeaway",
      pickup: { mode: "scheduled", time: "19:30" },
      items: order3Items,
      subtotal: order3Total,
      total: order3Total,
      customer: { name: "Sample Guest", phone: "01712345678" },
      kitchen: {
        tier: "busy",
        label: "Busy",
        waitRange: "30-35 min",
        emoji: "🟡",
      },
      estimatedReadyFrom: "7:30 PM",
      estimatedReadyTo: "7:40 PM",
      isSample: true,
    },
    {
      id: "FS-SAMPLE-ORD-4",
      placedAt: d15DaysAgo,
      type: "dine-in",
      dineIn: { bookingId: "FS-SAMPLE-BK-1" },
      items: order4Items,
      subtotal: order4Total,
      total: order4Total,
      customer: { name: "Sample Guest", phone: "01712345678" },
      kitchen: {
        tier: "calm",
        label: "Calm",
        waitRange: "10-15 min",
        emoji: "🟢",
      },
      estimatedReadyFrom: "1:15 PM",
      estimatedReadyTo: "1:20 PM",
      isSample: true,
    },
  ];
}

/**
 * Generate sample bookings:
 * - 2 past confirmed (completed)
 * - 1 cancelled
 * - 1 upcoming confirmed on a slot >=2 days ahead
 * - 1 waitlisted entry on a slot inside window (to demo simulate button)
 */
export function generateSampleBookings(
  now: Date = new Date(),
  existingRealBookings: Booking[] = []
): Booking[] {
  const todayStr = toLocalISODate(now);

  const past1Date = addDays(todayStr, -5);
  const past2Date = addDays(todayStr, -12);
  const cancelledDate = addDays(todayStr, -3);
  const upcomingDate = addDays(todayStr, 3);
  const waitlistDate = addDays(todayStr, 1);

  const realKeys = new Set(
    existingRealBookings.map((b) => `${b.date}|${b.time}`)
  );

  const candidateBookings: Booking[] = [
    {
      id: "FS-SAMPLE-BK-1",
      date: past1Date,
      time: "19:00",
      partySize: 4,
      name: "Sample Guest",
      phone: "01712345678",
      status: "confirmed",
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "FS-SAMPLE-BK-2",
      date: past2Date,
      time: "20:00",
      partySize: 2,
      name: "Sample Guest",
      phone: "01712345678",
      status: "confirmed",
      createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "FS-SAMPLE-BK-3",
      date: cancelledDate,
      time: "18:30",
      partySize: 6,
      name: "Sample Guest",
      phone: "01712345678",
      status: "cancelled",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      cancelledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "FS-SAMPLE-BK-4",
      date: upcomingDate,
      time: "19:30",
      partySize: 2,
      name: "Sample Guest",
      phone: "01712345678",
      status: "confirmed",
      createdAt: now.toISOString(),
      isSample: true,
    },
    {
      id: "FS-SAMPLE-BK-5",
      date: waitlistDate,
      time: "20:00",
      partySize: 4,
      name: "Sample Guest",
      phone: "01712345678",
      status: "waitlisted",
      createdAt: now.toISOString(),
      joinedWaitlistAt: now.toISOString(),
      isSample: true,
    },
  ];

  // Gracefully filter out any sample booking that collides with real user bookings
  return candidateBookings.filter((b) => !realKeys.has(`${b.date}|${b.time}`));
}

/**
 * Load sample orders and bookings into stores idempotently.
 */
export function loadSampleHistory(): {
  ordersLoaded: number;
  bookingsLoaded: number;
} {
  const now = new Date();
  const sampleOrders = generateSampleOrders(now);

  const currentBookings = useBookingStore.getState().bookings;
  const realBookings = currentBookings.filter(
    (b) => !b.isSample && !b.id.startsWith("FS-SAMPLE-")
  );

  const sampleBookings = generateSampleBookings(now, realBookings);

  useOrderStore.getState().loadSampleOrders(sampleOrders);
  useBookingStore.getState().loadSampleBookings(sampleBookings);

  return {
    ordersLoaded: sampleOrders.length,
    bookingsLoaded: sampleBookings.length,
  };
}
