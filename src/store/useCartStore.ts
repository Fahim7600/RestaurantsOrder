import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeJSONStorage } from "@/lib/storage";
import { MAX_QTY_PER_ITEM } from "@/lib/config";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  notes?: string;
  addedBy?: string;
}

export interface GroupSession {
  code: string;
  hostName: string;
  activeMember: string;
  members: string[];
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
  groupSession: GroupSession | null;

  // Drawer Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Group Session Actions
  startGroupSession: (hostName?: string) => void;
  joinGroupSession: (code: string, memberName: string) => void;
  addMemberToSession: (memberName: string) => void;
  leaveGroupSession: () => void;
  switchActiveMember: (memberName: string) => void;

  // Cart Actions
  addItem: (
    item: { menuItemId: string; name: string; price: number; image: string },
    qty?: number,
    notes?: string
  ) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;

  // Toast Action
  clearToast: () => void;

  // Derived Helper Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getPerMemberBreakdown: () => Record<string, number>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      toast: null,
      groupSession: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      startGroupSession: (hostName = "Host Diner") => {
        const randomCode = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
        set({
          groupSession: {
            code: randomCode,
            hostName,
            activeMember: hostName,
            members: [hostName],
          },
          toast: {
            id: Date.now().toString(),
            message: `Group Session Started (${randomCode})`,
            dishName: `Host: ${hostName}`,
          },
        });
      },

      joinGroupSession: (code, memberName) => {
        const formattedCode = code.toUpperCase().startsWith("ROOM-")
          ? code.toUpperCase()
          : `ROOM-${code}`;
        const current = get().groupSession;
        const members = current ? [...new Set([...current.members, memberName])] : [memberName];

        set({
          groupSession: {
            code: formattedCode,
            hostName: current?.hostName || memberName,
            activeMember: memberName,
            members,
          },
          toast: {
            id: Date.now().toString(),
            message: `Joined Group Session (${formattedCode})`,
            dishName: `Ordering as ${memberName}`,
          },
        });
      },

      addMemberToSession: (memberName) => {
        const current = get().groupSession;
        if (!current) return;
        const trimmed = memberName.trim();
        if (!trimmed || current.members.includes(trimmed)) return;

        set({
          groupSession: {
            ...current,
            members: [...current.members, trimmed],
            activeMember: trimmed,
          },
          toast: {
            id: Date.now().toString(),
            message: `Added companion ${trimmed}`,
            dishName: `Switched active diner to ${trimmed}`,
          },
        });
      },

      leaveGroupSession: () => {
        set({
          groupSession: null,
          toast: {
            id: Date.now().toString(),
            message: "Left group ordering session",
            dishName: "Group Session Closed",
          },
        });
      },

      switchActiveMember: (memberName) => {
        const current = get().groupSession;
        if (!current) return;
        set({
          groupSession: {
            ...current,
            activeMember: memberName,
          },
          toast: {
            id: Date.now().toString(),
            message: `Switched active diner to ${memberName}`,
            dishName: "Group Cart Switched",
          },
        });
      },

      addItem: (newItem, qty = 1, notes = "") => {
        const currentItems = get().items;
        const groupSession = get().groupSession;
        const currentDiner = groupSession ? groupSession.activeMember : "You";

        const existingIndex = currentItems.findIndex(
          (i) => i.menuItemId === newItem.menuItemId && (i.addedBy ?? "You") === currentDiner
        );

        let updatedItems: CartItem[];

        if (existingIndex > -1) {
          const currentQty = currentItems[existingIndex].qty;
          const newQty = currentQty + qty;

          if (currentQty >= MAX_QTY_PER_ITEM) {
            set({
              toast: {
                id: Date.now().toString(),
                message: `Max ${MAX_QTY_PER_ITEM} per dish`,
                dishName: newItem.name,
              },
            });
            return;
          }

          const clampedQty = Math.min(newQty, MAX_QTY_PER_ITEM);
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            qty: clampedQty,
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
              qty: Math.min(Math.max(1, qty), MAX_QTY_PER_ITEM),
              notes: notes || undefined,
              addedBy: currentDiner,
            },
          ];
        }

        set({
          items: updatedItems,
          toast: {
            id: Date.now().toString(),
            message: `Added to cart (${qty}x) by ${currentDiner}`,
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
        const clamped = Math.min(qty, MAX_QTY_PER_ITEM);
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, qty: clamped } : i
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

      getPerMemberBreakdown: () => {
        const items = get().items;
        const breakdown: Record<string, number> = {};
        items.forEach((item) => {
          const diner = item.addedBy || "You";
          breakdown[diner] = (breakdown[diner] || 0) + item.price * item.qty;
        });
        return breakdown;
      },
    }),
    {
      name: "flame-spice-cart",
      version: 3,
      storage: createJSONStorage(() => safeJSONStorage),
      partialize: (state) => ({ items: state.items, groupSession: state.groupSession }),
      migrate: (persistedState, version) => {
        if (version < 3 || !persistedState) {
          return { items: [], groupSession: null };
        }
        return persistedState as CartState;
      },
    }
  )
);
