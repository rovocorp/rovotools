import {
  calculateAge,
  calculateBmi,
  calculateLoanPayment,
  calculateTip,
} from "@rovotools/calculations";
import type {
  ToolInputField,
  ToolRegistryEntry,
  ValidationResult,
} from "@rovotools/types";
import { validateToolInput } from "@rovotools/validation";

import { registerExtraTools } from "./catalog";
import { defineTool } from "./define-tool";
import { toolRegistry, type ToolRegistry } from "./registry";

const ALL_PLATFORMS = ["WEB", "PWA", "ANDROID", "IOS"] as const;

function stringField(
  id: string,
  labelKey: string,
  placeholderKey?: string,
): ToolInputField {
  return {
    id,
    type: "string",
    labelKey,
    ...(placeholderKey === undefined ? {} : { placeholderKey }),
    required: true,
  };
}

function structuralCheck(
  input: Record<string, unknown>,
  fields: ReadonlyArray<ToolInputField>,
): ValidationResult | null {
  const result = validateToolInput(input, fields);
  return result.valid ? null : result;
}

function engineError(toolId: string, error: unknown): ValidationResult {
  return {
    valid: false,
    errors: [
      {
        fieldId: "general",
        code: "ENGINE_ERROR",
        message: error instanceof Error ? error.message : `Tool "${toolId}" rejected the input.`,
      },
    ],
  };
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(String(value ?? ""));
}

const bmiInputs: ReadonlyArray<ToolInputField> = [
  stringField("weightKg", "tools.bmi-calculator.weight", "tools.bmi-calculator.weightPlaceholder"),
  stringField("heightCm", "tools.bmi-calculator.height", "tools.bmi-calculator.heightPlaceholder"),
];

const ageInputs: ReadonlyArray<ToolInputField> = [
  stringField("birthDate", "tools.age-calculator.birthDate", "tools.age-calculator.birthDatePlaceholder"),
  stringField("asOfDate", "tools.age-calculator.asOfDate", "tools.age-calculator.asOfDatePlaceholder"),
];

const tipInputs: ReadonlyArray<ToolInputField> = [
  stringField("billAmount", "tools.tip-calculator.bill", "tools.tip-calculator.billPlaceholder"),
  stringField("tipPercent", "tools.tip-calculator.percent", "tools.tip-calculator.percentPlaceholder"),
  stringField("people", "tools.tip-calculator.people", "tools.tip-calculator.peoplePlaceholder"),
];

const loanInputs: ReadonlyArray<ToolInputField> = [
  stringField("principal", "tools.loan-payment-calculator.principal"),
  stringField("annualRatePercent", "tools.loan-payment-calculator.rate"),
  stringField("years", "tools.loan-payment-calculator.years"),
];

