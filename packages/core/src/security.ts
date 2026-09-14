export interface FileMeta {
  readonly name: string;
  readonly mimeType?: string;
  readonly size?: number;
}

export interface FileValidationPolicy {
  readonly maxSizeBytes: number;
  readonly blockedExtensions: ReadonlyArray<string>;
  readonly blockedMimePrefixes: ReadonlyArray<string>;
}

export interface FileValidationResult {
  readonly valid: boolean;
  readonly reason?: string;
}

export const DEFAULT_MAX_FILE_BYTES = 25 * 1024 * 1024;

const DEFAULT_BLOCKED_EXTENSIONS: ReadonlyArray<string> = [
  "exe",
  "msi",
  "bat",
  "cmd",
  "com",
  "scr",
  "ps1",
  "vbs",
  "vbe",
  "jse",
  "wsf",
  "wsh",
  "jar",
  "apk",
  "ipa",
  "dll",
  "so",
  "dylib",
];

const DEFAULT_BLOCKED_MIME_PREFIXES: ReadonlyArray<string> = [
  "application/x-msdownload",
  "application/x-shockwave-flash",
];

export const DEFAULT_FILE_POLICY: FileValidationPolicy = {
  maxSizeBytes: DEFAULT_MAX_FILE_BYTES,
  blockedExtensions: DEFAULT_BLOCKED_EXTENSIONS,
  blockedMimePrefixes: DEFAULT_BLOCKED_MIME_PREFIXES,
};

function fileExtension(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) {
    return "";
  }
  return base.slice(dot + 1).toLowerCase();
}

export function validateFileMeta(
  file: FileMeta,
  policy: FileValidationPolicy = DEFAULT_FILE_POLICY,
): FileValidationResult {
  if (file.name.trim() === "") {
    return { valid: false, reason: "File name is missing." };
  }
  if (file.size !== undefined) {
    if (!Number.isFinite(file.size) || file.size < 0) {
      return { valid: false, reason: "File size is invalid." };
    }
    if (file.size > policy.maxSizeBytes) {
      return { valid: false, reason: "File exceeds the size limit." };
    }
  }
  const extension = fileExtension(file.name);
  if (extension !== "" && policy.blockedExtensions.includes(extension)) {
    return { valid: false, reason: "File type is not allowed." };
  }
  const mime = (file.mimeType ?? "").toLowerCase();
  if (mime !== "" && policy.blockedMimePrefixes.some((prefix) => mime.startsWith(prefix))) {
    return { valid: false, reason: "File type is not allowed." };
  }
  return { valid: true };
}

export function sanitizeFileName(name: string, fallback = "file"): string {
  const base = (name.split(/[\\/]/).pop() ?? "").replace(/\0/g, "").trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 128);
  return cleaned === "" ? fallback : cleaned;
}

export interface RateLimiter {
  allow(key: string): boolean;
}

export function createRateLimiter(
  limit: number,
  windowMs: number,
  now: () => number = Date.now,
): RateLimiter {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("Rate limit must be a positive integer.");
  }
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new RangeError("Rate window must be positive.");
  }
  const hits = new Map<string, Array<number>>();
  return {
    allow(key: string): boolean {
      const at = now();
      const windowStart = at - windowMs;
      const timestamps = (hits.get(key) ?? []).filter((stamp) => stamp > windowStart);
      if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return false;
      }
      timestamps.push(at);
      hits.set(key, timestamps);
      return true;
    },
  };
}
