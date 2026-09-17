// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fileToBytes, WEB_MAX_UPLOAD_BYTES } from "../pdfUtils";

describe("fileToBytes", () => {
  it("reads blobs within budget", async () => {
    const bytes = await fileToBytes(new Blob(["hello"]));
    expect(Array.from(bytes)).toEqual([104, 101, 108, 108, 111]);
  });

  it("advertises the UI-promised 100 MB budget by default", () => {
    expect(WEB_MAX_UPLOAD_BYTES).toBe(100 * 1024 * 1024);
  });

  it("refuses to buffer oversized files into memory", async () => {
    await expect(fileToBytes(new Blob(["12345"]), 4)).rejects.toThrow("exceeds the 0.0 MB limit");
  });
});
