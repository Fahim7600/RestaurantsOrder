import { create } from "zustand";

interface RestaurantState {
  // Store structure initialized for upcoming features (menu, cart, reservations)
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