const CORE_TOOLS: ReadonlyArray<ToolRegistryEntry> = [
  {
    definition: defineTool<Record<string, unknown>, Record<string, unknown>>({
      id: "bmi-calculator",
      slug: "bmi-calculator",
      name: "BMI Calculator",
      description: "Calculate body mass index from weight and height.",
      category: "calculator",
      icon: "activity",
      keywords: ["bmi", "body mass index", "weight", "health"],
      featured: true,
      popular: true,
      supportedPlatforms: [...ALL_PLATFORMS],
      processingMode: "LOCAL",
      supportedFormats: [],
      requiresNetwork: false,
      localizationKey: "tools.bmi-calculator",
      relatedTools: ["age-calculator"],
      seo: {
        title: "BMI Calculator | RovoTools",
        description: "Free BMI calculator. Compute body mass index from weight and height.",
        keywords: ["bmi calculator", "body mass index", "weight"],
      },
      nameKey: "tools.bmi-calculator.name",
      descriptionKey: "tools.bmi-calculator.description",
      metadata: { version: "1.0.0", isOfflineCapable: true, tags: ["health", "calculator"] },
      inputs: bmiInputs,
      outputs: [
        { id: "bmi", type: "number", labelKey: "tools.bmi-calculator.bmi" },
        { id: "category", type: "string", labelKey: "tools.bmi-calculator.category" },
      ],
      validate: (input) => {
        const structural = structuralCheck(input, bmiInputs);
        if (structural !== null) {
          return structural;
        }
        try {
          calculateBmi({ weightKg: toNumber(input["weightKg"]), heightCm: toNumber(input["heightCm"]) });
          return { valid: true, errors: [] };
        } catch (error) {
          return engineError("bmi-calculator", error);
        }
      },
      execute: async (input) =>
        ({ ...calculateBmi({ weightKg: toNumber(input["weightKg"]), heightCm: toNumber(input["heightCm"]) }) }),
    }),
  },
  {
    definition: defineTool<Record<string, unknown>, Record<string, unknown>>({
      id: "age-calculator",
      slug: "age-calculator",
      name: "Age Calculator",
      description: "Calculate exact age in years, months, and days.",
      category: "utility",
      icon: "calendar",
      keywords: ["age", "birthday", "date", "years"],
      featured: true,
      popular: true,
      supportedPlatforms: [...ALL_PLATFORMS],
      processingMode: "LOCAL",
      supportedFormats: [],
      requiresNetwork: false,
      localizationKey: "tools.age-calculator",
      relatedTools: ["bmi-calculator"],
      seo: {
        title: "Age Calculator | RovoTools",
        description: "Free age calculator. Find exact age in years, months, and days.",
        keywords: ["age calculator", "birthday", "date"],
      },
      nameKey: "tools.age-calculator.name",
      descriptionKey: "tools.age-calculator.description",
      metadata: { version: "1.0.0", isOfflineCapable: true, tags: ["date", "utility"] },
      inputs: ageInputs,
      outputs: [
        { id: "years", type: "number", labelKey: "tools.age-calculator.years" },
        { id: "months", type: "number", labelKey: "tools.age-calculator.months" },
        { id: "days", type: "number", labelKey: "tools.age-calculator.days" },
      ],
      validate: (input) => {
        const structural = structuralCheck(input, ageInputs);
        if (structural !== null) {
          return structural;
        }
        try {
          calculateAge({
            birthDate: String(input["birthDate"] ?? ""),
            asOfDate: String(input["asOfDate"] ?? ""),
          });
          return { valid: true, errors: [] };
        } catch (error) {
          return engineError("age-calculator", error);
        }
      },
      execute: async (input) =>
        ({
          ...calculateAge({
            birthDate: String(input["birthDate"] ?? ""),
            asOfDate: String(input["asOfDate"] ?? ""),
          }),
        }),
    }),
  },
  {
    definition: defineTool<Record<string, unknown>, Record<string, unknown>>({
      id: "tip-calculator",
      slug: "tip-calculator",
      name: "Tip Calculator",
      description: "Split bills and calculate tips per person.",
      category: "calculator",
      icon: "receipt",
      keywords: ["tip", "bill", "split", "restaurant"],
      featured: false,
      popular: true,
      supportedPlatforms: [...ALL_PLATFORMS],
      processingMode: "LOCAL",
      supportedFormats: [],
      requiresNetwork: false,
      localizationKey: "tools.tip-calculator",
      relatedTools: ["loan-payment-calculator"],
      seo: {
        title: "Tip Calculator | RovoTools",
        description: "Free tip calculator. Split restaurant bills fairly per person.",
        keywords: ["tip calculator", "bill split", "restaurant"],
      },
      nameKey: "tools.tip-calculator.name",
      descriptionKey: "tools.tip-calculator.description",
      metadata: { version: "1.0.0", isOfflineCapable: true, tags: ["money", "calculator"] },
      inputs: tipInputs,
      outputs: [
        { id: "tipAmount", type: "number", labelKey: "tools.tip-calculator.tip" },
        { id: "totalAmount", type: "number", labelKey: "tools.tip-calculator.total" },
        { id: "perPerson", type: "number", labelKey: "tools.tip-calculator.perPerson" },
      ],
      validate: (input) => {
        const structural = structuralCheck(input, tipInputs);
        if (structural !== null) {
          return structural;
        }
        try {
          calculateTip({
            billAmount: toNumber(input["billAmount"]),
            tipPercent: toNumber(input["tipPercent"]),
            people: toNumber(input["people"]),
          });
          return { valid: true, errors: [] };
        } catch (error) {
          return engineError("tip-calculator", error);
        }
      },
      execute: async (input) =>
        ({
          ...calculateTip({
            billAmount: toNumber(input["billAmount"]),
            tipPercent: toNumber(input["tipPercent"]),
            people: toNumber(input["people"]),
          }),
        }),
    }),
  },
  {
    definition: defineTool<Record<string, unknown>, Record<string, unknown>>({
      id: "loan-payment-calculator",
      slug: "loan-payment-calculator",
      name: "Loan Payment Calculator",
      description: "Estimate monthly loan payments and total interest.",
      category: "calculator",
      icon: "landmark",
      keywords: ["loan", "mortgage", "payment", "interest", "finance"],
      featured: true,
      popular: false,
      supportedPlatforms: [...ALL_PLATFORMS],
      processingMode: "LOCAL",
      supportedFormats: [],
      requiresNetwork: false,
      localizationKey: "tools.loan-payment-calculator",
      relatedTools: ["tip-calculator"],
      seo: {
        title: "Loan Payment Calculator | RovoTools",
        description: "Free loan calculator. Estimate monthly payments and total interest.",
        keywords: ["loan calculator", "mortgage", "monthly payment"],
      },
      nameKey: "tools.loan-payment-calculator.name",
      descriptionKey: "tools.loan-payment-calculator.description",
      metadata: { version: "1.0.0", isOfflineCapable: true, tags: ["finance", "calculator"] },
      inputs: loanInputs,
      outputs: [
        { id: "monthlyPayment", type: "number", labelKey: "tools.loan-payment-calculator.monthly" },
        { id: "totalInterest", type: "number", labelKey: "tools.loan-payment-calculator.interest" },
      ],
      validate: (input) => {
        const structural = structuralCheck(input, loanInputs);
        if (structural !== null) {
          return structural;
        }
        try {
          calculateLoanPayment({
            principal: toNumber(input["principal"]),
            annualRatePercent: toNumber(input["annualRatePercent"]),
            years: toNumber(input["years"]),
          });
          return { valid: true, errors: [] };
        } catch (error) {
          return engineError("loan-payment-calculator", error);
        }
      },
      execute: async (input) =>
        ({
          ...calculateLoanPayment({
            principal: toNumber(input["principal"]),
            annualRatePercent: toNumber(input["annualRatePercent"]),
            years: toNumber(input["years"]),
          }),
        }),
    }),
  },
];

export function registerCoreTools(registry: ToolRegistry = toolRegistry): ToolRegistry {
  for (const entry of CORE_TOOLS) {
    if (!registry.has(entry.definition.id)) {
      registry.register(entry);
    }
  }
  registerExtraTools(registry);
  return registry;
}

