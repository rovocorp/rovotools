import { describe, expect, it } from "vitest";

import { BROWSER_ONLY_TOOL_IDS, EXTRA_TOOLS } from "./catalog";
import { getAllCategoryMetadata } from "./categories";
import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

const SAMPLES: Record<string, Record<string, unknown>> = {
  "percentage-calculator": { value: "20", total: "200", oldValue: "150" },
  "compound-interest-calculator": { principal: "10000", rate: "5", years: "10", compoundsPerYear: "12" },
  "emi-calculator": { principal: "500000", rate: "8.5", years: "20" },
  "roi-calculator": { gain: "15000", cost: "10000" },
  "discount-calculator": { price: "100", discount: "25" },
  "vat-calculator": { amount: "100", rate: "20", mode: "add" },
  "unit-converter": { value: "10", from: "km", to: "mi" },
  "date-difference-calculator": { from: "2026-01-01", to: "2026-09-12" },
  "json-formatter": { json: '{"b":2,"a":1}', indent: "2" },
  "json-minifier": { json: '{ "a": 1, "b": 2 }' },
  "json-validator": { json: "[1,2,3]" },
  "json-to-yaml": { json: '{"name":"Rovo","free":true}' },
  "yaml-to-json": { yaml: "name: Rovo\nfree: true\ncount: 3" },
  "json-to-typescript": { json: '{"name":"Rovo","users":5}', name: "Site" },
  "csv-to-json": { csv: "name,age\nAda,36\nGrace,85" },
  "json-to-csv": { json: '[{"name":"Ada","age":36}]' },
  "base64-encoder": { text: "Hello RovoTools" },
  "base64-decoder": { base64: "SGVsbG8gUm92b1Rvb2xz" },
  "url-encoder": { text: "hello world?&=" },
  "url-decoder": { text: "hello%20world%3F%26%3D" },
  "jwt-decoder": {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  },
  "regex-tester": { pattern: "\\d+", flags: "g", text: "abc 123 def 456" },
  "diff-checker": { original: "line1\nline2", modified: "line1\nline3" },
  "uuid-generator": { count: "3" },
  "timestamp-converter": { value: "1726000000" },
  "word-counter": { text: "Hello world. This is a test." },
  "character-counter": { text: "Hello!" },
  "case-converter": { text: "hello world test" },
  "duplicate-line-remover": { text: "a\nb\na\nc", caseSensitive: "true" },
  "empty-line-remover": { text: "a\n\nb\n   \nc", trim: "true" },
  "text-cleaner": { text: "  too   many    spaces  \n\n\nnext" },
  "slug-generator": { title: "Hello World: A Test Post!" },
  "lorem-ipsum-generator": { count: "2", unit: "paragraphs" },
  "reading-time-calculator": { text: "word ".repeat(400), wpm: "200" },
  "password-generator": { length: "16", upper: "true", digits: "true", symbols: "false" },
  "password-strength-checker": { password: "Tr0ub4dor&3" },
  "hash-generator": { text: "hello" },
  "random-token-generator": { bytes: "16" },
  "hex-encoder": { text: "hello", mode: "encode" },
  "css-gradient-generator": { from: "#4f46e5", to: "#ec4899", angle: "135" },
  "css-box-shadow-generator": { x: "0", y: "8", blur: "24", spread: "0", color: "rgba(0,0,0,0.15)" },
  "css-border-radius-generator": { all: "12", topLeft: "", topRight: "", bottomRight: "", bottomLeft: "" },
  "css-button-generator": { bg: "#4f46e5", color: "#ffffff", padding: "12px 24px", radius: "8" },
  "color-converter": { color: "#4f46e5" },
  "color-contrast-checker": { foreground: "#000000", background: "#ffffff" },
  "url-qr-generator": { url: "https://rovotools.com" },
  "wifi-qr-generator": { ssid: "HomeNet", password: "secret123", security: "WPA" },
  "vcard-qr-generator": { name: "Ada Lovelace", phone: "+123", email: "ada@example.com", org: "RovoCorp" },
  "text-qr-generator": { text: "Hello QR" },
  "text-to-pdf": { text: "Hello PDF world" },
  "meta-tag-generator": { title: "Test Page Title Here For SEO", description: "A concise meta description for testing purposes, within ideal length bounds here.", url: "https://rovotools.com/test" },
  "svg-placeholder-generator": { width: "600", height: "400", bg: "#e5e7eb", fg: "#6b7280", label: "600 x 400" },
  "average-calculator": { numbers: "1, 2, 3, 4, 5" },
  "email-validator": { email: "ada@example.com" },
  "url-validator": { url: "https://rovotools.com/tools" },
  "number-formatter": { value: "1234567.891", decimals: "2", locale: "en-US" },
  "date-formatter": { date: "2026-09-12" },
  "random-number-generator": { min: "1", max: "100", count: "3" },
  "code-minifier": { code: "function add( a, b ) { // sum\n  return a + b;\n}", language: "js", mode: "minify" },
  "keyword-density-checker": { text: "Dogs are great. Dogs love walks. Cats are great too. Dogs and cats play.", top: "5", maxWords: "2" },
  "robots-txt-generator": { preset: "wordpress", sitemap: "https://example.com/sitemap.xml", disallow: "/private\ntmp", allow: "" },
  "adsense-earnings-calculator": { pageviews: "100000", mode: "ctr-cpc", ctr: "1.5", cpc: "0.25", rpm: "", currency: "USD" },
  "tax-calculator": { amount: "1000", region: "india", rate: "18", customRate: "", mode: "add" },
  "youtube-thumbnail-downloader": { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
};

describe("extended catalog", () => {
  it("registers 40+ tools with unique slugs and known categories", () => {
    registerCoreTools(toolRegistry);
    const all = toolRegistry.query({});
    expect(all.length).toBeGreaterThanOrEqual(40);
    const slugs = all.map((e) => e.definition.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const known = new Set(getAllCategoryMetadata().map((m) => m.category));
    for (const entry of all) {
      expect(known.has(entry.definition.category)).toBe(true);
      expect(entry.definition.inputs.length).toBeGreaterThan(0);
      expect(entry.definition.outputs.length).toBeGreaterThan(0);
    }
  });

  it("every extra tool validates and executes its sample", async () => {
    for (const entry of EXTRA_TOOLS) {
      if (BROWSER_ONLY_TOOL_IDS.has(entry.definition.id)) {
        // Canvas/file engines cannot run in Node: they must declare a file
        // input (so the capability matrix flags file-system) and cover their
        // pure helpers in a dedicated test file instead.
        expect(
          entry.definition.inputs.some((input) => input.type === "file"),
          `${entry.definition.id} must declare a file input`,
        ).toBe(true);
        continue;
      }
      const sample = SAMPLES[entry.definition.id];
      expect(sample, `missing sample for ${entry.definition.id}`).toBeDefined();
      const validation = entry.definition.validate(sample as Record<string, unknown>);
      expect(validation.valid, `${entry.definition.id}: ${JSON.stringify(validation.errors)}`).toBe(true);
      const output = (await entry.definition.execute(sample as Record<string, unknown>)) as Record<string, unknown>;
      for (const field of entry.definition.outputs) {
        expect(output[field.id], `${entry.definition.id} missing output ${field.id}`).not.toBeUndefined();
      }
    }
  }, 60000);
});
