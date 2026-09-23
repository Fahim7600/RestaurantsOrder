"use client";

import { useState, useEffect } from "react";
import { getKitchenStatus, KitchenStatus } from "@/lib/kitchenStatus";

/**
 * Returns the current KitchenStatus and re-evaluates it every `intervalMs`
 * milliseconds (default 60 000 = 1 minute).
 *
 * Safe for SSR: returns the initial status synchronously, then starts the
 * interval only after mount so the server-rendered HTML matches.
 */
export function useKitchenStatus(intervalMs = 60_000): KitchenStatus {
  const [status, setStatus] = useState<KitchenStatus>(() =>
    getKitchenStatus(new Date())
  );

  useEffect(() => {
    // Re-evaluate immediately on mount in case of SSR/client mismatch
    setStatus(getKitchenStatus(new Date()));

    const id = setInterval(() => {
      setStatus(getKitchenStatus(new Date()));
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return status;
}
