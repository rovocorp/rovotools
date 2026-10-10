export interface PickedFile {
  readonly uri: string;
  readonly name: string;
  readonly mimeType?: string;
  readonly size?: number;
}

export interface FilePickerAdapter {
  pickDocument(): Promise<PickedFile | null>;
  pickImage(): Promise<PickedFile | null>;
}

export interface ShareResult {
  readonly completed: boolean;
  readonly method: "sheet" | "clipboard" | "none";
}

export interface ShareAdapter {
  canShare(): boolean | Promise<boolean>;
  shareText(text: string, title?: string): Promise<ShareResult>;
  shareFile(uri: string, mimeType?: string): Promise<ShareResult>;
}

export interface KeyValueStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface SecureStorageAdapter extends KeyValueStorageAdapter {
  readonly kind: "secure-store";
}

export interface CameraAdapter {
  isAvailable(): Promise<boolean>;
  captureImage(): Promise<PickedFile | null>;
}
