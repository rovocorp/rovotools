import { describe, expect, it } from "vitest";

import {
  assertBytesWithinLimit,
  createRateLimiter,
  sanitizeFileName,
  sanitizeSpreadsheetCell,
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

describe("sanitizeSpreadsheetCell", () => {
  it("leaves plain text untouched", () => {
    expect(sanitizeSpreadsheetCell("Hello world")).toBe("Hello world");
    expect(sanitizeSpreadsheetCell("123")).toBe("123");
    expect(sanitizeSpreadsheetCell("")).toBe("");
  });

  it("neutralizes formula leaders, including whitespace-padded ones", () => {
    expect(sanitizeSpreadsheetCell("=cmd|'/c calc'!A0")).toBe("'=cmd|'/c calc'!A0");
    expect(sanitizeSpreadsheetCell("+1+1")).toBe("'+1+1");
    expect(sanitizeSpreadsheetCell("-1+1")).toBe("'-1+1");
    expect(sanitizeSpreadsheetCell("@SUM(1:1)")).toBe("'@SUM(1:1)");
    expect(sanitizeSpreadsheetCell("   =HYPERLINK(\"https://evil.example\")")).toBe(
      "'   =HYPERLINK(\"https://evil.example\")",
    );
  });

  it("truncates to the cell limit", () => {
    expect(sanitizeSpreadsheetCell("a".repeat(40000), 10)).toBe("a".repeat(10));
    expect(sanitizeSpreadsheetCell("=".repeat(40000), 4)).toBe("'====");
  });

  it("rejects invalid limits", () => {
    expect(() => sanitizeSpreadsheetCell("x", 0)).toThrow(RangeError);
  });
});

describe("assertBytesWithinLimit", () => {
  it("passes sizes within budget", () => {
    expect(() => assertBytesWithinLimit(100, 100)).not.toThrow();
    expect(() => assertBytesWithinLimit(0, 25 * 1024 * 1024)).not.toThrow();
  });

  it("throws a displayable error over budget", () => {
    expect(() => assertBytesWithinLimit(101, 100, "PDF file")).toThrow("PDF file exceeds the 0.0 MB limit.");
    expect(() => assertBytesWithinLimit(26 * 1024 * 1024, 25 * 1024 * 1024)).toThrow(
      "exceeds the 25 MB limit",
    );
  });

  it("rejects invalid sizes and limits", () => {
    expect(() => assertBytesWithinLimit(-1, 100)).toThrow(RangeError);
    expect(() => assertBytesWithinLimit(Number.NaN, 100)).toThrow(RangeError);
    expect(() => assertBytesWithinLimit(10, 0)).toThrow(RangeError);
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
