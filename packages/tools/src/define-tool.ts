import { ConfigurationError } from "@rovotools/core";
import type {
  ToolCategory,
  ToolDefinition,
  ToolFormat,
  ToolInputField,
  ToolMetadata,
  ToolOutputField,
  ToolPlatform,
  ToolProcessingMode,
  ToolSeoMetadata,
  ValidationResult,
} from "@rovotools/types";

const TOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface DefineToolOptions<
  TInput = Record<string, unknown>,
  TOutput = Record<string, unknown>,
> {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly icon: string;
  readonly keywords: ReadonlyArray<string>;
  readonly featured: boolean;
  readonly popular: boolean;
  readonly supportedPlatforms: ReadonlyArray<ToolPlatform>;
  readonly processingMode: ToolProcessingMode;
  readonly supportedFormats: ReadonlyArray<ToolFormat>;
  readonly requiresNetwork: boolean;
  readonly localizationKey: string;
  readonly relatedTools: ReadonlyArray<string>;
  readonly seo?: ToolSeoMetadata;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly metadata: ToolMetadata;
  readonly inputs: ReadonlyArray<ToolInputField>;
  readonly outputs: ReadonlyArray<ToolOutputField>;
  readonly validate: (input: TInput) => ValidationResult;
  readonly execute: (input: TInput) => Promise<TOutput>;
  readonly actionLabel?: string;
  readonly actionRunningLabel?: string;
}

function assertNonEmptyString(value: string, field: string, toolId: string): void {
  if (value.trim().length === 0) {
    throw new ConfigurationError(`Tool "${toolId}" requires a non-empty ${field}.`);
  }
}

function freezeStrings(values: ReadonlyArray<string>): ReadonlyArray<string> {
  return Object.freeze(values.map((value) => value));
}

export function defineTool<
  TInput = Record<string, unknown>,
  TOutput = Record<string, unknown>,
>(options: DefineToolOptions<TInput, TOutput>): ToolDefinition<TInput, TOutput> {
  const id = options.id.trim();
  const slug = options.slug.trim().toLowerCase();
  const name = options.name.trim();
  const description = options.description.trim();
  const icon = options.icon.trim();
  const localizationKey = options.localizationKey.trim();

  assertNonEmptyString(id, "id", options.id);
  assertNonEmptyString(slug, "slug", id);
  assertNonEmptyString(name, "name", id);
  assertNonEmptyString(description, "description", id);
  assertNonEmptyString(icon, "icon identifier", id);
  assertNonEmptyString(localizationKey, "localization key", id);
  assertNonEmptyString(options.nameKey, "name localization key", id);
  assertNonEmptyString(options.descriptionKey, "description localization key", id);

  if (!TOOL_SLUG_PATTERN.test(slug)) {
    throw new ConfigurationError(
      `Tool "${id}" has an invalid slug "${slug}". Use lowercase letters, numbers, and hyphens.`,
    );
  }

  if (options.supportedPlatforms.length === 0) {
    throw new ConfigurationError(`Tool "${id}" must support at least one platform.`);
  }

  const supportedPlatforms = Object.freeze(
    Array.from(new Set(options.supportedPlatforms)),
  );
  const relatedTools = freezeStrings(options.relatedTools.map((tool) => tool.trim()));

  for (const relatedTool of relatedTools) {
    if (relatedTool.length === 0) {
      throw new ConfigurationError(`Tool "${id}" has an empty related-tool reference.`);
    }
    if (relatedTool === id || relatedTool === slug) {
      throw new ConfigurationError(`Tool "${id}" cannot list itself as a related tool.`);
    }
  }

  const definition: ToolDefinition<TInput, TOutput> = {
    id,
    slug,
    name,
    description,
    category: options.category,
    icon,
    keywords: freezeStrings(options.keywords),
    featured: options.featured,
    popular: options.popular,
    supportedPlatforms,
    processingMode: options.processingMode,
    supportedFormats: freezeStrings(options.supportedFormats),
    requiresNetwork: options.requiresNetwork,
    localizationKey,
    relatedTools,
    ...(options.seo === undefined ? {} : { seo: options.seo }),
    nameKey: options.nameKey,
    descriptionKey: options.descriptionKey,
    metadata: options.metadata,
    inputs: Object.freeze([...options.inputs]),
    outputs: Object.freeze([...options.outputs]),
    validate: options.validate,
    execute: options.execute,
    ...(options.actionLabel === undefined ? {} : { actionLabel: options.actionLabel }),
    ...(options.actionRunningLabel === undefined ? {} : { actionRunningLabel: options.actionRunningLabel }),
  };

  return Object.freeze(definition);
}
