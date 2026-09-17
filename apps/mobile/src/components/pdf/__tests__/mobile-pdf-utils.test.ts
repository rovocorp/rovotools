jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  cacheDirectory: "file:///cache/",
  documentDirectory: "file:///docs/",
  EncodingType: { Base64: "base64" },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  base64Encode,
  fileBytes,
  isDocxFile,
  isPdfFile,
  pickAnyDocument,
  pickDocument,
  replaceExtension,
  saveAndShare,
} from "../mobile-pdf-utils";

const getDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;
const getInfoAsync = FileSystem.getInfoAsync as jest.Mock;
const readAsStringAsync = FileSystem.readAsStringAsync as jest.Mock;
const writeAsStringAsync = FileSystem.writeAsStringAsync as jest.Mock;
const isAvailableAsync = Sharing.isAvailableAsync as jest.Mock;
const shareAsync = Sharing.shareAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("base64Encode / fileBytes", () => {
  it("round-trips arbitrary bytes", async () => {
    const bytes = Uint8Array.from([0, 1, 2, 72, 101, 108, 108, 111, 250, 255, 16, 32, 64]);
    const encoded = base64Encode(bytes);
    await expect(fileBytesFrom(encoded)).resolves.toEqual(bytes);
  });

  it("matches the RFC 4648 vector", () => {
    expect(base64Encode(Uint8Array.from([77, 97, 110]))).toBe("TWFu");
  });

  it("handles 1- and 2-byte remainders", async () => {
    for (const bytes of [Uint8Array.from([1]), Uint8Array.from([1, 2])]) {
      const encoded = base64Encode(bytes);
      await expect(fileBytesFrom(encoded)).resolves.toEqual(bytes);
    }
  });

  async function fileBytesFrom(encoded: string): Promise<Uint8Array> {
    getInfoAsync.mockResolvedValue({ exists: true, size: encoded.length });
    readAsStringAsync.mockResolvedValue(encoded);
    return fileBytes("file:///cache/x.bin");
  }

  it("refuses to buffer oversized files into memory", async () => {
    getInfoAsync.mockResolvedValue({ exists: true, size: 26 * 1024 * 1024 });
    await expect(fileBytes("file:///cache/huge.bin")).rejects.toThrow("exceeds the 25 MB limit");
    expect(readAsStringAsync).not.toHaveBeenCalled();
  });

  it("rejects missing files", async () => {
    getInfoAsync.mockResolvedValue({ exists: false });
    await expect(fileBytes("file:///cache/gone.bin")).rejects.toThrow("File not found.");
  });
});

describe("pickDocument", () => {
  it("returns null when the picker is cancelled", async () => {
    getDocumentAsync.mockResolvedValue({ canceled: true });
    await expect(pickDocument()).resolves.toBeNull();
  });

  it("maps the first asset", async () => {
    getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///cache/a.pdf", name: "a.pdf", size: 12 }],
    });
    await expect(pickDocument()).resolves.toEqual({
      uri: "file:///cache/a.pdf",
      name: "a.pdf",
      size: 12,
    });
  });

  it("pickAnyDocument accepts any file type", async () => {
    getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///cache/a.docx", name: "a.docx", size: 7 }],
    });
    await expect(pickAnyDocument()).resolves.toEqual({
      uri: "file:///cache/a.docx",
      name: "a.docx",
      size: 7,
    });
  });
});

describe("saveAndShare", () => {
  it("writes base64 bytes and opens the share sheet", async () => {
    isAvailableAsync.mockResolvedValue(true);
    const bytes = Uint8Array.from([37, 80, 68, 70]);
    await saveAndShare(bytes, "out.pdf", "application/pdf");
    expect(writeAsStringAsync).toHaveBeenCalledWith("file:///cache/out.pdf", base64Encode(bytes), {
      encoding: "base64",
    });
    expect(shareAsync).toHaveBeenCalled();
  });

  it("throws when sharing is unavailable", async () => {
    isAvailableAsync.mockResolvedValue(false);
    await expect(saveAndShare(Uint8Array.from([1]), "out.pdf", "application/pdf")).rejects.toThrow(
      "Sharing is not available",
    );
  });
});

describe("filename helpers", () => {
  it("detects extensions case-insensitively", () => {
    expect(isPdfFile("A.PDF")).toBe(true);
    expect(isPdfFile("a.png")).toBe(false);
    expect(isDocxFile("a.Docx")).toBe(true);
    expect(isDocxFile("a.pdf")).toBe(false);
  });

  it("replaces extensions", () => {
    expect(replaceExtension("a.docx", "pdf")).toBe("a.pdf");
  });
});
