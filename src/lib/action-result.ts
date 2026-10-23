import type { ZodError } from "zod";

/** Every server action that is used by a form returns this shape. */
export type ActionResult = {
  success: boolean;
  message: string;
};

export const initialActionResult: ActionResult = { success: false, message: "" };

export function successResult(message: string): ActionResult {
  return { success: true, message };
}

export function errorResult(message: string): ActionResult {
  return { success: false, message };
}

/** Turns the first Zod error into a readable message like "Email: Invalid email". */
export function validationErrorResult(error: ZodError): ActionResult {
  const firstIssue = error.issues[0];
  const fieldName = firstIssue.path.join(".");
  const message = fieldName ? `${fieldName}: ${firstIssue.message}` : firstIssue.message;
  return errorResult(message);
}
