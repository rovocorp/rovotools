import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// 1x1 red PNG used as the upload fixture for file-based tools.
const FIXTURE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function ensureFixtureImage(path: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.from(FIXTURE_BASE64, "base64"));
  return path;
}

export function fixturePath(): string {
  return join(process.cwd(), "test-results", "fixture.png");
}
