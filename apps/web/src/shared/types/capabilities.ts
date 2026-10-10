import type { ToolPlatform } from "./tool";

export type NativeCapability =
  | "camera"
  | "file-system"
  | "share"
  | "local-storage"
  | "secure-storage"
  | "network";

export interface PlatformCapability {
  readonly platform: ToolPlatform;
  readonly supported: boolean;
  readonly offlineCapable: boolean;
  readonly localProcessing: boolean;
  readonly serverProcessing: boolean;
  readonly requiresNetwork: boolean;
  readonly requiredCapabilities: ReadonlyArray<NativeCapability>;
}

export type StorageKind = "localStorage" | "async-storage" | "secure-store" | "none";

export interface ToolCapabilityMatrix {
  readonly toolId: string;
  readonly slug: string;
  readonly name: string;
  readonly platforms: ReadonlyArray<PlatformCapability>;
  readonly requiresFileSystem: boolean;
  readonly requiresCamera: boolean;
  readonly shareable: boolean;
  readonly requiresNetwork: boolean;
  readonly offlineCapableOn: ReadonlyArray<ToolPlatform>;
  readonly storage: {
    readonly web: StorageKind;
    readonly mobile: StorageKind;
  };
}

export const MATRIX_PLATFORMS: ReadonlyArray<ToolPlatform> = [
  "WEB",
  "PWA",
  "ANDROID",
  "IOS",
];
