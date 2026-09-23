import { MENU_ITEMS } from "./menu";
import { MenuItem } from "@/lib/types";

/**
 * Array of 6 featured/signature dish IDs.
 */
export const FEATURED_IDS: string[] = [
  "bd-1", // Old Dhaka Kacchi Biryani
  "in-1", // Chicken Tikka Masala
  "bd-2", // Traditional Morog Polao
  "in-4", // Garlic Butter Naan
  "bd-9", // Traditional Borhani
  "bd-8", // Royal Shahi Firni
];

/**
 * Resolves FEATURED_IDS against MENU_ITEMS.
 * - Skips any IDs not found in menu.ts gracefully.
 * - If fewer than 3 resolve, returns an empty array to hide the section.
 */
export function getFeaturedDishes(ids: string[] = FEATURED_IDS): MenuItem[] {
  const resolved = ids
    .map((id) => MENU_ITEMS.find((item) => item.id === id))
    .filter((item): item is MenuItem => Boolean(item));

  if (resolved.length < 3) {
    return [];
  }

  return resolved;
}
