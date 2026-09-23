import { describe, it, expect } from "vitest";
import { getKitchenStatus } from "@/lib/kitchenStatus";

/** Helper: create a Date for today at the given hour:minute (local time). */
function atHour(h: number, m = 0): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

describe("getKitchenStatus", () => {
  // -------------------------------------------------------------------------
  // Closed / outside opening hours
  // -------------------------------------------------------------------------
  it("returns 'closed' at 10:59 (before opening)", () => {
    const status = getKitchenStatus(atHour(10, 59));
    expect(status.tier).toBe("closed");
  });

  it("returns 'closed' at 23:00 (at closing boundary)", () => {
    const status = getKitchenStatus(atHour(23, 0));
    expect(status.tier).toBe("closed");
  });

  it("returns 'closed' at midnight", () => {
    const status = getKitchenStatus(atHour(0, 0));
    expect(status.tier).toBe("closed");
  });

  it("returns 'closed' at 23:30 (after closing)", () => {
    const status = getKitchenStatus(atHour(23, 30));
    expect(status.tier).toBe("closed");
  });

  // -------------------------------------------------------------------------
  // Hour → tier mapping
  // -------------------------------------------------------------------------
  it("hour 11 → calm", () => {
    expect(getKitchenStatus(atHour(11, 0)).tier).toBe("calm");
  });

  it("hour 12 → busy", () => {
    expect(getKitchenStatus(atHour(12, 0)).tier).toBe("busy");
  });

  it("hour 13 → rush", () => {
    expect(getKitchenStatus(atHour(13, 0)).tier).toBe("rush");
  });

  it("hour 14 → busy", () => {
    expect(getKitchenStatus(atHour(14, 0)).tier).toBe("busy");
  });

  it("hour 15 → steady", () => {
    expect(getKitchenStatus(atHour(15, 0)).tier).toBe("steady");
  });

  it("hour 16 → calm", () => {
    expect(getKitchenStatus(atHour(16, 0)).tier).toBe("calm");
  });

  it("hour 17 → calm", () => {
    expect(getKitchenStatus(atHour(17, 0)).tier).toBe("calm");
  });

  it("hour 18 → steady", () => {
    expect(getKitchenStatus(atHour(18, 0)).tier).toBe("steady");
  });

  it("hour 19 → rush", () => {
    expect(getKitchenStatus(atHour(19, 0)).tier).toBe("rush");
  });

  it("hour 20 → full", () => {
    expect(getKitchenStatus(atHour(20, 0)).tier).toBe("full");
  });

  it("hour 21 → rush", () => {
    expect(getKitchenStatus(atHour(21, 0)).tier).toBe("rush");
  });

  it("hour 22 → busy", () => {
    expect(getKitchenStatus(atHour(22, 0)).tier).toBe("busy");
  });

  // -------------------------------------------------------------------------
  // Shape / metadata
  // -------------------------------------------------------------------------
  it("includes waitRange for open tiers", () => {
    const status = getKitchenStatus(atHour(11, 0));
    expect(status.waitRange).toBe("10–15 min");
    expect(status.label).toBe("Calm");
    expect(status.message).toBeTruthy();
    expect(status.ariaLabel).toContain("Calm");
  });

  it("full tier shows '60+ min' in waitRange", () => {
    const status = getKitchenStatus(atHour(20, 0));
    expect(status.waitRange).toBe("60+ min");
    expect(status.label).toBe("Full house");
  });

  it("closed status has waitRange '—'", () => {
    const status = getKitchenStatus(atHour(10, 0));
    expect(status.waitRange).toBe("—");
  });

  it("ariaLabel always includes tier label", () => {
    const status = getKitchenStatus(atHour(19, 0));
    expect(status.ariaLabel).toContain("Rush");
    expect(status.ariaLabel).toContain("45–50 min");
  });
});
