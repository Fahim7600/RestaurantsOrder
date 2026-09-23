import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeJSONStorage } from "@/lib/storage";
import { generateOrderId } from "@/lib/checkout";
import { KitchenStatus } from "@/lib/kitchenStatus";
import { CartItem } from "@/store/useCartStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  notes?: string;
}

export interface DineInDetails {
  bookingId?: string;
  tableNumber?: number;
}

export interface PickupDetails {
  mode: "asap" | "scheduled";
  time?: string; // "HH:MM", only when mode === "scheduled"
}

export type KitchenSnapshot = Pick<
  KitchenStatus,
  "tier" | "label" | "waitRange" | "emoji"
>;

export interface Order {
  id: string;
  placedAt: string; // ISO
  type: "takeaway" | "dine-in";
  dineIn?: DineInDetails;
  pickup?: PickupDetails;
  items: OrderItem[];
  subtotal: number;
  total: number; // = subtotal (no fees)
  customer: { name: string; phone?: string };
  note?: string;
  kitchen: KitchenSnapshot;
  estimatedReadyFrom: string; // "7:35 PM"
  estimatedReadyTo: string;   // "7:45 PM"
}

export type OrderFailureReason =
  | "EMPTY_CART"
  | "INVALID_DINE_IN"
  | "INVALID_CONTACT"
  | "STORAGE_ERROR"
  | "UNKNOWN";

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: OrderFailureReason; message: string };

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

export interface PlaceOrderInput {
  type: "takeaway" | "dine-in";
  dineIn?: DineInDetails;
  pickup?: PickupDetails;
  items: CartItem[];
  customer: { name: string; phone?: string };
  note?: string;
  kitchen: KitchenSnapshot;
  estimatedReadyFrom: string;
  estimatedReadyTo: string;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface OrderState {
  orders: Order[];

  placeOrder: (input: PlaceOrderInput) => PlaceOrderResult;
  getOrder: (id: string) => Order | undefined;
  getLatestOrder: () => Order | undefined;
  resetOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (input) => {
        if (!input.items.length) {
          return {
            ok: false,
            reason: "EMPTY_CART",
            message: "Your cart is empty.",
          };
        }

        if (!input.customer.name || input.customer.name.trim().length < 2) {
          return {
            ok: false,
            reason: "INVALID_CONTACT",
            message: "A valid name is required.",
          };
        }

        const order: Order = {
          id: generateOrderId(),
          placedAt: new Date().toISOString(),
          type: input.type,
          dineIn: input.dineIn,
          pickup: input.pickup,
          items: input.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            image: i.image,
            qty: i.qty,
            notes: i.notes,
          })),
          subtotal: input.items.reduce((s, i) => s + i.price * i.qty, 0),
          total: input.items.reduce((s, i) => s + i.price * i.qty, 0),
          customer: input.customer,
          note: input.note || undefined,
          kitchen: input.kitchen,
          estimatedReadyFrom: input.estimatedReadyFrom,
          estimatedReadyTo: input.estimatedReadyTo,
        };

        // Try to persist before committing — detect storage failure
        try {
          // Optimistically update state
          set((state) => ({
            orders: [order, ...state.orders],
          }));

          // Verify it was actually saved by reading back
          const saved = safeJSONStorage.getItem("flame-spice-orders");
          if (saved === null && typeof window !== "undefined") {
            // Storage unavailable — roll back
            set((state) => ({
              orders: state.orders.filter((o) => o.id !== order.id),
            }));
            return {
              ok: false,
              reason: "STORAGE_ERROR",
              message:
                "We couldn't save your order on this device. Your cart is untouched.",
            };
          }

          return { ok: true, order };
        } catch {
          // Roll back on any error
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== order.id),
          }));
          return {
            ok: false,
            reason: "STORAGE_ERROR",
            message:
              "We couldn't save your order on this device. Your cart is untouched.",
          };
        }
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),

      getLatestOrder: () => get().orders[0],

      resetOrders: () => set({ orders: [] }),
    }),
    {
      name: "flame-spice-orders",
      version: 1,
      storage: createJSONStorage(() => safeJSONStorage),
      migrate: (persistedState, version) => {
        if (version === 0 || !persistedState) {
          return { orders: [] };
        }
        return persistedState as OrderState;
      },
    }
  )
);
