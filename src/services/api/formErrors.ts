import { ApiError } from "./client";

/**
 * Standard form field error shape.
 *
 * source:
 * - 'validation': client-side validation error, shown when field IS touched
 * - 'api': server-side error, shown when field is NOT touched
 */
export interface FormFieldError {
  path: string;
  message: string;
  source: "validation" | "api";
}

/**
 * Result of parsing API errors.
 * Contains both field-specific errors and a general message (if present).
 */
export interface ApiErrorResult {
  fieldErrors: FormFieldError[];
  message: string | null;
}

/**
 * Parse API errors into both field-specific errors and a general message.
 * Expects API response shapes like:
 * - { errors: { field: ["message", ...] } }
 * - { message: "General error message" }
 * - { message: "General error", errors: { field: ["message"] } }
 */
export function parseApiErrors(error: ApiError): ApiErrorResult {
  const fieldErrors: FormFieldError[] = [];
  let message: string | null = null;

  const data = error.response as Record<string, unknown> | undefined;
  if (!data) return { fieldErrors, message };

  // Extract general message
  if (typeof data["message"] === "string") {
    message = data["message"];
  }

  // Extract field-specific errors
  const apiErrors = data["errors"] as Record<string, string[]> | undefined;
  if (apiErrors && typeof apiErrors === "object") {
    for (const [path, messages] of Object.entries(apiErrors)) {
      if (Array.isArray(messages)) {
        for (const message of messages) {
          fieldErrors.push({ path, message, source: "api" });
        }
      }
    }
  }

  return { fieldErrors, message };
}
