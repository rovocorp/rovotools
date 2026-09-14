import type {
  NativeCapability,
  PlatformCapability,
  ToolCapabilityMatrix,
  ToolDefinition,
  ToolPlatform,
} from "@rovotools/types";
import { MATRIX_PLATFORMS as PLATFORMS } from "@rovotools/types";

import { isAvailableOffline } from "./discovery";

function usesFileInput(definition: ToolDefinition): boolean {
  return definition.inputs.some((input) => input.type === "file");
}

function usesCameraInput(definition: ToolDefinition): boolean {
  return definition.inputs.some(
    (input) =>
      input.type === "file" &&
      (input.id.toLowerCase().includes("camera") ||
        input.id.toLowerCase().includes("photo")),
  );
}

export function getPlatformCapability(
  definition: ToolDefinition,
  platform: ToolPlatform,
): PlatformCapability {
  const supported = definition.supportedPlatforms.includes(platform);
  const fileSystem = usesFileInput(definition);
  const camera = usesCameraInput(definition);
  const shareable = definition.outputs.length > 0;
  const requiredCapabilities: NativeCapability[] = [];

  if (!supported) {
    return {
      platform,
      supported,
      offlineCapable: false,
      localProcessing: false,
      serverProcessing: false,
      requiresNetwork: definition.requiresNetwork,
      requiredCapabilities: [],
    };
  }

  const localProcessing = definition.processingMode === "LOCAL" || definition.processingMode === "HYBRID";
  const serverProcessing =
    definition.processingMode === "SERVER" || definition.processingMode === "HYBRID";

  requiredCapabilities.push("local-storage");
  if (fileSystem) {
    requiredCapabilities.push("file-system");
  }
  if (camera) {
    requiredCapabilities.push("camera");
  }
  if (shareable) {
    requiredCapabilities.push("share");
  }
  if (definition.requiresNetwork || serverProcessing) {
    requiredCapabilities.push("network");
  }

  return {
    platform,
    supported,
    offlineCapable: isAvailableOffline(definition, platform),
    localProcessing,
    serverProcessing,
    requiresNetwork: definition.requiresNetwork,
    requiredCapabilities,
  };
}

export function getToolCapabilityMatrix(definition: ToolDefinition): ToolCapabilityMatrix {
  const platforms = PLATFORMS.map((platform) => getPlatformCapability(definition, platform));
  return {
    toolId: definition.id,
    slug: definition.slug,
    name: definition.name,
    platforms,
    requiresFileSystem: usesFileInput(definition),
    requiresCamera: usesCameraInput(definition),
    shareable: definition.outputs.length > 0,
    requiresNetwork: definition.requiresNetwork,
    offlineCapableOn: platforms
      .filter((platform) => platform.offlineCapable)
      .map((platform) => platform.platform),
    storage: {
      web: "localStorage",
      mobile: "async-storage",
    },
  };
}
