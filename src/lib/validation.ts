import { z } from "zod";

/**
 * Strip spaces, dashes, parentheses from Bangladeshi phone string.
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export const nameSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 2, {
    message: "Name must be at least 2 characters.",
  })
  .refine((val) => val.length <= 60, {
    message: "Name cannot exceed 60 characters.",
  });

export const phoneSchema = z
  .string()
  .transform((val) => cleanPhoneNumber(val))
  .refine((val) => BD_PHONE_REGEX.test(val), {
    message: "Please enter a valid Bangladeshi mobile number (e.g. 01700000000).",
  });

export const bookingDetailsSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
});

export type BookingDetailsInput = z.infer<typeof bookingDetailsSchema>;

/** Table number: integer 1..TABLE_COUNT */
export const tableNumberSchema = z
  .number({ message: "Table number must be a whole number." })
  .int({ message: "Table number must be a whole number, no decimals." })
  .min(1, { message: "Table number must be at least 1." })
  .max(20, { message: "Table number cannot exceed 20." });

/** Raw string form of table number for HTML input */
export const tableNumberStringSchema = z
  .string()
  .min(1, { message: "Table number is required." })
  .transform((val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) throw new Error("Must be a number.");
    return n;
  })
  .pipe(tableNumberSchema);

/** Order note: optional, max 200 chars */
export const orderNoteSchema = z
  .string()
  .max(200, { message: "Note cannot exceed 200 characters." })
  .optional()
  .or(z.literal(""));

/** Contact details for checkout: phone required for takeaway, optional for dine-in */
export const checkoutContactSchema = z.object({
  name: nameSchema,
  phone: z.string().optional(),
});

export type CheckoutContactInput = z.infer<typeof checkoutContactSchema>;
