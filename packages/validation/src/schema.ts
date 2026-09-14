import type { ToolInputField, ToolDefinition, ValidationResult, ValidationError } from "@rovotools/types";
import { z } from "zod";

export function createInputSchema(fields: ReadonlyArray<ToolInputField>): z.AnyZodObject {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "string":
      case "textarea":
        schema = z.string();
        break;
      case "number":
        schema = z.number();
        break;
      case "boolean":
        schema = z.boolean();
        break;
      case "date":
        schema = z.date();
        break;
      case "email":
        schema = z.string().email();
        break;
      case "url":
        schema = z.string().url();
        break;
      case "select": {
        const values = field.options?.map((option) => option.value) ?? [];
        schema = values.length > 0 ? z.enum([values[0] as string, ...values.slice(1)]) : z.string();
        break;
      }
      default:
        schema = z.unknown();
    }

    if (
      field.required &&
      (field.type === "string" ||
        field.type === "textarea" ||
        field.type === "email" ||
        field.type === "url")
    ) {
      schema = (schema as z.ZodString).min(1, { message: `${field.id} is required` });
    } else if (!field.required) {
      schema = schema.optional();
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}

export function validateToolInput<T extends Record<string, unknown>>(
  input: T,
  fields: ReadonlyArray<ToolInputField>,
): ValidationResult {
  const schema = createInputSchema(fields);
  const result = schema.safeParse(input);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = [];
  const issues = result.error.issues;

  for (const issue of issues) {
    const path = issue.path.map((p) => (typeof p === "string" ? p : "")).join(".");
    errors.push({
      fieldId: path || "unknown",
      code: issue.code as string,
      message: issue.message,
    });
  }

  return { valid: false, errors };
}

export function createToolValidation<TInput extends Record<string, unknown>>(
  definition: ToolDefinition<TInput>,
): (input: TInput) => ValidationResult {
  return (input: TInput) => validateToolInput(input, definition.inputs as ReadonlyArray<ToolInputField>);
}
