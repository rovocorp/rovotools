import { ok, fail, type Result } from "@rovotools/core";
import type { ValidationResult, ValidationError } from "@rovotools/types";

export function validationToResult(validation: ValidationResult): Result<undefined, ReadonlyArray<ValidationError>> {
  if (validation.valid) {
    return ok(undefined);
  }
  return fail(validation.errors);
}

export function resultToValidation(success: boolean, data?: unknown): ValidationResult {
  if (success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: [
      {
        fieldId: "general",
        code: "ERROR",
        message: data ? String(data) : "An error occurred",
      },
    ],
  };
}
