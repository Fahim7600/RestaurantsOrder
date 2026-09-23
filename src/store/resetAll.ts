import { useCartStore } from "./useCartStore";
import { useBookingStore } from "./useBookingStore";
import { useOrderStore } from "./useOrderStore";
import { useProfileStore } from "./useProfileStore";

/**
 * Single function to reset all stores and clear persisted keys in localStorage.
 * Does not force a page reload; Zustand state updates cleanly across the app.
 */
export function resetAllData(): { ok: boolean; message: string } {
  try {
    useCartStore.getState().clearCart();
    useBookingStore.getState().resetBookings();
    useOrderStore.getState().resetOrders();
    useProfileStore.getState().resetProfile();

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("flame-spice-cart");
        localStorage.removeItem("flame-spice-bookings");
        localStorage.removeItem("flame-spice-orders");
        localStorage.removeItem("flame-spice-profile");
      } catch (e) {
        console.warn("localStorage removal error:", e);
      }
    }

    return {
      ok: true,
      message: "All demo data, reservations, orders, and profile details have been reset.",
    };
  } catch (err) {
    console.error("Reset all data failed:", err);
    return {
      ok: false,
      message: "An error occurred while resetting storage data.",
    };
  }
}
