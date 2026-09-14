import type { ValidationError } from "@rovotools/core";
import type { ValidationResult } from "@rovotools/types";

export function runCustomValidation<T>(
  input: T,
  validators: ReadonlyArray<(input: T) => ValidationResult | Promise<ValidationResult>>,
): Promise<ValidationResult> {
  return Promise.all(validators.map((v) => v(input))).then((results) => {
    const allErrors = results.flatMap((r) => r.errors);
    const hasError = results.some((r) => !r.valid);
    return { valid: !hasError, errors: allErrors };
  });
}

export function combineValidationResults(
  results: ReadonlyArray<ValidationResult>,
): ValidationResult {
  const allErrors = results.flatMap((r) => r.errors);
  const hasError = results.some((r) => !r.valid);
  return { valid: !hasError, errors: allErrors };
}

export function toToolError(error: ValidationError): ValidationError {
  return error;
}
