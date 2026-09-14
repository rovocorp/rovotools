import { describe, expect, it } from "vitest";

import {
  createRateLimiter,
  sanitizeFileName,
  validateFileMeta,
} from "./security";

describe("validateFileMeta", () => {
  it("accepts ordinary documents and images", () => {
    expect(validateFileMeta({ name: "report.pdf", mimeType: "application/pdf", size: 1024 })).toEqual({
      valid: true,
    });
    expect(validateFileMeta({ name: "photo.jpg", mimeType: "image/jpeg" })).toEqual({ valid: true });
  });

  it("rejects oversized and invalid sizes", () => {
    expect(validateFileMeta({ name: "big.bin", size: 26 * 1024 * 1024 }).valid).toBe(false);
    expect(validateFileMeta({ name: "x.txt", size: -1 }).valid).toBe(false);
    expect(validateFileMeta({ name: "", size: 10 }).valid).toBe(false);
  });

  it("blocks executables by extension and mime", () => {
    expect(validateFileMeta({ name: "setup.EXE" }).valid).toBe(false);
    expect(validateFileMeta({ name: "run.sh" }).valid).toBe(true);
    expect(
      validateFileMeta({ name: "driver.sys", mimeType: "application/x-msdownload" }).valid,
    ).toBe(false);
  });

  it("treats extension spoofing case-insensitively", () => {
    expect(validateFileMeta({ name: "invoice.pdf.exe" }).valid).toBe(false);
  });
});

describe("sanitizeFileName", () => {
  it("strips paths, null bytes, and unsafe characters", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("C:\\temp\\a b$c.txt")).toBe("a_b_c.txt");
    expect(sanitizeFileName("...")).toBe("file");
    expect(sanitizeFileName("")).toBe("file");
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit per window, then recovers", () => {
    let now = 0;
    const limiter = createRateLimiter(2, 1000, () => now);
    expect(limiter.allow("ip")).toBe(true);
    expect(limiter.allow("ip")).toBe(true);
    expect(limiter.allow("ip")).toBe(false);
    expect(limiter.allow("other")).toBe(true);
    now = 1001;
    expect(limiter.allow("ip")).toBe(true);
  });

  it("rejects invalid configuration", () => {
    expect(() => createRateLimiter(0, 1000)).toThrow(RangeError);
    expect(() => createRateLimiter(2, 0)).toThrow(RangeError);
  });
});
