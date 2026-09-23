/**
 * Generate a clean, readable reference ID (e.g. FS-BK-X89A2L).
 */
export function generateBookingId(prefix: string = "FS-BK"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit ambiguous chars O, 0, I, 1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}
