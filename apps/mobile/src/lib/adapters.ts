import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  CameraAdapter,
  FilePickerAdapter,
  KeyValueStorageAdapter,
  PickedFile,
  SecureStorageAdapter,
  ShareAdapter,
  ShareResult,
} from "@rovotools/types";
import { sanitizeFileName, validateFileMeta } from "@rovotools/core";

function toPickedFile(uri: string, name: string, mimeType?: string, size?: number): PickedFile | null {
  if (!validateFileMeta({ name, mimeType, size }).valid) {
    return null;
  }
  return {
    uri,
    name,
    ...(mimeType === undefined || mimeType === "" ? {} : { mimeType }),
    ...(size === undefined || size === null ? {} : { size }),
  };
}

function cancelled(result: { canceled?: boolean; cancelled?: boolean }): boolean {
  return result.canceled === true || result.cancelled === true;
}

export const mobileFilePicker: FilePickerAdapter = {
  async pickDocument(): Promise<PickedFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (cancelled(result) || result.assets == null || result.assets.length === 0) {
      return null;
    }
    const asset = result.assets[0];
    if (asset === undefined) {
      return null;
    }
    return toPickedFile(asset.uri, asset.name, asset.mimeType ?? undefined, asset.size ?? undefined);
  },
  async pickImage(): Promise<PickedFile | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (cancelled(result) || result.assets == null || result.assets.length === 0) {
      return null;
    }
    const asset = result.assets[0];
    if (asset === undefined) {
      return null;
    }
    const name = asset.fileName ?? `image-${Date.now()}.jpg`;
    return toPickedFile(asset.uri, name, asset.mimeType ?? undefined, asset.fileSize ?? undefined);
  },
};

export const mobileShare: ShareAdapter = {
  canShare(): boolean {
    return true;
  },
  async shareText(text: string, title?: string): Promise<ShareResult> {
    try {
      const outcome = await Share.share(
        title === undefined ? { message: text } : { message: text, title },
      );
      return { completed: outcome.action === Share.sharedAction, method: "sheet" };
    } catch {
      try {
        await Clipboard.setStringAsync(text);
        return { completed: true, method: "clipboard" };
      } catch {
        return { completed: false, method: "none" };
      }
    }
  },
  async shareFile(uri: string, mimeType?: string): Promise<ShareResult> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        return { completed: false, method: "none" };
      }
      await Sharing.shareAsync(uri, {
        ...(mimeType === undefined ? {} : { mimeType }),
        dialogTitle: "Share result",
      });
      return { completed: true, method: "sheet" };
    } catch {
      return { completed: false, method: "none" };
    }
  },
};

export async function copyText(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export async function exportTextFile(slug: string, text: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (baseDir === null || baseDir === undefined) {
      return false;
    }
    const path = `${baseDir}rovotools-${sanitizeFileName(slug, "result")}.txt`;
    await FileSystem.writeAsStringAsync(path, text);
    await Sharing.shareAsync(path, { dialogTitle: "Export results" });
    return true;
  } catch {
    return false;
  }
}

export const mobileStorage: KeyValueStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Persistence is best-effort on device.
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Persistence is best-effort on device.
    }
  },
};

export const mobileSecureStorage: SecureStorageAdapter = {
  kind: "secure-store",
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Secure storage is best-effort on device.
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Secure storage is best-effort on device.
    }
  },
};

export const mobileCamera: CameraAdapter = {
  async isAvailable(): Promise<boolean> {
    try {
      const permission = await ImagePicker.getCameraPermissionsAsync();
      return permission.granted || permission.canAskAgain;
    } catch {
      return false;
    }
  },
  async captureImage(): Promise<PickedFile | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (cancelled(result) || result.assets == null || result.assets.length === 0) {
      return null;
    }
    const asset = result.assets[0];
    if (asset === undefined) {
      return null;
    }
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
    return toPickedFile(asset.uri, name, asset.mimeType ?? undefined, asset.fileSize ?? undefined);
  },
};
