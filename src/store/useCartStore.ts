import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeJSONStorage } from "@/lib/storage";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  notes?: string;
}

interface ToastNotification {
  id: string;
  message: string;
  dishName: string;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  toast: ToastNotification | null;

  // Drawer Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Cart Actions
  addItem: (item: { menuItemId: string; name: string; price: number; image: string }, qty?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;

  // Toast Action
  clearToast: () => void;

  // Derived Helper Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      toast: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (newItem, qty = 1, notes = "") => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (i) => i.menuItemId === newItem.menuItemId
        );

        let updatedItems: CartItem[];

        if (existingIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            qty: updatedItems[existingIndex].qty + qty,
            notes: notes ? notes : updatedItems[existingIndex].notes,
          };
        } else {
          updatedItems = [
            ...currentItems,
            {
              menuItemId: newItem.menuItemId,
              name: newItem.name,
              price: newItem.price,
              image: newItem.image,
              qty: Math.max(1, qty),
              notes: notes || undefined,
            },
          ];
        }

        set({
          items: updatedItems,
          toast: {
            id: Date.now().toString(),
            message: `Added to cart (${qty}x)`,
            dishName: newItem.name,
          },
        });
      },

      removeItem: (menuItemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        }));
      },

      updateQty: (menuItemId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, qty } : i
          ),
        }));
      },

      updateNotes: (menuItemId: string, notes: string) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      clearToast: () => set({ toast: null }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },
    }),
    {
      name: "flame-spice-cart",
      version: 1,
      storage: createJSONStorage(() => safeJSONStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        if (version === 0 || !persistedState) {
          return { items: [] };
        }
        return persistedState as CartState;
      },
    }
  )
);
