import { StateStorage, StorageValue } from "zustand/middleware";

class InMemoryStorage implements StateStorage {
  private memory = new Map<string, string>();

  getItem(name: string): string | null {
    return this.memory.get(name) ?? null;
  }

  setItem(name: string, value: string): void {
    this.memory.set(name, value);
  }

  removeItem(name: string): void {
    this.memory.delete(name);
  }
}

const memoryFallback = new InMemoryStorage();

/**
 * SSR-safe, error-resilient LocalStorage wrapper.
 * Catches quota errors, private browsing restrictions, and corrupted JSON.
 */
export const safeJSONStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;
      // Test parsing JSON to catch corruption early
      JSON.parse(item);
      return item;
    } catch {
      // Corrupted JSON or storage error -> clear and return null
      try {
        localStorage.removeItem(name);
      } catch {
        // ignore
      }
      return memoryFallback.getItem(name);
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") {
      memoryFallback.setItem(name, value);
      return;
    }
    try {
      localStorage.setItem(name, value);
    } catch {
      memoryFallback.setItem(name, value);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === "undefined") {
      memoryFallback.removeItem(name);
      return;
    }
    try {
      localStorage.removeItem(name);
    } catch {
      memoryFallback.removeItem(name);
    }
  },
};
