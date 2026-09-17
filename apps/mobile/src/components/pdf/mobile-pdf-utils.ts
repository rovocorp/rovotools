import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DEFAULT_MAX_FILE_BYTES, assertBytesWithinLimit } from '@rovotools/core';

export async function pickDocument(): Promise<{ uri: string; name: string; size: number } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets === undefined || result.assets.length === 0) {
    return null;
  }
  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.name ?? 'document.pdf', size: asset.size ?? 0 };
}

export async function pickAnyDocument(): Promise<{
  uri: string;
  name: string;
  size: number;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (result.canceled || result.assets === undefined || result.assets.length === 0) {
    return null;
  }
  const asset = result.assets[0];
  return { uri: asset.uri, name: asset.name ?? 'document', size: asset.size ?? 0 };
}

export async function fileBytes(uri: string, maxBytes = DEFAULT_MAX_FILE_BYTES): Promise<Uint8Array> {
  // Fail before readAsStringAsync(): an uncapped read lets a multi-GB
  // document exhaust the app's memory before any parser gets a say.
  // Matches the 25 MB picker policy (see validateFileMeta), enforced here
  // because these screens bypass the shared file picker.
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists === false) {
    throw new Error('File not found.');
  }
  if (typeof info.size === 'number') {
    assertBytesWithinLimit(info.size, maxBytes, 'File');
  }
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const clean = base64.replace(/\s+/g, '');
  const lookup = new Map<string, number>();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (let i = 0; i < alphabet.length; i += 1) {
    lookup.set(alphabet[i] as string, i);
  }
  let padding = 0;
  if (clean.endsWith('==')) {
    padding = 2;
  } else if (clean.endsWith('=')) {
    padding = 1;
  }
  const length = (clean.length / 4) * 3 - padding;
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup.get(clean[i] as string);
    const b = lookup.get(clean[i + 1] as string);
    const c = clean[i + 2] === '=' ? 0 : lookup.get(clean[i + 2] as string);
    const d = clean[i + 3] === '=' ? 0 : lookup.get(clean[i + 3] as string);
    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      throw new Error('Invalid base64.');
    }
    const triple = (a << 18) | (b << 12) | (c << 6) | d;
    if (offset < length) {
      bytes[offset] = (triple >> 16) & 255;
      offset += 1;
    }
    if (offset < length) {
      bytes[offset] = (triple >> 8) & 255;
      offset += 1;
    }
    if (offset < length) {
      bytes[offset] = triple & 255;
      offset += 1;
    }
  }
  return bytes;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64Encode(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const triple =
      ((bytes[i] as number) << 16) | ((bytes[i + 1] as number) << 8) | (bytes[i + 2] as number);
    out +=
      BASE64_ALPHABET[(triple >> 18) & 63] +
      BASE64_ALPHABET[(triple >> 12) & 63] +
      BASE64_ALPHABET[(triple >> 6) & 63] +
      BASE64_ALPHABET[triple & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const a = bytes[i] as number;
    out += BASE64_ALPHABET[a >> 2] + BASE64_ALPHABET[(a & 3) << 4] + '==';
  } else if (rem === 2) {
    const a = bytes[i] as number;
    const b = bytes[i + 1] as number;
    out +=
      BASE64_ALPHABET[a >> 2] +
      BASE64_ALPHABET[((a & 3) << 4) | (b >> 4)] +
      BASE64_ALPHABET[(b & 15) << 2] +
      '=';
  }
  return out;
}

export async function saveAndShare(bytes: Uint8Array, name: string, mime: string): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (cacheDir === undefined) {
    throw new Error('No cache directory available.');
  }
  const path = `${cacheDir}${name}`;
  const base64 = base64Encode(bytes);
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: mime, UTI: mime, dialogTitle: 'Share' });
  } else {
    throw new Error('Sharing is not available on this device.');
  }
}

export function isPdfFile(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf');
}

export function isDocxFile(name: string): boolean {
  return name.toLowerCase().endsWith('.docx');
}

export function replaceExtension(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, `.${ext}`);
}
