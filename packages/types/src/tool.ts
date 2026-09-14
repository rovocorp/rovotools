export type ToolCategory =
  | "utility"
  | "calculator"
  | "converter"
  | "analytics"
  | "validator"
  | "formatter"
  | "other"
  | "pdf"
  | "image"
  | "document"
  | "developer"
  | "text"
  | "security"
  | "design"
  | "color"
  | "qr"
  | "finance"
  | "seo";

export type ToolPlatform = "WEB" | "PWA" | "ANDROID" | "IOS";

export type ToolProcessingMode = "LOCAL" | "SERVER" | "HYBRID";

export type ToolFormat = string;

export type ToolInputType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "file"
  | "textarea"
  | "email"
  | "url";

export interface ToolInputField {
  readonly id: string;
  readonly type: ToolInputType;
  readonly labelKey: string;
  readonly placeholderKey?: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly options?: ReadonlyArray<{
    readonly value: string;
    readonly labelKey: string;
  }>;
  readonly validationSchema?: unknown;
  readonly descriptionKey?: string;
}

export interface ToolOutputField {
  readonly id: string;
  readonly type: ToolInputType;
  readonly labelKey: string;
  readonly descriptionKey?: string;
}

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface ToolSeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly keywords: ReadonlyArray<string>;
  readonly canonicalPath?: string;
  readonly image?: string;
  readonly noIndex?: boolean;
  readonly priority?: number;
  readonly changeFrequency?: SitemapChangeFrequency;
  readonly openGraphType?: "website" | "article";
  readonly twitterCard?: "summary" | "summary_large_image";
}

export interface ToolMetadata {
  readonly version: string;
  readonly author?: string;
  readonly isOfflineCapable: boolean;
  readonly tags: ReadonlyArray<string>;
}

export interface ToolDefinition<
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
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
}

export interface ValidationError {
  readonly fieldId: string;
  readonly code: string;
  readonly messageKey?: string;
  readonly message?: string;
}

export type ValidationSchema = unknown;

export type ToolInputMap = Record<string, unknown>;
export type ToolOutputMap = Record<string, unknown>;

export interface ToolRegistryEntry {
  readonly definition: ToolDefinition;
  readonly webComponentPath?: string;
  readonly mobileComponentPath?: string;
}

export type ToolSortField =
  | "name"
  | "slug"
  | "id"
  | "category"
  | "featured"
  | "popular";

export type SortDirection = "asc" | "desc";

export interface ToolQuery {
  readonly platform?: ToolPlatform;
  readonly category?: ToolCategory;
  readonly processingMode?: ToolProcessingMode;
  readonly featured?: boolean;
  readonly popular?: boolean;
  readonly offlineCapable?: boolean;
  readonly format?: string;
  readonly search?: string;
  readonly tags?: ReadonlyArray<string>;
  readonly sortBy?: ToolSortField;
  readonly sortDirection?: SortDirection;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ToolCategoryFacet {
  readonly category: ToolCategory;
  readonly count: number;
}

export interface ToolRoute {
  readonly id: string;
  readonly slug: string;
  readonly path: string;
  readonly params: {
    readonly toolId: string;
  };
}

export interface ToolSitemapEntry {
  readonly path: string;
  readonly url?: string;
  readonly priority?: number;
  readonly changeFrequency?: SitemapChangeFrequency;
  readonly noIndex?: boolean;
}

export interface ToolPageMetadata {
  readonly title: string;
  readonly description: string;
  readonly keywords: string;
  readonly canonicalPath: string;
  readonly canonicalUrl?: string;
  readonly image?: string;
  readonly noIndex?: boolean;
  readonly openGraphType?: "website" | "article";
  readonly twitterCard?: "summary" | "summary_large_image";
}

export interface RegistryIssue {
  readonly code: string;
  readonly toolId?: string;
  readonly message: string;
}

export type FavoriteToolIds = ReadonlyArray<string>;
export type RecentToolIds = ReadonlyArray<string>;
