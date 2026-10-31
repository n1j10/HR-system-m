import { z } from "zod";

// Small helpers for reading HTML form values with Zod.
// HTML forms always send strings, and an empty input sends "".

export const requiredText = z.string().trim().min(1, "This field is required");

export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || null);

/** Expects "YYYY-MM-DD" from <input type="date" />. */
export const requiredDate = z
  .string()
  .min(1, "Date is required")
  .transform((value) => new Date(value));

export const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value ? new Date(value) : null));

export const moneyAmount = z.coerce.number().min(0, "Amount cannot be negative");

export const optionalId = z
  .string()
  .optional()
  .transform((value) => value || null);

/** Converts FormData into a plain object so Zod can check it. */
export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

/** An optional whole number between `min` and `max`. Empty input becomes null. */
export function optionalWholeNumber(min: number, max: number) {
  return z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number().int().min(min).max(max).nullable());
}

/**
 * A link that is rendered in an <a href>. Only http(s) is allowed so a stored
 * "javascript:" URL can never run script in another user's browser (stored XSS).
 */
export const httpUrl = (message: string) => z.url({ protocol: /^https?$/, message });
