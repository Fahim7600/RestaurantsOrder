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
