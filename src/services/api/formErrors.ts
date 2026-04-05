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
 * Parse API validation errors into FormFieldError[].
 * Expects the API response shape: { errors: { field: ["message", ...] } }
 */
export function parseApiErrors(error: ApiError): FormFieldError[] {
  const errors: FormFieldError[] = [];
  const data = error.response as Record<string, unknown> | undefined;
  if (!data) return errors;

  const apiErrors = data["errors"] as Record<string, string[]> | undefined;
  if (apiErrors && typeof apiErrors === "object") {
    for (const [path, messages] of Object.entries(apiErrors)) {
      if (Array.isArray(messages)) {
        for (const message of messages) {
          errors.push({ path, message, source: "api" });
        }
      }
    }
  }
  return errors;
}
