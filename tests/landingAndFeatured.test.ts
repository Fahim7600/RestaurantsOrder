import { describe, it, expect } from "vitest";
import { getFeaturedDishes, FEATURED_IDS } from "@/data/featured";
import { MENU_ITEMS } from "@/data/menu";

describe("Featured Dishes Resolver", () => {
  it("resolves default FEATURED_IDS into valid MenuItem objects", () => {
    const featured = getFeaturedDishes();
    expect(featured.length).toBeGreaterThanOrEqual(3);
    featured.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.price).toBeGreaterThan(0);
    });
  });

  it("skips non-existent dish IDs gracefully", () => {
    const customIds = ["bd-1", "non-existent-1", "in-1", "non-existent-2", "bd-2"];
    const featured = getFeaturedDishes(customIds);
    expect(featured).toHaveLength(3);
    expect(featured.map((f) => f.id)).toEqual(["bd-1", "in-1", "bd-2"]);
  });

  it("returns empty array if fewer than 3 dish IDs resolve", () => {
    const customIds = ["bd-1", "invalid-id-xyz"];
    const featured = getFeaturedDishes(customIds);
    expect(featured).toEqual([]);
  });
});

describe("Menu Query Parameter Parsing", () => {
  it("validates requested cuisines against known MENU_ITEMS", () => {
    const requestedCuisines = ["bangladeshi", "indian", "fake-cuisine"];
    const validDishes = MENU_ITEMS.filter((item) =>
      requestedCuisines.includes(item.cuisineId)
    );

    expect(validDishes.length).toBeGreaterThan(0);
    validDishes.forEach((item) => {
      expect(["bangladeshi", "indian"]).toContain(item.cuisineId);
    });
  });
});
