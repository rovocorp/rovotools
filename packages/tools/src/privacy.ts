import type {
  ToolDefinition,
  ToolInputField,
  ToolProcessingMode,
} from "@rovotools/types";

export type DataRetention = "memory-only" | "device-local" | "server-synced";

export type PrivacyPermission = "camera" | "photos" | "files";

export interface ToolPrivacyModel {
  readonly toolId: string;
  readonly slug: string;
  readonly processing: ToolProcessingMode;
  readonly offlineCapable: boolean;
  readonly permissions: ReadonlyArray<PrivacyPermission>;
  readonly collectsPersonalData: boolean;
  readonly storesInputs: boolean;
  readonly sharesWithServer: boolean;
  readonly retention: DataRetention;
}

function inputHints(input: ToolInputField): string {
  return `${input.id} ${input.labelKey}`.toLowerCase();
}

function usesCameraInput(definition: ToolDefinition): boolean {
  return definition.inputs.some((input) => {
    const hints = inputHints(input);
    return (
      input.type === "file" &&
      (hints.includes("camera") || hints.includes("photo") || hints.includes("image"))
    );
  });
}

function usesPhotoInput(definition: ToolDefinition): boolean {
  return definition.inputs.some((input) => {
    const hints = inputHints(input);
    return (
      input.type === "file" &&
      (hints.includes("picture") ||
        hints.includes("avatar") ||
        hints.includes("scan") ||
        hints.includes("photo") ||
        hints.includes("image"))
    );
  });
}

function usesFileInput(definition: ToolDefinition): boolean {
  return definition.inputs.some((input) => input.type === "file");
}

export function getToolPrivacyModel(definition: ToolDefinition): ToolPrivacyModel {
  const camera = usesCameraInput(definition);
  const photos = usesPhotoInput(definition);
  const files = usesFileInput(definition);
  const serverInvolved =
    definition.processingMode === "SERVER" || definition.processingMode === "HYBRID";

  const permissions: Array<PrivacyPermission> = [];
  if (camera) {
    permissions.push("camera");
  }
  if (photos) {
    permissions.push("photos");
  }
  if (files) {
    permissions.push("files");
  }

  return {
    toolId: definition.id,
    slug: definition.slug,
    processing: definition.processingMode,
    offlineCapable: definition.metadata.isOfflineCapable && !definition.requiresNetwork,
    permissions,
    collectsPersonalData: false,
    storesInputs: false,
    sharesWithServer: serverInvolved,
    retention: "memory-only",
  };
}
