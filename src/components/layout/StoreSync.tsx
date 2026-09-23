"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function StoreSync() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "flame-spice-cart" || e.key === "flame-spice-bookings" || e.key === "flame-spice-profile") {
        useCartStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null;
}
