import type {
  ToolCategory,
  ToolInputField,
  ToolOutputField,
  ToolRegistryEntry,
  ValidationResult,
} from "@rovotools/types";

import { defineTool } from "./define-tool";
import type { ToolRegistry } from "./registry";

const ALL_PLATFORMS = ["WEB", "PWA", "ANDROID", "IOS"] as const;

function str(id: string, label: string, required = true): ToolInputField {
  return { id, type: "string", labelKey: label, required };
}

function area(id: string, label: string, required = true): ToolInputField {
  return { id, type: "textarea", labelKey: label, required };
}

function flag(id: string, label: string, defaultValue: boolean): ToolInputField {
  return { id, type: "boolean", labelKey: label, required: false, defaultValue };
}

function out(id: string, label: string): ToolOutputField {
  return { id, type: "string", labelKey: label };
}

function numOut(id: string, label: string): ToolOutputField {
  return { id, type: "number", labelKey: label };
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function err(fieldId: string, message: string): ValidationResult {
  return { valid: false, errors: [{ fieldId, code: "INVALID_INPUT", message }] };
}

function req(input: Record<string, unknown>, id: string): string {
  return String(input[id] ?? "").trim();
}

function reqNum(input: Record<string, unknown>, id: string): number {
  return Number(String(input[id] ?? ""));
}

function b64encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

function b64decode(b64: string): string {
  const clean = b64.trim().replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function b64urlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (padded.length % 4)) % 4;
  return b64decode(padded + "=".repeat(pad));
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function djb2(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash, 33) ^ text.charCodeAt(i);
  }
  return `djb2:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function shaHex(algorithm: "SHA-256" | "SHA-512", text: string): Promise<string | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle === undefined) {
      return null;
    }
    const digest = await subtle.digest(algorithm, new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

function randomChars(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length);
  const g = globalThis.crypto;
  if (g?.getRandomValues !== undefined) {
    g.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let outStr = "";
  for (let i = 0; i < length; i += 1) {
    outStr += alphabet[(bytes[i] as number) % alphabet.length];
  }
  return outStr;
}

const CODE_STRING_TOKEN = "\u0000";

function protectCodeStrings(code: string): { text: string; strings: Array<string> } {
  const strings: Array<string> = [];
  const text = code.replace(/(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g, (m) => {
    strings.push(m);
    return `${CODE_STRING_TOKEN}${strings.length - 1}${CODE_STRING_TOKEN}`;
  });
  return { text, strings };
}

function restoreCodeStrings(text: string, strings: Array<string>): string {
  return text.replace(/\u0000(\d+)\u0000/g, (_m, i) => strings[Number(i)] ?? "");
}

function normalizeCodeLanguage(raw: string): "html" | "css" | "js" {
  const lang = raw.trim().toLowerCase();
  if (lang === "" || lang === "js" || lang === "javascript") {
    return "js";
  }
  if (lang === "css") {
    return "css";
  }
  if (lang === "html") {
    return "html";
  }
  throw new RangeError(`Unsupported language "${raw}". Use html, css or js.`);
}

function minifyCode(code: string, lang: "html" | "css" | "js"): string {
  const { text, strings } = protectCodeStrings(code);
  let t = text.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (lang === "js") {
    // Line comments. The : in the guard keeps URL schemes like https:// intact.
    t = t.replace(/(^|[^:\w$'"\\/])\/\/[^\n]*/g, "$1");
  }
  if (lang === "html") {
    t = t.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  } else if (lang === "css") {
    t = t.replace(/\s+/g, " ").replace(/\s*([{}:;,>+~])\s*/g, "$1").replace(/;}/g, "}").trim();
  } else {
    t = t.replace(/\s+/g, " ").replace(/\s*([{}();,=[\]+\-*/%<>!&|?~^])\s*/g, "$1").trim();
  }
  return restoreCodeStrings(t, strings);
}

const HTML_VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function beautifyCode(code: string, lang: "html" | "css" | "js"): string {
  const { text, strings } = protectCodeStrings(code);
  const lines: Array<string> = [];
  if (lang === "html") {
    const parts = text.replace(/>\s*</g, ">\n<").split("\n").map((s) => s.trim()).filter((s) => s !== "");
    let depth = 0;
    for (const part of parts) {
      const close = /^<\//.test(part);
      const tagName = (part.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/) ?? [])[1]?.toLowerCase() ?? "";
      const selfClosing = /\/>$/.test(part) || HTML_VOID_ELEMENTS.has(tagName) || /^<!/.test(part);
      // Inline open+close on one line (<p>hi</p>) changes no depth.
      const inlineMatch = part.match(/^<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>.*<\/\1>$/);
      const inline = !close && !selfClosing && inlineMatch !== null;
      if (close) {
        depth = Math.max(0, depth - 1);
      }
      lines.push(`${"  ".repeat(depth)}${part}`);
      if (!close && !selfClosing && !inline) {
        depth += 1;
      }
    }
  } else {
    const rawParts = text
      .replace(/\s+/g, " ")
      .replace(/([{};])/g, "\n$1\n")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    // K&R style: an opening brace joins the line it belongs to, and a
    // lone semicolon rejoins the statement it terminates.
    const parts: Array<string> = [];
    for (const part of rawParts) {
      if ((part === "{" || part === ";") && parts.length > 0) {
        parts[parts.length - 1] += part === "{" ? " {" : ";";
      } else {
        parts.push(part);
      }
    }
    let depth = 0;
    for (const part of parts) {
      if (part.startsWith("}")) {
        depth = Math.max(0, depth - 1);
      }
      lines.push(`${"  ".repeat(depth)}${part}`);
      const opens = (part.match(/{/g) ?? []).length;
      const closes = (part.match(/}/g) ?? []).length;
      depth = Math.max(0, depth + opens - closes);
    }
  }
  return restoreCodeStrings(lines.join("\n"), strings);
}

const KEYWORD_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with",
  "is", "are", "was", "were", "be", "been", "being", "it", "its", "this", "that",
  "these", "those", "as", "by", "from", "you", "your", "yours", "we", "our", "ours",
  "they", "their", "theirs", "he", "she", "him", "her", "hers", "his", "i", "me",
  "my", "mine", "us", "not", "no", "so", "if", "then", "than", "too", "very",
  "can", "will", "just", "about", "into", "over", "after", "before", "between",
  "through", "during", "each", "other", "such", "only", "own", "same", "which",
  "who", "whom", "what", "when", "where", "how", "why", "all", "any", "both",
  "few", "more", "most", "some", "do", "does", "did", "have", "has", "had",
  "having", "would", "could", "should", "may", "might", "must", "shall",
]);

function keywordPhraseLength(raw: string): number {
  if (raw.trim() === "") {
    return 3;
  }
  const n = Math.floor(Number(raw));
  if (Number.isNaN(n) || n < 1 || n > 3) {
    throw new RangeError("Phrase length must be 1, 2 or 3.");
  }
  return n;
}

function keywordFrequencies(
  text: string,
  maxWords: number,
): { words: Array<string>; phrases: Map<string, number> } {
  const words = (text.toLowerCase().match(/\p{L}[\p{L}\p{N}'-]*/gu) ?? []).map((w) =>
    w.replace(/^['-]+|['-]+$/g, ""),
  ).filter((w) => w !== "");
  const phrases = new Map<string, number>();
  for (let n = 1; n <= maxWords; n += 1) {
    for (let i = 0; i + n <= words.length; i += 1) {
      const slice = words.slice(i, i + n);
      if (slice.every((w) => KEYWORD_STOPWORDS.has(w))) {
        continue;
      }
      const phrase = slice.join(" ");
      phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
    }
  }
  return { words, phrases };
}

const ROBOTS_PRESETS: Record<string, { disallow: Array<string>; allow: Array<string> }> = {
  wordpress: { disallow: ["/wp-admin/"], allow: ["/wp-admin/admin-ajax.php"] },
  blogger: { disallow: ["/search"], allow: [] },
  shopify: {
    disallow: ["/admin", "/cart", "/orders", "/checkout", "/checkouts", "/carts", "/account", "/search"],
    allow: [],
  },
  custom: { disallow: [], allow: [] },
};

function cleanRobotsPaths(raw: string): Array<string> {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"))
    .map((l) => (l.startsWith("/") ? l : `/${l}`));
}

const ADSENSE_USD_TO_INR = 83;

// Bundled standard rates (offline-safe by design: a live rate lookup would
// break the offline story, and sales-tax rates change rarely enough that a
// custom-rate box covers everything else).
const TAX_REGIONS: Record<string, { label: string; rates: Array<number>; standard: number; splitCGST: boolean }> = {
  india: { label: "India (GST)", rates: [0, 5, 12, 18, 28], standard: 18, splitCGST: true },
  uk: { label: "United Kingdom (VAT)", rates: [0, 5, 20], standard: 20, splitCGST: false },
  germany: { label: "Germany (VAT)", rates: [0, 7, 19], standard: 19, splitCGST: false },
  france: { label: "France (VAT)", rates: [0, 5.5, 10, 20], standard: 20, splitCGST: false },
  uae: { label: "UAE (VAT)", rates: [0, 5], standard: 5, splitCGST: false },
  singapore: { label: "Singapore (GST)", rates: [0, 9], standard: 9, splitCGST: false },
  australia: { label: "Australia (GST)", rates: [0, 10], standard: 10, splitCGST: false },
  canada: { label: "Canada, Ontario (HST)", rates: [0, 5, 13], standard: 13, splitCGST: false },
  usa: { label: "USA, California (sales tax)", rates: [0, 6, 7.25, 8.875], standard: 7.25, splitCGST: false },
  japan: { label: "Japan (consumption tax)", rates: [0, 8, 10], standard: 10, splitCGST: false },
};

const TAX_REGION_OPTIONS: ReadonlyArray<{ value: string; labelKey: string }> = Object.entries(TAX_REGIONS).map(
  ([value, region]) => ({ value, labelKey: `${region.label} — standard ${region.standard}%` }),
);

function parseTaxRate(raw: string): number | null {
  if (raw.trim() === "") {
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new RangeError("Tax rate must be a number between 0 and 100.");
  }
  return n;
}

function resolveTaxRate(
  regionRaw: string,
  rateRaw: string,
  customRaw: string,
): { rate: number; regionLabel: string; note: string } {
  const regionKey = (regionRaw.trim() === "" ? "india" : regionRaw.trim()).toLowerCase();
  const region = TAX_REGIONS[regionKey];
  if (region === undefined) {
    throw new RangeError(`Unknown region "${regionRaw}". Use: ${Object.keys(TAX_REGIONS).join(", ")}.`);
  }
  const custom = parseTaxRate(customRaw);
  if (custom !== null) {
    return { rate: custom, regionLabel: region.label, note: `Custom ${custom}% applied for ${region.label}.` };
  }
  const preset = parseTaxRate(rateRaw);
  if (preset !== null) {
    return { rate: preset, regionLabel: region.label, note: `${preset}% applied for ${region.label}.` };
  }
  return { rate: region.standard, regionLabel: region.label, note: `Standard ${region.standard}% for ${region.label}.` };
}

function buildRobotsTxt(presetRaw: string, sitemapRaw: string, disallowRaw: string, allowRaw: string): string {
  const presetKey = (presetRaw.trim() === "" ? "wordpress" : presetRaw.trim()).toLowerCase();
  const preset = ROBOTS_PRESETS[presetKey];
  if (preset === undefined) {
    throw new RangeError(`Unknown preset "${presetRaw}". Use wordpress, blogger, shopify or custom.`);
  }
  const lines = ["User-agent: *"];
  for (const path of [...preset.disallow, ...cleanRobotsPaths(disallowRaw)]) {
    lines.push(`Disallow: ${path}`);
  }
  for (const path of [...preset.allow, ...cleanRobotsPaths(allowRaw)]) {
    lines.push(`Allow: ${path}`);
  }
  const sitemap = sitemapRaw.trim();
  if (sitemap !== "") {
    lines.push("", `Sitemap: ${sitemap}`);
  }
  return `${lines.join("\n")}\n`;
}

function extractYouTubeVideoId(raw: string): string {
  const input = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) {
    return input;
  }
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    const id = match?.[match.length - 1];
    if (id !== undefined) {
      return id;
    }
  }
  throw new RangeError("Could not find a video ID. Paste a watch, share, Shorts or embed URL — or the 11-character ID itself.");
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textToPdfauti(input: string): string {
  const lines = input.split("\n").slice(0, 200);
  const content = lines
    .map((line, i) => `BT /F1 12 Tf 50 ${760 - i * 16} Td (${escapePdf(line.slice(0, 120))}) Tj ET`)
    .join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: Array<number> = [];
  for (const o of objects) {
    offsets.push(pdf.length);
    pdf += `${o}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new RangeError("Enter a valid HEX color like #4f46e5 or #fff.");
  }
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance(r: number, g: number, b: number): number {
  const f = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

interface Spec {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: ReadonlyArray<string>;
  popular: boolean;
  featured: boolean;
  requiresNetwork?: boolean;
  // Browser-only tools (canvas/file APIs) ship a custom UI per app instead of
  // the generic runner. They still register for SEO, search and sitemap, but
  // their engine validate/execute cannot run in Node and are exempt from the
  // sample-execution test. Pure helpers must be unit-tested separately.
  browserOnly?: boolean;
  inputs: ReadonlyArray<ToolInputField>;
  outputs: ReadonlyArray<ToolOutputField>;
  validate: (input: Record<string, unknown>) => ValidationResult;
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

const SPECS: ReadonlyArray<Spec> = [
  {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Find X% of a number, what percent one number is of another, and percentage change.",
    category: "calculator",
    icon: "percent",
    keywords: ["percentage", "percent", "discount", "change"],
    popular: true,
    featured: true,
    inputs: [str("value", "Value (X)"), str("total", "Total (Y)"), str("oldValue", "Old value (for change, optional)", false)],
    outputs: [numOut("percentOf", "X% of Y"), numOut("asPercent", "X as % of Y"), out("change", "Change old → new")],
    validate: (input) => {
      if (Number.isNaN(reqNum(input, "value")) || Number.isNaN(reqNum(input, "total"))) {
        return err("value", "Enter two numbers to compare.");
      }
      return ok();
    },
    execute: async (input) => {
      const value = reqNum(input, "value");
      const total = reqNum(input, "total");
      const rawOld = req(input, "oldValue");
      const percentOf = (value / 100) * total;
      const asPercent = total === 0 ? 0 : (value / total) * 100;
      let change = "—";
      if (rawOld !== "" && !Number.isNaN(Number(rawOld)) && Number(rawOld) !== 0) {
        change = `${(((value - Number(rawOld)) / Math.abs(Number(rawOld))) * 100).toFixed(2)}%`;
      }
      return {
        percentOf: Math.round(percentOf * 100) / 100,
        asPercent: Math.round(asPercent * 100) / 100,
        change,
      };
    },
  },
  {
    id: "compound-interest-calculator",
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    description: "Project savings growth with compounding interest over time.",
    category: "finance",
    icon: "trending-up",
    keywords: ["compound interest", "savings", "investment", "growth"],
    popular: true,
    featured: true,
    inputs: [str("principal", "Principal ($)"), str("rate", "Annual rate (%)"), str("years", "Years"), str("compoundsPerYear", "Compounds per year (default 12)", false)],
    outputs: [numOut("futureValue", "Future value"), numOut("interestEarned", "Interest earned")],
    validate: (input) => {
      const p = reqNum(input, "principal");
      const r = reqNum(input, "rate");
      const y = reqNum(input, "years");
      if (![p, r, y].every((n) => Number.isFinite(n)) || p < 0 || y < 0) {
        return err("principal", "Enter a valid principal, rate and years.");
      }
      return ok();
    },
    execute: async (input) => {
      const p = reqNum(input, "principal");
      const r = reqNum(input, "rate") / 100;
      const y = reqNum(input, "years");
      const rawN = req(input, "compoundsPerYear");
      const n = rawN === "" ? 12 : Math.max(1, Math.floor(Number(rawN)));
      const fv = p * (1 + r / n) ** (n * y);
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      return { futureValue: round2(fv), interestEarned: round2(fv - p) };
    },
  },
  {
    id: "emi-calculator",
    slug: "emi-calculator",
    name: "EMI Calculator",
    description: "Estimate equated monthly instalments for loans and mortgages.",
    category: "finance",
    icon: "landmark",
    keywords: ["emi", "loan", "mortgage", "monthly payment"],
    popular: true,
    featured: false,
    inputs: [str("principal", "Loan amount"), str("rate", "Annual rate (%)"), str("years", "Term (years)")],
    outputs: [numOut("emi", "Monthly EMI"), numOut("totalPayable", "Total payable"), numOut("totalInterest", "Total interest")],
    validate: (input) => {
      const p = reqNum(input, "principal");
      const r = reqNum(input, "rate");
      const y = reqNum(input, "years");
      if (![p, r, y].every((n) => Number.isFinite(n)) || p <= 0 || y <= 0 || r < 0) {
        return err("principal", "Enter a valid loan amount, rate and term.");
      }
      return ok();
    },
    execute: async (input) => {
      const p = reqNum(input, "principal");
      const monthly = reqNum(input, "rate") / 1200;
      const n = Math.round(reqNum(input, "years") * 12);
      const emi = monthly === 0 ? p / n : (p * monthly * (1 + monthly) ** n) / ((1 + monthly) ** n - 1);
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      return { emi: round2(emi), totalPayable: round2(emi * n), totalInterest: round2(emi * n - p) };
    },
  },
  {
    id: "roi-calculator",
    slug: "roi-calculator",
    name: "ROI Calculator",
    description: "Measure return on investment from gain and cost.",
    category: "finance",
    icon: "pie-chart",
    keywords: ["roi", "return", "investment", "profit"],
    popular: false,
    featured: false,
    inputs: [str("gain", "Total gain / revenue"), str("cost", "Total cost")],
    outputs: [numOut("roiPercent", "ROI (%)"), numOut("profit", "Net profit")],
    validate: (input) => {
      if (Number.isNaN(reqNum(input, "gain")) || Number.isNaN(reqNum(input, "cost"))) {
        return err("gain", "Enter gain and cost as numbers.");
      }
      if (reqNum(input, "cost") === 0) {
        return err("cost", "Cost must not be zero.");
      }
      return ok();
    },
    execute: async (input) => {
      const gain = reqNum(input, "gain");
      const cost = reqNum(input, "cost");
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      return { roiPercent: round2(((gain - cost) / Math.abs(cost)) * 100), profit: round2(gain - cost) };
    },
  },
  {
    id: "discount-calculator",
    slug: "discount-calculator",
    name: "Discount Calculator",
    description: "Compute sale prices and savings from a discount percent.",
    category: "finance",
    icon: "tag",
    keywords: ["discount", "sale", "savings", "price"],
    popular: true,
    featured: false,
    inputs: [str("price", "Original price"), str("discount", "Discount (%)")],
    outputs: [numOut("finalPrice", "Final price"), numOut("savings", "You save")],
    validate: (input) => {
      if (Number.isNaN(reqNum(input, "price")) || Number.isNaN(reqNum(input, "discount"))) {
        return err("price", "Enter price and discount as numbers.");
      }
      return ok();
    },
    execute: async (input) => {
      const price = reqNum(input, "price");
      const d = reqNum(input, "discount");
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      return { finalPrice: round2(price * (1 - d / 100)), savings: round2((price * d) / 100) };
    },
  },
  {
    id: "vat-calculator",
    slug: "vat-calculator",
    name: "VAT / GST Calculator",
    description: "Add or remove VAT/GST from a price.",
    category: "finance",
    icon: "receipt",
    keywords: ["vat", "gst", "tax", "inclusive", "exclusive"],
    popular: false,
    featured: false,
    inputs: [str("amount", "Amount"), str("rate", "Tax rate (%)"), str("mode", "Mode: add (default) or remove", false)],
    outputs: [numOut("net", "Net amount"), numOut("tax", "Tax amount"), numOut("gross", "Gross amount")],
    validate: (input) => {
      if (Number.isNaN(reqNum(input, "amount")) || Number.isNaN(reqNum(input, "rate"))) {
        return err("amount", "Enter amount and tax rate as numbers.");
      }
      return ok();
    },
    execute: async (input) => {
      const amount = reqNum(input, "amount");
      const rate = reqNum(input, "rate") / 100;
      const mode = req(input, "mode").toLowerCase();
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      if (mode === "remove") {
        const net = amount / (1 + rate);
        return { net: round2(net), tax: round2(amount - net), gross: round2(amount) };
      }
      return { net: round2(amount), tax: round2(amount * rate), gross: round2(amount * (1 + rate)) };
    },
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, weight and temperature between metric and imperial units.",
    category: "converter",
    icon: "ruler",
    keywords: ["unit converter", "length", "weight", "temperature", "metric", "imperial"],
    popular: true,
    featured: true,
    inputs: [str("value", "Value"), str("from", "From unit (km, mi, m, ft, kg, lb, g, oz, C, F)"), str("to", "To unit")],
    outputs: [out("result", "Converted value"), out("formula", "Conversion")],
    validate: (input) => {
      if (req(input, "value") === "" || Number.isNaN(Number(req(input, "value")))) {
        return err("value", "Enter a numeric value.");
      }
      if (req(input, "from") === "" || req(input, "to") === "") {
        return err("from", "Enter both from and to units.");
      }
      return ok();
    },
    execute: async (input) => {
      const value = Number(req(input, "value"));
      const from = req(input, "from").toLowerCase();
      const to = req(input, "to").toLowerCase();
      const toMeters: Record<string, number> = { km: 1000, mi: 1609.344, m: 1, ft: 0.3048, cm: 0.01 };
      const toKg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.0283495231 };
      let result: number;
      if (from === to) {
        result = value;
      } else if (from in toMeters && to in toMeters) {
        result = (value * (toMeters[from] as number)) / (toMeters[to] as number);
      } else if (from in toKg && to in toKg) {
        result = (value * (toKg[from] as number)) / (toKg[to] as number);
      } else if ((from === "c" || from === "°c") && (to === "f" || to === "°f")) {
        result = (value * 9) / 5 + 32;
      } else if ((from === "f" || from === "°f") && (to === "c" || to === "°c")) {
        result = ((value - 32) * 5) / 9;
      } else {
        throw new RangeError(`Cannot convert ${from} to ${to}. Supported: km, mi, m, ft, cm, kg, g, lb, oz, C, F.`);
      }
      return { result: String(Math.round(result * 10000) / 10000), formula: `${value} ${from} = ${Math.round(result * 10000) / 10000} ${to}` };
    },
  },
  {
    id: "date-difference-calculator",
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    description: "Count days, weeks and months between two dates.",
    category: "calculator",
    icon: "calendar-days",
    keywords: ["date difference", "days between", "duration"],
    popular: false,
    featured: false,
    inputs: [str("from", "From date (YYYY-MM-DD)"), str("to", "To date (YYYY-MM-DD)")],
    outputs: [numOut("days", "Days"), numOut("weeks", "Weeks"), out("monthsApprox", "Approx. months")],
    validate: (input) => {
      if (Number.isNaN(Date.parse(req(input, "from"))) || Number.isNaN(Date.parse(req(input, "to")))) {
        return err("from", "Enter two valid dates as YYYY-MM-DD.");
      }
      return ok();
    },
    execute: async (input) => {
      const days = Math.round(
        (Date.parse(req(input, "to")) - Date.parse(req(input, "from"))) / 86400000,
      );
      return {
        days: Math.abs(days),
        weeks: Math.floor(Math.abs(days) / 7),
        monthsApprox: String(Math.round((Math.abs(days) / 30.44) * 10) / 10),
      };
    },
  },
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Pretty-print and validate JSON with clear error messages.",
    category: "developer",
    icon: "braces",
    keywords: ["json formatter", "pretty print", "json beautifier", "format json"],
    popular: true,
    featured: true,
    inputs: [area("json", "JSON input"), str("indent", "Indent spaces (default 2)", false)],
    outputs: [out("formatted", "Formatted JSON"), out("valid", "Valid")],
    validate: (input) => {
      if (req(input, "json") === "") {
        return err("json", "Paste JSON to format.");
      }
      return ok();
    },
    execute: async (input) => {
      const rawN = req(input, "indent");
      const indent = rawN === "" ? 2 : Math.min(8, Math.max(0, Math.floor(Number(rawN))));
      if (Number.isNaN(indent)) {
        throw new RangeError("Indent must be a number between 0 and 8.");
      }
      try {
        const parsed: unknown = JSON.parse(req(input, "json"));
        return { formatted: JSON.stringify(parsed, null, indent), valid: "true" };
      } catch (e) {
        throw new RangeError(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
      }
    },
  },
  {
    id: "json-minifier",
    slug: "json-minifier",
    name: "JSON Minifier",
    description: "Compress JSON by removing whitespace for smaller payloads.",
    category: "developer",
    icon: "minimize-2",
    keywords: ["json minify", "compress json", "minifier"],
    popular: false,
    featured: false,
    inputs: [area("json", "JSON input")],
    outputs: [out("minified", "Minified JSON"), numOut("savedBytes", "Bytes saved")],
    validate: (input) => (req(input, "json") === "" ? err("json", "Paste JSON to minify.") : ok()),
    execute: async (input) => {
      const raw = req(input, "json");
      try {
        const minified = JSON.stringify(JSON.parse(raw));
        return { minified, savedBytes: raw.length - minified.length };
      } catch (e) {
        throw new RangeError(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
      }
    },
  },
  {
    id: "json-validator",
    slug: "json-validator",
    name: "JSON Validator",
    description: "Check whether text is valid JSON and see the parsed type.",
    category: "developer",
    icon: "check-circle",
    keywords: ["json validator", "validate json", "is json valid"],
    popular: false,
    featured: false,
    inputs: [area("json", "JSON input")],
    outputs: [out("valid", "Valid"), out("type", "Root type"), out("detail", "Detail")],
    validate: (input) => (req(input, "json") === "" ? err("json", "Paste JSON to validate.") : ok()),
    execute: async (input) => {
      try {
        const parsed: unknown = JSON.parse(req(input, "json"));
        const type = Array.isArray(parsed) ? "array" : typeof parsed;
        return { valid: "true", type, detail: "Valid JSON." };
      } catch (e) {
        return { valid: "false", type: "—", detail: e instanceof Error ? e.message : "Invalid JSON." };
      }
    },
  },
  {
    id: "json-to-yaml",
    slug: "json-to-yaml",
    name: "JSON to YAML",
    description: "Convert a JSON object into simple YAML.",
    category: "developer",
    icon: "arrow-right",
    keywords: ["json to yaml", "convert json", "yaml"],
    popular: false,
    featured: false,
    inputs: [area("json", "JSON object input")],
    outputs: [out("yaml", "YAML output")],
    validate: (input) => (req(input, "json") === "" ? err("json", "Paste a JSON object.") : ok()),
    execute: async (input) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(req(input, "json"));
      } catch (e) {
        throw new RangeError(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new RangeError("Enter a JSON object (not an array or primitive).");
      }
      const lines = Object.entries(parsed as Record<string, unknown>).map(([k, v]) => {
        if (v !== null && typeof v === "object") {
          return `${k}:\n  value: ${JSON.stringify(v)}`;
        }
        if (typeof v === "string") {
          return `${k}: "${v.replace(/"/g, '\\"')}"`;
        }
        return `${k}: ${String(v)}`;
      });
      return { yaml: `${lines.join("\n")}\n` };
    },
  },
  {
    id: "yaml-to-json",
    slug: "yaml-to-json",
    name: "YAML to JSON",
    description: "Convert simple flat YAML (key: value lines) into JSON.",
    category: "developer",
    icon: "arrow-left",
    keywords: ["yaml to json", "convert yaml"],
    popular: false,
    featured: false,
    inputs: [area("yaml", "YAML input (key: value per line)")],
    outputs: [out("json", "JSON output")],
    validate: (input) => (req(input, "yaml") === "" ? err("yaml", "Paste YAML to convert.") : ok()),
    execute: async (input) => {
      const result: Record<string, unknown> = {};
      for (const line of req(input, "yaml").split("\n")) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#")) {
          continue;
        }
        const idx = trimmed.indexOf(":");
        if (idx === -1) {
          throw new RangeError(`Invalid YAML line (expected key: value): ${trimmed}`);
        }
        const key = trimmed.slice(0, idx).trim();
        let value: unknown = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (value === "true") {
          value = true;
        } else if (value === "false") {
          value = false;
        } else if (value === "null" || value === "~") {
          value = null;
        } else if (value !== "" && !Number.isNaN(Number(value))) {
          value = Number(value);
        }
        result[key] = value;
      }
      return { json: JSON.stringify(result, null, 2) };
    },
  },
  {
    id: "json-to-typescript",
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    description: "Generate a TypeScript interface from a sample JSON object.",
    category: "developer",
    icon: "file-code",
    keywords: ["json to typescript", "interface generator", "types"],
    popular: false,
    featured: false,
    inputs: [area("json", "Sample JSON object"), str("name", "Interface name (default Root)", false)],
    outputs: [out("typescript", "TypeScript interface")],
    validate: (input) => (req(input, "json") === "" ? err("json", "Paste a JSON object.") : ok()),
    execute: async (input) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(req(input, "json"));
      } catch (e) {
        throw new RangeError(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
      }
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new RangeError("Enter a JSON object.");
      }
      const rawName = req(input, "name") || "Root";
      const name = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(rawName) ? rawName : "Root";
      const tsType = (v: unknown): string => {
        if (v === null) {
          return "null";
        }
        if (Array.isArray(v)) {
          return v.length > 0 ? `${tsType(v[0])}[]` : "unknown[]";
        }
        switch (typeof v) {
          case "string":
            return "string";
          case "number":
            return "number";
          case "boolean":
            return "boolean";
          default:
            return "unknown";
        }
      };
      const fields = Object.entries(parsed as Record<string, unknown>)
        .map(([k, v]) => `  ${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: ${tsType(v)};`)
        .join("\n");
      return { typescript: `interface ${name} {\n${fields}\n}` };
    },
  },
  {
    id: "csv-to-json",
    slug: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert CSV with a header row into a JSON array.",
    category: "developer",
    icon: "table",
    keywords: ["csv to json", "convert csv"],
    popular: false,
    featured: false,
    inputs: [area("csv", "CSV input (first row = headers)")],
    outputs: [out("json", "JSON array")],
    validate: (input) => (req(input, "csv") === "" ? err("csv", "Paste CSV to convert.") : ok()),
    execute: async (input) => {
      const rows = req(input, "csv")
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r !== "");
      if (rows.length < 2) {
        throw new RangeError("CSV needs a header row plus at least one data row.");
      }
      const headers = (rows[0] as string).split(",").map((h) => h.trim());
      const data = rows.slice(1).map((row) => {
        const cells = (row as string).split(",");
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = (cells[i] ?? "").trim();
        });
        return obj;
      });
      return { json: JSON.stringify(data, null, 2) };
    },
  },
  {
    id: "json-to-csv",
    slug: "json-to-csv",
    name: "JSON to CSV",
    description: "Convert a JSON array of flat objects into CSV.",
    category: "developer",
    icon: "table-2",
    keywords: ["json to csv", "export csv"],
    popular: false,
    featured: false,
    inputs: [area("json", "JSON array input")],
    outputs: [out("csv", "CSV output")],
    validate: (input) => (req(input, "json") === "" ? err("json", "Paste a JSON array.") : ok()),
    execute: async (input) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(req(input, "json"));
      } catch (e) {
        throw new RangeError(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new RangeError("Enter a non-empty JSON array of objects.");
      }
      const headers = Object.keys((parsed as Array<Record<string, unknown>>)[0] as Record<string, unknown>);
      const lines = [
        headers.join(","),
        ...(parsed as Array<Record<string, unknown>>).map((row) =>
          headers.map((h) => String(row[h] ?? "")).join(","),
        ),
      ];
      return { csv: lines.join("\n") };
    },
  },
  {
    id: "base64-encoder",
    slug: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode any text into Base64. Runs entirely in your browser.",
    category: "developer",
    icon: "lock",
    keywords: ["base64 encode", "encode base64", "base64"],
    popular: true,
    featured: false,
    inputs: [area("text", "Text to encode")],
    outputs: [out("base64", "Base64 output"), numOut("length", "Output length")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter text to encode.") : ok()),
    execute: async (input) => {
      const encoded = b64encode(req(input, "text"));
      return { base64: encoded, length: encoded.length };
    },
  },
  {
    id: "base64-decoder",
    slug: "base64-decoder",
    name: "Base64 Decoder",
    description: "Decode Base64 back into readable text, locally.",
    category: "developer",
    icon: "lock-open",
    keywords: ["base64 decode", "decode base64"],
    popular: true,
    featured: false,
    inputs: [area("base64", "Base64 input")],
    outputs: [out("text", "Decoded text")],
    validate: (input) => (req(input, "base64") === "" ? err("base64", "Paste Base64 to decode.") : ok()),
    execute: async (input) => {
      try {
        return { text: b64decode(req(input, "base64")) };
      } catch {
        throw new RangeError("Invalid Base64 input. Check for typos or missing padding.");
      }
    },
  },
  {
    id: "url-encoder",
    slug: "url-encoder",
    name: "URL Encoder",
    description: "Percent-encode text for safe use in URLs and query strings.",
    category: "developer",
    icon: "link",
    keywords: ["url encode", "percent encode", "encodeuri"],
    popular: false,
    featured: false,
    inputs: [area("text", "Text to encode")],
    outputs: [out("encoded", "Encoded output")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter text to encode.") : ok()),
    execute: async (input) => ({ encoded: encodeURIComponent(req(input, "text")) }),
  },
  {
    id: "url-decoder",
    slug: "url-decoder",
    name: "URL Decoder",
    description: "Decode percent-encoded URLs back into readable text.",
    category: "developer",
    icon: "link-2",
    keywords: ["url decode", "decode uri"],
    popular: false,
    featured: false,
    inputs: [area("text", "Encoded URL input")],
    outputs: [out("decoded", "Decoded output")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Paste an encoded URL.") : ok()),
    execute: async (input) => {
      try {
        return { decoded: decodeURIComponent(req(input, "text")) };
      } catch {
        throw new RangeError("Invalid percent-encoding in input.");
      }
    },
  },
  {
    id: "jwt-decoder",
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode a JWT header and payload locally. Signatures are never verified or sent anywhere.",
    category: "developer",
    icon: "key",
    keywords: ["jwt", "jwt decoder", "token", "decode jwt"],
    popular: true,
    featured: true,
    inputs: [area("token", "JWT (header.payload.signature)")],
    outputs: [out("header", "Header JSON"), out("payload", "Payload JSON"), out("warning", "Note")],
    validate: (input) => {
      if (req(input, "token").split(".").length !== 3) {
        return err("token", "Enter a JWT with three dot-separated parts.");
      }
      return ok();
    },
    execute: async (input) => {
      const [h, p] = req(input, "token").split(".");
      try {
        const header = JSON.stringify(JSON.parse(b64urlDecode(h as string)), null, 2);
        const payload = JSON.stringify(JSON.parse(b64urlDecode(p as string)), null, 2);
        return {
          header,
          payload,
          warning: "Decoded locally. Signature NOT verified — never paste secrets into untrusted sites.",
        };
      } catch {
        throw new RangeError("Could not decode JWT. Check the token format.");
      }
    },
  },
  {
    id: "regex-tester",
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test a JavaScript regular expression against sample text.",
    category: "developer",
    icon: "search-check",
    keywords: ["regex", "regexp", "test regex", "pattern"],
    popular: false,
    featured: false,
    inputs: [str("pattern", "Pattern (without slashes)"), str("flags", "Flags, e.g. gi (optional)", false), area("text", "Test text")],
    outputs: [out("matched", "Matched?"), out("matches", "Matches (up to 20)"), numOut("count", "Match count")],
    validate: (input) => {
      if (req(input, "pattern") === "") {
        return err("pattern", "Enter a regex pattern.");
      }
      try {
        new RegExp(req(input, "pattern"), req(input, "flags") || undefined);
      } catch (e) {
        return err("pattern", e instanceof Error ? e.message : "Invalid regex.");
      }
      return ok();
    },
    execute: async (input) => {
      const re = new RegExp(req(input, "pattern"), req(input, "flags") === "" ? "g" : req(input, "flags").includes("g") ? req(input, "flags") : `${req(input, "flags")}g`);
      const text = req(input, "text");
      const matches = [...text.matchAll(re)].slice(0, 20).map((m) => m[0]);
      return { matched: matches.length > 0 ? "true" : "false", matches: matches.join("\n") || "—", count: matches.length };
    },
  },
  {
    id: "diff-checker",
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts line by line and see what changed.",
    category: "developer",
    icon: "git-compare",
    keywords: ["diff", "compare text", "difference checker"],
    popular: false,
    featured: false,
    inputs: [area("original", "Original text"), area("modified", "Modified text")],
    outputs: [out("summary", "Summary"), out("diff", "Line diff (- removed, + added)")],
    validate: (input) => {
      if (req(input, "original") === "" && req(input, "modified") === "") {
        return err("original", "Enter text in at least one box.");
      }
      return ok();
    },
    execute: async (input) => {
      const a = req(input, "original").split("\n");
      const b = req(input, "modified").split("\n");
      const setB = new Set(b);
      const setA = new Set(a);
      const removed = a.filter((l) => !setB.has(l)).length;
      const added = b.filter((l) => !setA.has(l)).length;
      const diff: Array<string> = [];
      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i += 1) {
        if (a[i] !== b[i]) {
          if (a[i] !== undefined) {
            diff.push(`- ${a[i]}`);
          }
          if (b[i] !== undefined) {
            diff.push(`+ ${b[i]}`);
          }
        }
      }
      return {
        summary: `${added} line(s) added, ${removed} line(s) removed.`,
        diff: diff.slice(0, 200).join("\n") || "No differences.",
      };
    },
  },
  {
    id: "uuid-generator",
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate version-4 UUIDs locally using cryptographically secure randomness.",
    category: "developer",
    icon: "fingerprint",
    keywords: ["uuid", "guid", "uuid generator", "unique id"],
    popular: true,
    featured: false,
    inputs: [str("count", "How many (1-50, default 1)", false)],
    outputs: [out("uuids", "UUIDs (one per line)")],
    validate: () => ok(),
    execute: async (input) => {
      const raw = req(input, "count");
      const count = raw === "" ? 1 : Math.min(50, Math.max(1, Math.floor(Number(raw))));
      if (Number.isNaN(count)) {
        throw new RangeError("Count must be a number between 1 and 50.");
      }
      const makeOne = (): string => {
        if (typeof globalThis.crypto?.randomUUID === "function") {
          return globalThis.crypto.randomUUID();
        }
        const bytes = new Uint8Array(16);
        globalThis.crypto?.getRandomValues?.(bytes);
        bytes[6] = ((bytes[6] as number) & 0x0f) | 0x40;
        bytes[8] = ((bytes[8] as number) & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b) => (b as number).toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      };
      return { uuids: Array.from({ length: count }, makeOne).join("\n") };
    },
  },
  {
    id: "timestamp-converter",
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates.",
    category: "developer",
    icon: "clock",
    keywords: ["timestamp", "unix time", "epoch", "date converter"],
    popular: false,
    featured: false,
    inputs: [str("value", "Unix timestamp (s or ms) or date string. Leave empty for now.", false)],
    outputs: [out("iso", "ISO 8601"), numOut("unixSeconds", "Unix (seconds)"), numOut("unixMs", "Unix (ms)"), out("utc", "UTC string")],
    validate: () => ok(),
    execute: async (input) => {
      const raw = req(input, "value");
      let date: Date;
      if (raw === "") {
        date = new Date();
      } else if (/^-?\d+$/.test(raw)) {
        const n = Number(raw);
        date = new Date(raw.length > 10 ? n : n * 1000);
      } else {
        const parsed = Date.parse(raw);
        if (Number.isNaN(parsed)) {
          throw new RangeError("Enter a Unix timestamp or a parseable date.");
        }
        date = new Date(parsed);
      }
      if (Number.isNaN(date.getTime())) {
        throw new RangeError("Could not parse that date.");
      }
      return {
        iso: date.toISOString(),
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        utc: date.toUTCString(),
      };
    },
  },
  {
    id: "word-counter",
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences and paragraphs in any text.",
    category: "document",
    icon: "type",
    keywords: ["word counter", "count words", "character count"],
    popular: true,
    featured: true,
    inputs: [area("text", "Text to analyse")],
    outputs: [numOut("words", "Words"), numOut("characters", "Characters"), numOut("noSpaces", "Characters (no spaces)"), numOut("sentences", "Sentences"), numOut("paragraphs", "Paragraphs")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some text.") : ok()),
    execute: async (input) => {
      const text = req(input, "text");
      const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      return {
        words,
        characters: text.length,
        noSpaces: text.replace(/\s/g, "").length,
        sentences: (text.match(/[.!?]+/g) ?? []).length,
        paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim() !== "").length || 1,
      };
    },
  },
  {
    id: "character-counter",
    slug: "character-counter",
    name: "Character Counter",
    description: "Count characters with and without spaces, plus lines.",
    category: "document",
    icon: "text",
    keywords: ["character counter", "count characters", "letter count"],
    popular: false,
    featured: false,
    inputs: [area("text", "Text to analyse")],
    outputs: [numOut("characters", "Characters"), numOut("noSpaces", "Without spaces"), numOut("lines", "Lines")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some text.") : ok()),
    execute: async (input) => {
      const text = req(input, "text");
      return {
        characters: text.length,
        noSpaces: text.replace(/\s/g, "").length,
        lines: text.split("\n").length,
      };
    },
  },
  {
    id: "case-converter",
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text to upper, lower, title, sentence, camel, snake and kebab case.",
    category: "text",
    icon: "case-sensitive",
    keywords: ["case converter", "uppercase", "lowercase", "title case"],
    popular: true,
    featured: false,
    inputs: [area("text", "Text to convert")],
    outputs: [out("upper", "UPPERCASE"), out("lower", "lowercase"), out("title", "Title Case"), out("sentence", "Sentence case"), out("camel", "camelCase"), out("snake", "snake_case"), out("kebab", "kebab-case")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some text.") : ok()),
    execute: async (input) => {
      const text = req(input, "text");
      const words = text.toLowerCase().split(/[\s_-]+/).filter(Boolean);
      const cap = (w: string): string => (w === "" ? "" : w[0]!.toUpperCase() + w.slice(1));
      return {
        upper: text.toUpperCase(),
        lower: text.toLowerCase(),
        title: words.map(cap).join(" "),
        sentence: text === "" ? "" : text[0]!.toUpperCase() + text.slice(1).toLowerCase(),
        camel: words.map((w, i) => (i === 0 ? w : cap(w))).join(""),
        snake: words.join("_"),
        kebab: words.join("-"),
      };
    },
  },
  {
    id: "duplicate-line-remover",
    slug: "duplicate-line-remover",
    name: "Duplicate Line Remover",
    description: "Remove duplicate lines while preserving order.",
    category: "text",
    icon: "list-x",
    keywords: ["remove duplicates", "dedupe", "unique lines"],
    popular: false,
    featured: false,
    inputs: [area("text", "Lines (one per line)"), flag("caseSensitive", "Case sensitive", true)],
    outputs: [out("cleaned", "Deduplicated lines"), numOut("removed", "Duplicates removed")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some lines.") : ok()),
    execute: async (input) => {
      const sensitive = String(input["caseSensitive"] ?? "true") === "true";
      const seen = new Set<string>();
      const kept: Array<string> = [];
      for (const line of req(input, "text").split("\n")) {
        const key = sensitive ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          kept.push(line);
        }
      }
      return { cleaned: kept.join("\n"), removed: req(input, "text").split("\n").length - kept.length };
    },
  },
  {
    id: "empty-line-remover",
    slug: "empty-line-remover",
    name: "Empty Line Remover",
    description: "Strip blank lines from text, optionally trimming whitespace.",
    category: "text",
    icon: "align-justify",
    keywords: ["remove empty lines", "blank lines", "clean text"],
    popular: false,
    featured: false,
    inputs: [area("text", "Text input"), flag("trim", "Trim each line", true)],
    outputs: [out("cleaned", "Cleaned text"), numOut("removed", "Lines removed")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some text.") : ok()),
    execute: async (input) => {
      const trim = String(input["trim"] ?? "true") === "true";
      const lines = req(input, "text").split("\n");
      const kept = lines.map((l) => (trim ? l.trim() : l)).filter((l) => l !== "");
      return { cleaned: kept.join("\n"), removed: lines.length - kept.length };
    },
  },
  {
    id: "text-cleaner",
    slug: "text-cleaner",
    name: "Text Cleaner",
    description: "Normalize whitespace, strip extra spaces and tidy pasted text.",
    category: "text",
    icon: "sparkles",
    keywords: ["text cleaner", "normalize whitespace", "tidy text"],
    popular: false,
    featured: false,
    inputs: [area("text", "Messy text input")],
    outputs: [out("cleaned", "Cleaned text")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter some text.") : ok()),
    execute: async (input) => {
      const cleaned = req(input, "text")
        .replace(/[ \t]+/g, " ")
        .split("\n")
        .map((l) => l.trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      return { cleaned };
    },
  },
  {
    id: "slug-generator",
    slug: "slug-generator",
    name: "Slug Generator",
    description: "Turn titles into URL-friendly slugs for blogs and SEO.",
    category: "seo",
    icon: "link-2",
    keywords: ["slug generator", "url slug", "permalink", "seo slug"],
    popular: true,
    featured: false,
    inputs: [str("title", "Title / heading")],
    outputs: [out("slug", "Slug")],
    validate: (input) => (req(input, "title") === "" ? err("title", "Enter a title.") : ok()),
    execute: async (input) => {
      const slug = req(input, "title")
        .normalize("NFD")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 120);
      return { slug };
    },
  },
  {
    id: "lorem-ipsum-generator",
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs, sentences or words for mockups.",
    category: "text",
    icon: "pilcrow",
    keywords: ["lorem ipsum", "placeholder text", "dummy text"],
    popular: false,
    featured: false,
    inputs: [str("count", "How many (default 3)", false), str("unit", "Unit: paragraphs (default), sentences or words", false)],
    outputs: [out("text", "Generated text")],
    validate: () => ok(),
    execute: async (input) => {
      const bank = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
      const rawCount = req(input, "count");
      const count = Math.min(50, Math.max(1, rawCount === "" ? 3 : Math.floor(Number(rawCount)) || 3));
      const unit = (req(input, "unit") || "paragraphs").toLowerCase();
      const pick = (n: number): string => {
        const words: Array<string> = [];
        for (let i = 0; i < n; i += 1) {
          words.push(bank[(i * 7 + n) % bank.length] as string);
        }
        return words.join(" ");
      };
      if (unit.startsWith("word")) {
        return { text: pick(count) };
      }
      if (unit.startsWith("sentence")) {
        const sentences: Array<string> = [];
        for (let i = 0; i < count; i += 1) {
          const s = pick(12);
          sentences.push(`${s[0]!.toUpperCase()}${s.slice(1)}.`);
        }
        return { text: sentences.join(" ") };
      }
      const paras: Array<string> = [];
      for (let i = 0; i < count; i += 1) {
        const sentences: Array<string> = [];
        for (let s = 0; s < 4; s += 1) {
          const w = pick(12 + ((i + s) % 6));
          sentences.push(`${w[0]!.toUpperCase()}${w.slice(1)}.`);
        }
        paras.push(sentences.join(" "));
      }
      return { text: paras.join("\n\n") };
    },
  },
  {
    id: "reading-time-calculator",
    slug: "reading-time-calculator",
    name: "Reading Time Calculator",
    description: "Estimate reading time for articles at adjustable speeds.",
    category: "document",
    icon: "book-open",
    keywords: ["reading time", "read time", "words per minute"],
    popular: false,
    featured: false,
    inputs: [area("text", "Article text"), str("wpm", "Words per minute (default 200)", false)],
    outputs: [out("readingTime", "Reading time"), numOut("words", "Words")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Paste article text.") : ok()),
    execute: async (input) => {
      const words = req(input, "text").trim().split(/\s+/).filter(Boolean).length;
      const rawWpm = req(input, "wpm");
      const wpm = rawWpm === "" ? 200 : Math.max(50, Math.floor(Number(rawWpm)) || 200);
      const minutes = words / wpm;
      const label = minutes < 1 ? `${Math.max(1, Math.round(minutes * 60))} sec` : `${Math.round(minutes * 10) / 10} min`;
      return { readingTime: `${label} at ${wpm} wpm`, words };
    },
  },
  {
    id: "password-generator",
    slug: "password-generator",
    name: "Password Generator",
    description: "Create strong random passwords locally. Nothing is stored or sent anywhere.",
    category: "security",
    icon: "shield",
    keywords: ["password generator", "random password", "strong password"],
    popular: true,
    featured: true,
    inputs: [str("length", "Length (default 16)", false), flag("upper", "Include A-Z", true), flag("digits", "Include 0-9", true), flag("symbols", "Include symbols", true)],
    outputs: [out("password", "Generated password"), numOut("entropyBits", "Entropy (bits)")],
    validate: () => ok(),
    execute: async (input) => {
      const raw = req(input, "length");
      const length = Math.min(128, Math.max(4, raw === "" ? 16 : Math.floor(Number(raw)) || 16));
      let alphabet = "abcdefghijklmnopqrstuvwxyz";
      if (String(input["upper"] ?? "true") === "true") {
        alphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      }
      if (String(input["digits"] ?? "true") === "true") {
        alphabet += "0123456789";
      }
      if (String(input["symbols"] ?? "true") === "true") {
        alphabet += "!@#$%^&*()-_=+[]{};:,.?";
      }
      const password = randomChars(length, alphabet);
      return { password, entropyBits: Math.round(length * Math.log2(alphabet.length) * 10) / 10 };
    },
  },
  {
    id: "password-strength-checker",
    slug: "password-strength-checker",
    name: "Password Strength Checker",
    description: "Estimate password entropy and get practical hardening tips. Checked locally only.",
    category: "security",
    icon: "shield-check",
    keywords: ["password strength", "entropy", "strong password check"],
    popular: false,
    featured: false,
    inputs: [str("password", "Password to check")],
    outputs: [out("strength", "Strength"), numOut("entropyBits", "Entropy (bits)"), out("tips", "Tips")],
    validate: (input) => (req(input, "password") === "" ? err("password", "Enter a password.") : ok()),
    execute: async (input) => {
      const pw = String(input["password"] ?? "");
      let pool = 0;
      if (/[a-z]/.test(pw)) {
        pool += 26;
      }
      if (/[A-Z]/.test(pw)) {
        pool += 26;
      }
      if (/[0-9]/.test(pw)) {
        pool += 10;
      }
      if (/[^A-Za-z0-9]/.test(pw)) {
        pool += 32;
      }
      const entropy = pool === 0 ? 0 : Math.round(pw.length * Math.log2(pool) * 10) / 10;
      const strength = entropy < 40 ? "Weak" : entropy < 60 ? "Fair" : entropy < 80 ? "Strong" : "Very strong";
      const tips: Array<string> = [];
      if (pw.length < 12) {
        tips.push("Use at least 12 characters.");
      }
      if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw)) {
        tips.push("Mix upper and lower case.");
      }
      if (!/[0-9]/.test(pw)) {
        tips.push("Add numbers.");
      }
      if (!/[^A-Za-z0-9]/.test(pw)) {
        tips.push("Add symbols.");
      }
      return { strength, entropyBits: entropy, tips: tips.length > 0 ? tips.join(" ") : "Good — unique, long and random." };
    },
  },
  {
    id: "hash-generator",
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Compute SHA-256, SHA-512 and fast non-crypto checksums of any text, locally.",
    category: "security",
    icon: "hash",
    keywords: ["hash generator", "sha-256", "sha-512", "checksum"],
    popular: true,
    featured: false,
    inputs: [area("text", "Text to hash")],
    outputs: [out("sha256", "SHA-256"), out("sha512", "SHA-512"), out("checksums", "Fast checksums (FNV-1a, DJB2)")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter text to hash.") : ok()),
    execute: async (input) => {
      const text = req(input, "text");
      const sha256 = (await shaHex("SHA-256", text)) ?? "unavailable in this environment";
      const sha512 = (await shaHex("SHA-512", text)) ?? "unavailable in this environment";
      return { sha256, sha512, checksums: `${fnv1a(text)} ${djb2(text)}` };
    },
  },
  {
    id: "random-token-generator",
    slug: "random-token-generator",
    name: "Random Token Generator",
    description: "Generate secure hex tokens for API keys and secrets (local randomness only).",
    category: "security",
    icon: "key-round",
    keywords: ["random token", "api key", "secret generator", "hex token"],
    popular: false,
    featured: false,
    inputs: [str("bytes", "Bytes (default 32, max 256)", false)],
    outputs: [out("token", "Hex token")],
    validate: () => ok(),
    execute: async (input) => {
      const raw = req(input, "bytes");
      const n = Math.min(256, Math.max(1, raw === "" ? 32 : Math.floor(Number(raw)) || 32));
      const alphabet = "0123456789abcdef";
      return { token: randomChars(n * 2, alphabet) };
    },
  },
  {
    id: "hex-encoder",
    slug: "hex-encoder",
    name: "Hex Encoder / Decoder",
    description: "Convert text to hexadecimal and back.",
    category: "security",
    icon: "binary",
    keywords: ["hex encode", "hex decode", "hexadecimal"],
    popular: false,
    featured: false,
    inputs: [area("text", "Text or hex input"), str("mode", "Mode: encode (default) or decode", false)],
    outputs: [out("result", "Result")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter input.") : ok()),
    execute: async (input) => {
      const mode = (req(input, "mode") || "encode").toLowerCase();
      if (mode === "decode") {
        const hex = req(input, "text").replace(/\s+/g, "");
        if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) {
          throw new RangeError("Invalid hex: use pairs of 0-9/a-f characters.");
        }
        const bytes = hex.match(/../g) ?? [];
        return { result: new TextDecoder().decode(Uint8Array.from(bytes, (b) => Number.parseInt(b, 16))) };
      }
      const text = req(input, "text");
      return { result: Array.from(new TextEncoder().encode(text), (b) => b.toString(16).padStart(2, "0")).join("") };
    },
  },
  {
    id: "css-gradient-generator",
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    description: "Build linear-gradient CSS from two colors and an angle.",
    category: "design",
    icon: "palette",
    keywords: ["css gradient", "linear gradient", "background"],
    popular: false,
    featured: false,
    inputs: [str("from", "From color (default #4f46e5)", false), str("to", "To color (default #ec4899)", false), str("angle", "Angle in degrees (default 135)", false)],
    outputs: [out("css", "CSS"), out("preview", "Preview note")],
    validate: () => ok(),
    execute: async (input) => {
      const from = req(input, "from") || "#4f46e5";
      const to = req(input, "to") || "#ec4899";
      const rawAngle = req(input, "angle");
      const angle = rawAngle === "" ? 135 : Number(rawAngle);
      if (Number.isNaN(angle)) {
        throw new RangeError("Angle must be a number.");
      }
      return {
        css: `background: linear-gradient(${angle}deg, ${from}, ${to});`,
        preview: "Paste the CSS on any element to preview the gradient.",
      };
    },
  },
  {
    id: "css-box-shadow-generator",
    slug: "css-box-shadow-generator",
    name: "CSS Box Shadow Generator",
    description: "Craft box-shadow values with blur, spread and color.",
    category: "design",
    icon: "square",
    keywords: ["box shadow", "css shadow", "elevation"],
    popular: false,
    featured: false,
    inputs: [str("x", "X offset px (default 0)", false), str("y", "Y offset px (default 8)", false), str("blur", "Blur px (default 24)", false), str("spread", "Spread px (default 0)", false), str("color", "Color (default rgba(0,0,0,0.15))", false)],
    outputs: [out("css", "CSS")],
    validate: () => ok(),
    execute: async (input) => {
      const num = (id: string, fallback: number): number => {
        const raw = req(input, id);
        if (raw === "") {
          return fallback;
        }
        const n = Number(raw);
        if (Number.isNaN(n)) {
          throw new RangeError(`${id} must be a number.`);
        }
        return n;
      };
      const css = `box-shadow: ${num("x", 0)}px ${num("y", 8)}px ${num("blur", 24)}px ${num("spread", 0)}px ${req(input, "color") || "rgba(0,0,0,0.15)"};`;
      return { css };
    },
  },
  {
    id: "css-border-radius-generator",
    slug: "css-border-radius-generator",
    name: "CSS Border Radius Generator",
    description: "Generate border-radius for uniform or per-corner rounding.",
    category: "design",
    icon: "squircle",
    keywords: ["border radius", "rounded corners", "css radius"],
    popular: false,
    featured: false,
    inputs: [str("all", "All corners px (default 12)", false), str("topLeft", "Top-left px (optional)", false), str("topRight", "Top-right px (optional)", false), str("bottomRight", "Bottom-right px (optional)", false), str("bottomLeft", "Bottom-left px (optional)", false)],
    outputs: [out("css", "CSS")],
    validate: () => ok(),
    execute: async (input) => {
      const pick = (id: string, fallback: string): string => req(input, id) || fallback;
      const all = pick("all", "12");
      const tl = pick("topLeft", all);
      const tr = pick("topRight", all);
      const br = pick("bottomRight", all);
      const bl = pick("bottomLeft", all);
      const css = tl === tr && tr === br && br === bl ? `border-radius: ${tl}px;` : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
      return { css };
    },
  },
  {
    id: "css-button-generator",
    slug: "css-button-generator",
    name: "CSS Button Generator",
    description: "Generate a complete copy-paste button style block.",
    category: "design",
    icon: "rectangle-horizontal",
    keywords: ["css button", "button style", "cta style"],
    popular: false,
    featured: false,
    inputs: [str("bg", "Background (default #4f46e5)", false), str("color", "Text color (default #ffffff)", false), str("padding", "Padding (default 12px 24px)", false), str("radius", "Radius px (default 8)", false)],
    outputs: [out("css", "CSS block")],
    validate: () => ok(),
    execute: async (input) => {
      const bg = req(input, "bg") || "#4f46e5";
      const color = req(input, "color") || "#ffffff";
      const padding = req(input, "padding") || "12px 24px";
      const radius = req(input, "radius") || "8";
      return {
        css: `.btn {\n  background: ${bg};\n  color: ${color};\n  padding: ${padding};\n  border: none;\n  border-radius: ${radius}px;\n  font-weight: 600;\n  cursor: pointer;\n}`,
      };
    },
  },
  {
    id: "color-converter",
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB and HSL color formats.",
    category: "color",
    icon: "droplet",
    keywords: ["color converter", "hex to rgb", "rgb to hsl", "hex"],
    popular: true,
    featured: false,
    inputs: [str("color", "Color (HEX like #4f46e5, or rgb(79,70,229))")],
    outputs: [out("hex", "HEX"), out("rgb", "RGB"), out("hsl", "HSL")],
    validate: (input) => (req(input, "color") === "" ? err("color", "Enter a color.") : ok()),
    execute: async (input) => {
      const raw = req(input, "color");
      let r: number;
      let g: number;
      let b: number;
      const rgbMatch = raw.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
      if (rgbMatch !== null) {
        r = Math.min(255, Number(rgbMatch[1]));
        g = Math.min(255, Number(rgbMatch[2]));
        b = Math.min(255, Number(rgbMatch[3]));
      } else {
        const parsed = hexToRgb(raw);
        r = parsed.r;
        g = parsed.g;
        b = parsed.b;
      }
      const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      const hsl = rgbToHsl(r, g, b);
      return { hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` };
    },
  },
  {
    id: "color-contrast-checker",
    slug: "color-contrast-checker",
    name: "Color Contrast Checker",
    description: "Check WCAG contrast ratios between text and background colors.",
    category: "color",
    icon: "contrast",
    keywords: ["contrast checker", "wcag", "accessibility", "color contrast"],
    popular: false,
    featured: false,
    inputs: [str("foreground", "Text color HEX (default #000000)", false), str("background", "Background HEX (default #ffffff)", false)],
    outputs: [out("ratio", "Contrast ratio"), out("aaNormal", "WCAG AA normal text"), out("aaLarge", "WCAG AA large text"), out("aaa", "WCAG AAA")],
    validate: () => ok(),
    execute: async (input) => {
      const fg = hexToRgb(req(input, "foreground") || "#000000");
      const bg = hexToRgb(req(input, "background") || "#ffffff");
      const l1 = luminance(fg.r, fg.g, fg.b);
      const l2 = luminance(bg.r, bg.g, bg.b);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const rounded = Math.round(ratio * 100) / 100;
      return {
        ratio: `${rounded}:1`,
        aaNormal: ratio >= 4.5 ? "Pass" : "Fail",
        aaLarge: ratio >= 3 ? "Pass" : "Fail",
        aaa: ratio >= 7 ? "Pass" : "Fail",
      };
    },
  },
  {
    id: "url-qr-generator",
    slug: "url-qr-generator",
    name: "URL QR Generator",
    description: "Build a clean URL payload for QR codes, generated locally and ready to encode.",
    category: "qr",
    icon: "qr-code",
    keywords: ["url qr", "qr code generator", "link qr"],
    popular: true,
    featured: false,
    inputs: [str("url", "URL (https://…)")],
    outputs: [out("qrPayload", "QR payload (preview renders below)"), out("note", "How to use")],
    validate: (input) => {
      const url = req(input, "url");
      if (url === "") {
        return err("url", "Enter a URL.");
      }
      try {
        const parsed = new URL(url.includes("://") ? url : `https://${url}`);
        if (parsed.hostname === "") {
          return err("url", "Enter a valid URL.");
        }
      } catch {
        return err("url", "Enter a valid URL, e.g. https://rovotools.com.");
      }
      return ok();
    },
    execute: async (input) => {
      const raw = req(input, "url");
      const payload = raw.includes("://") ? raw : `https://${raw}`;
      return { qrPayload: payload, note: "A scannable QR preview renders below. Copy the payload into any QR app if needed." };
    },
  },
  {
    id: "wifi-qr-generator",
    slug: "wifi-qr-generator",
    name: "WiFi QR Generator",
    description: "Create a WIFI: QR payload so guests join your network by scanning.",
    category: "qr",
    icon: "wifi",
    keywords: ["wifi qr", "wifi password qr", "network qr"],
    popular: false,
    featured: false,
    inputs: [str("ssid", "Network name (SSID)"), str("password", "Password (empty for open network)", false), str("security", "Security: WPA (default), WEP or nopass", false)],
    outputs: [out("qrPayload", "QR payload (preview renders below)"), out("note", "How to use")],
    validate: (input) => (req(input, "ssid") === "" ? err("ssid", "Enter the network name.") : ok()),
    execute: async (input) => {
      const esc = (s: string): string => s.replace(/([\\;,":])/g, "\\$1");
      const sec = (req(input, "security") || "WPA").toUpperCase();
      const payload = `WIFI:T:${sec === "NOPASS" ? "nopass" : sec};S:${esc(req(input, "ssid"))};P:${esc(req(input, "password"))};;`;
      return { qrPayload: payload, note: "Scan the QR preview below with a phone camera to join the network." };
    },
  },
  {
    id: "vcard-qr-generator",
    slug: "vcard-qr-generator",
    name: "vCard QR Generator",
    description: "Build a vCard contact payload for QR business cards.",
    category: "qr",
    icon: "contact",
    keywords: ["vcard qr", "contact qr", "business card qr"],
    popular: false,
    featured: false,
    inputs: [str("name", "Full name"), str("phone", "Phone (optional)", false), str("email", "Email (optional)", false), str("org", "Organization (optional)", false)],
    outputs: [out("qrPayload", "vCard payload (preview renders below)"), out("note", "How to use")],
    validate: (input) => (req(input, "name") === "" ? err("name", "Enter a name.") : ok()),
    execute: async (input) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${req(input, "name")}`,
        ...(req(input, "phone") !== "" ? [`TEL:${req(input, "phone")}`] : []),
        ...(req(input, "email") !== "" ? [`EMAIL:${req(input, "email")}`] : []),
        ...(req(input, "org") !== "" ? [`ORG:${req(input, "org")}`] : []),
        "END:VCARD",
      ];
      return { qrPayload: lines.join("\n"), note: "A scannable QR preview renders below." };
    },
  },
  {
    id: "text-qr-generator",
    slug: "text-qr-generator",
    name: "Text QR Generator",
    description: "Turn any short text into a QR-ready payload with an optional QR image.",
    category: "qr",
    icon: "message-square",
    keywords: ["text qr", "qr generator", "plain text qr"],
    popular: false,
    featured: false,
    inputs: [area("text", "Text (up to ~500 chars)")],
    outputs: [out("qrPayload", "QR payload (preview renders below)"), out("note", "How to use")],
    validate: (input) => {
      const text = req(input, "text");
      if (text === "") {
        return err("text", "Enter some text.");
      }
      if (text.length > 1000) {
        return err("text", "Keep text under 1000 characters for reliable scanning.");
      }
      return ok();
    },
    execute: async (input) => ({
      qrPayload: req(input, "text"),
      note: "A scannable QR preview renders below.",
    }),
  },
  {
    id: "text-to-pdf",
    slug: "text-to-pdf",
    name: "Text to PDF",
    description: "Convert plain text into a downloadable single-page PDF, generated locally in your browser.",
    category: "pdf",
    icon: "file-text",
    keywords: ["text to pdf", "create pdf", "txt to pdf", "pdf creator"],
    popular: true,
    featured: true,
    inputs: [area("text", "Text content")],
    outputs: [out("pdfBase64", "PDF as Base64 (save with .pdf extension or use Download)"), numOut("pages", "Pages"), out("note", "How to save")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Enter text to convert.") : ok()),
    execute: async (input) => {
      const pdf = textToPdfauti(req(input, "text"));
      return {
        pdfBase64: b64encode(pdf),
        pages: 1,
        note: "Copy the Base64 and decode to a .pdf file, or use Download to save the result and rename to .pdf.",
      };
    },
  },
  {
    id: "meta-tag-generator",
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    description: "Generate SEO title, description and Open Graph tags for any page.",
    category: "seo",
    icon: "tags",
    keywords: ["meta tags", "seo meta", "open graph generator"],
    popular: false,
    featured: false,
    inputs: [str("title", "Page title (50-60 chars ideal)"), str("description", "Meta description (150-160 chars ideal)"), str("url", "Canonical URL (optional)", false)],
    outputs: [out("html", "HTML tags"), out("advice", "Length check")],
    validate: (input) => {
      if (req(input, "title") === "" || req(input, "description") === "") {
        return err("title", "Enter both title and description.");
      }
      return ok();
    },
    execute: async (input) => {
      const title = req(input, "title");
      const description = req(input, "description");
      const url = req(input, "url");
      const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const html = [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        ...(url !== "" ? [`<link rel="canonical" href="${esc(url)}" />`] : []),
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join("\n");
      const advice = `Title ${title.length} chars (${title.length >= 30 && title.length <= 65 ? "good" : "aim for 30-65"}); description ${description.length} chars (${description.length >= 120 && description.length <= 165 ? "good" : "aim for 120-165"}).`;
      return { html, advice };
    },
  },
  {
    id: "svg-placeholder-generator",
    slug: "svg-placeholder-generator",
    name: "SVG Placeholder Generator",
    description: "Generate lightweight SVG placeholder images as data URLs, locally.",
    category: "image",
    icon: "image",
    keywords: ["svg placeholder", "placeholder image", "dummy image", "data url"],
    popular: false,
    featured: false,
    inputs: [str("width", "Width px (default 600)", false), str("height", "Height px (default 400)", false), str("bg", "Background (default #e5e7eb)", false), str("fg", "Text color (default #6b7280)", false), str("label", "Label text (optional)", false)],
    outputs: [out("dataUrl", "SVG data URL"), out("html", "HTML snippet")],
    validate: () => ok(),
    execute: async (input) => {
      const num = (id: string, fallback: number): number => {
        const raw = req(input, id);
        if (raw === "") {
          return fallback;
        }
        const n = Math.floor(Number(raw));
        if (Number.isNaN(n) || n <= 0 || n > 4000) {
          throw new RangeError(`${id} must be between 1 and 4000.`);
        }
        return n;
      };
      const w = num("width", 600);
      const h = num("height", 400);
      const bg = req(input, "bg") || "#e5e7eb";
      const fg = req(input, "fg") || "#6b7280";
      const label = req(input, "label") || `${w} × ${h}`;
      const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${esc(bg)}"/><text x="50%" y="50%" fill="${esc(fg)}" font-family="system-ui,sans-serif" font-size="${Math.max(12, Math.min(w, h) / 12)}" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text></svg>`;
      const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return { dataUrl, html: `<img src="${dataUrl}" alt="${esc(label)}" width="${w}" height="${h}" />` };
    },
  },
  {
    id: "average-calculator",
    slug: "average-calculator",
    name: "Average Calculator",
    description: "Compute mean, median, min, max and sum of a number list.",
    category: "analytics",
    icon: "bar-chart",
    keywords: ["average", "mean", "median", "statistics"],
    popular: false,
    featured: false,
    inputs: [area("numbers", "Numbers separated by commas, spaces or new lines")],
    outputs: [numOut("mean", "Mean"), numOut("median", "Median"), numOut("min", "Min"), numOut("max", "Max"), numOut("sum", "Sum"), numOut("count", "Count")],
    validate: (input) => (req(input, "numbers") === "" ? err("numbers", "Enter some numbers.") : ok()),
    execute: async (input) => {
      const nums = req(input, "numbers")
        .split(/[\s,;]+/)
        .filter((s) => s !== "")
        .map(Number);
      if (nums.length === 0 || nums.some((n) => Number.isNaN(n))) {
        throw new RangeError("Enter valid numbers separated by commas, spaces or new lines.");
      }
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2 : (sorted[mid] as number);
      const round4 = (v: number): number => Math.round(v * 10000) / 10000;
      return {
        mean: round4(nums.reduce((a, b) => a + b, 0) / nums.length),
        median: round4(median),
        min: sorted[0] as number,
        max: sorted[sorted.length - 1] as number,
        sum: round4(nums.reduce((a, b) => a + b, 0)),
        count: nums.length,
      };
    },
  },
  {
    id: "email-validator",
    slug: "email-validator",
    name: "Email Validator",
    description: "Check email address syntax with clear pass/fail detail.",
    category: "validator",
    icon: "mail-check",
    keywords: ["email validator", "validate email", "email check"],
    popular: false,
    featured: false,
    inputs: [str("email", "Email address")],
    outputs: [out("valid", "Valid"), out("detail", "Detail")],
    validate: (input) => (req(input, "email") === "" ? err("email", "Enter an email address.") : ok()),
    execute: async (input) => {
      const email = req(input, "email");
      const basic = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!basic) {
        return { valid: "false", detail: "Must look like name@example.com with a domain and TLD." };
      }
      const [local, domain] = email.split("@");
      if ((local as string).length > 64) {
        return { valid: "false", detail: "Local part exceeds 64 characters." };
      }
      if ((domain as string).includes("..") || (domain as string).startsWith("-")) {
        return { valid: "false", detail: "Domain part is malformed." };
      }
      return { valid: "true", detail: "Syntax looks valid. Deliverability is not checked." };
    },
  },
  {
    id: "url-validator",
    slug: "url-validator",
    name: "URL Validator",
    description: "Validate URL syntax and inspect protocol, host and path.",
    category: "validator",
    icon: "link",
    keywords: ["url validator", "validate url", "link check"],
    popular: false,
    featured: false,
    inputs: [str("url", "URL to validate")],
    outputs: [out("valid", "Valid"), out("protocol", "Protocol"), out("host", "Host"), out("detail", "Detail")],
    validate: (input) => (req(input, "url") === "" ? err("url", "Enter a URL.") : ok()),
    execute: async (input) => {
      try {
        const parsed = new URL(req(input, "url"));
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return { valid: "false", protocol: parsed.protocol, host: parsed.hostname, detail: "Only http and https URLs are accepted." };
        }
        return { valid: "true", protocol: parsed.protocol, host: parsed.hostname, detail: "Valid http(s) URL." };
      } catch {
        return { valid: "false", protocol: "—", host: "—", detail: "Not a valid URL. Include the protocol, e.g. https://example.com." };
      }
    },
  },
  {
    id: "number-formatter",
    slug: "number-formatter",
    name: "Number Formatter",
    description: "Format numbers with locale grouping, decimals and compact notation.",
    category: "formatter",
    icon: "hash",
    keywords: ["number formatter", "format number", "thousands separator"],
    popular: false,
    featured: false,
    inputs: [str("value", "Number"), str("decimals", "Decimals (default 2)", false), str("locale", "Locale, e.g. en-US (default)", false)],
    outputs: [out("grouped", "Grouped"), out("compact", "Compact"), out("fixed", "Fixed decimals")],
    validate: (input) => {
      if (req(input, "value") === "" || Number.isNaN(Number(req(input, "value")))) {
        return err("value", "Enter a valid number.");
      }
      return ok();
    },
    execute: async (input) => {
      const value = Number(req(input, "value"));
      const rawDec = req(input, "decimals");
      const decimals = rawDec === "" ? 2 : Math.min(10, Math.max(0, Math.floor(Number(rawDec))));
      if (Number.isNaN(decimals)) {
        throw new RangeError("Decimals must be 0-10.");
      }
      const locale = req(input, "locale") || "en-US";
      let grouped: string;
      let compact: string;
      try {
        grouped = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
        compact = new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
      } catch {
        throw new RangeError("Invalid locale, e.g. use en-US, de-DE or ar-EG.");
      }
      return { grouped, compact, fixed: value.toFixed(decimals) };
    },
  },
  {
    id: "date-formatter",
    slug: "date-formatter",
    name: "Date Formatter",
    description: "Format a date in ISO, long, short and UTC styles.",
    category: "formatter",
    icon: "calendar",
    keywords: ["date formatter", "format date", "iso date"],
    popular: false,
    featured: false,
    inputs: [str("date", "Date (YYYY-MM-DD or full ISO). Empty = today.", false)],
    outputs: [out("iso", "ISO date"), out("long", "Long format"), out("short", "Short format"), out("utc", "UTC")],
    validate: () => ok(),
    execute: async (input) => {
      const raw = req(input, "date");
      const date = raw === "" ? new Date() : new Date(raw);
      if (Number.isNaN(date.getTime())) {
        throw new RangeError("Enter a valid date.");
      }
      return {
        iso: date.toISOString().slice(0, 10),
        long: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        short: date.toLocaleDateString("en-US"),
        utc: date.toUTCString(),
      };
    },
  },
  {
    id: "random-number-generator",
    slug: "random-number-generator",
    name: "Random Number Generator",
    description: "Generate secure random integers in any range, locally.",
    category: "other",
    icon: "dices",
    keywords: ["random number", "rng", "random integer"],
    popular: false,
    featured: false,
    inputs: [str("min", "Minimum (default 1)", false), str("max", "Maximum (default 100)", false), str("count", "How many (default 1, max 50)", false)],
    outputs: [out("numbers", "Random numbers (one per line)")],
    validate: () => ok(),
    execute: async (input) => {
      const pickNum = (id: string, fallback: number): number => {
        const raw = req(input, id);
        if (raw === "") {
          return fallback;
        }
        const n = Math.floor(Number(raw));
        if (Number.isNaN(n)) {
          throw new RangeError(`${id} must be an integer.`);
        }
        return n;
      };
      const min = pickNum("min", 1);
      const max = pickNum("max", 100);
      const count = Math.min(50, Math.max(1, pickNum("count", 1)));
      if (min > max) {
        throw new RangeError("Minimum must not exceed maximum.");
      }
      const range = max - min + 1;
      const bytes = new Uint8Array(count * 4);
      globalThis.crypto?.getRandomValues?.(bytes);
      const view = new DataView(bytes.buffer);
      const lines: Array<string> = [];
      for (let i = 0; i < count; i += 1) {
        const rand = view.getUint32(i * 4, false) / 0xffffffff;
        lines.push(String(min + Math.floor(rand * range)));
      }
      return { numbers: lines.join("\n") };
    },
  },
  {
    id: "code-minifier",
    slug: "code-minifier",
    name: "Code Minifier & Beautifier",
    description: "Minify or expand HTML, CSS and JavaScript and see the bytes saved. A whitespace and comment stripper for snippets — not a compiler.",
    category: "developer",
    icon: "code",
    keywords: ["code minifier", "minify js", "minify css", "minify html", "beautify code", "code beautifier"],
    popular: false,
    featured: false,
    inputs: [area("code", "Code input"), str("language", "Language: html, css or js (default js)", false), str("mode", "Mode: minify (default) or beautify", false)],
    outputs: [out("result", "Result"), numOut("savedBytes", "Bytes saved (negative when expanded)")],
    validate: (input) => (req(input, "code") === "" ? err("code", "Paste code to minify or beautify.") : ok()),
    execute: async (input) => {
      const raw = req(input, "code");
      const lang = normalizeCodeLanguage(req(input, "language"));
      const mode = (req(input, "mode") || "minify").toLowerCase();
      const result = mode.startsWith("beaut") || mode.startsWith("expand") || mode === "pretty"
        ? beautifyCode(raw, lang)
        : minifyCode(raw, lang);
      return { result, savedBytes: raw.length - result.length };
    },
  },
  {
    id: "keyword-density-checker",
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    description: "See which words and phrases dominate an article, and at what percentage. A warning system for repetition — not a target to hit.",
    category: "seo",
    icon: "bar-chart",
    keywords: ["keyword density", "keyword density checker", "word frequency", "phrase frequency", "seo content analysis"],
    popular: false,
    featured: false,
    inputs: [area("text", "Article text"), str("top", "Top phrases to show (default 10, max 50)", false), str("maxWords", "Longest phrase in words, 1-3 (default 3)", false)],
    outputs: [numOut("totalWords", "Total words"), out("topPhrases", "Top phrases (phrase — count, %)"), out("note", "How to read this")],
    validate: (input) => (req(input, "text") === "" ? err("text", "Paste article text to analyse.") : ok()),
    execute: async (input) => {
      const { words, phrases } = keywordFrequencies(req(input, "text"), keywordPhraseLength(req(input, "maxWords")));
      const rawTop = req(input, "top");
      const top = rawTop === "" ? 10 : Math.min(50, Math.max(1, Math.floor(Number(rawTop)) || 10));
      const ranked = [...phrases.entries()].sort((a, b) => b[1] - a[1]).slice(0, top);
      const lines = ranked.map(([phrase, count]) => `${phrase} — ${count} (${((count / words.length) * 100).toFixed(2)}%)`);
      return {
        totalWords: words.length,
        topPhrases: lines.join("\n") || "—",
        note: "High density flags accidental repetition. There is no percentage that helps rankings — modern search reads whole documents, not word counts.",
      };
    },
  },
  {
    id: "robots-txt-generator",
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Build a valid robots.txt with presets for WordPress, Blogger and Shopify — including the sitemap line crawlers actually use.",
    category: "seo",
    icon: "bot",
    keywords: ["robots.txt generator", "robots txt", "crawler rules", "wordpress robots.txt", "allow disallow"],
    popular: false,
    featured: false,
    inputs: [str("preset", "Preset: wordpress (default), blogger, shopify or custom", false), str("sitemap", "Sitemap URL (optional)", false), area("disallow", "Extra Disallow paths, one per line (optional)", false), area("allow", "Extra Allow paths, one per line (optional)", false)],
    outputs: [out("robotsTxt", "robots.txt"), numOut("rules", "Allow/Disallow lines")],
    validate: () => ok(),
    execute: async (input) => {
      const robotsTxt = buildRobotsTxt(
        req(input, "preset"),
        req(input, "sitemap"),
        req(input, "disallow"),
        req(input, "allow"),
      );
      const rules = robotsTxt.split("\n").filter((l) => /^(Allow|Disallow):/i.test(l)).length;
      return { robotsTxt, rules };
    },
  },
  {
    id: "adsense-earnings-calculator",
    slug: "adsense-earnings-calculator",
    name: "AdSense Earnings Calculator",
    description: "Estimate ad revenue from pageviews using CTR and CPC, or RPM — in USD or INR. A planning estimate, not a forecast.",
    category: "finance",
    icon: "dollar-sign",
    keywords: ["adsense calculator", "adsense earnings", "ad revenue estimator", "rpm calculator", "blog earnings calculator"],
    popular: false,
    featured: false,
    inputs: [str("pageviews", "Monthly pageviews"), str("mode", "Mode: ctr-cpc (default) or rpm", false), str("ctr", "Click-through rate % (default 1.5)", false), str("cpc", "Cost per click in USD (default 0.25)", false), str("rpm", "Revenue per 1000 views in USD (RPM mode)", false), str("currency", "Currency: USD (default) or INR", false)],
    outputs: [numOut("monthly", "Est. monthly earnings"), numOut("daily", "Est. daily earnings"), out("assumptions", "Assumptions used")],
    validate: (input) => {
      if (req(input, "pageviews") === "" || Number.isNaN(Number(req(input, "pageviews")))) {
        return err("pageviews", "Enter monthly pageviews as a number.");
      }
      return ok();
    },
    execute: async (input) => {
      const pageviews = Number(req(input, "pageviews"));
      if (!Number.isFinite(pageviews) || pageviews < 0) {
        throw new RangeError("Pageviews must be zero or more.");
      }
      const mode = (req(input, "mode") || "ctr-cpc").toLowerCase();
      const currency = (req(input, "currency") || "USD").toUpperCase() === "INR" ? "INR" : "USD";
      let monthlyUSD: number;
      let assumptions: string;
      if (mode === "rpm") {
        const rpm = Number(req(input, "rpm"));
        if (req(input, "rpm") === "" || Number.isNaN(rpm) || rpm < 0) {
          throw new RangeError("Enter RPM in USD for rpm mode.");
        }
        monthlyUSD = (pageviews / 1000) * rpm;
        assumptions = `${pageviews.toLocaleString("en-US")} pageviews at $${rpm} RPM.`;
      } else if (mode === "ctr-cpc" || mode === "ctr" || mode === "cpc") {
        const ctrRaw = req(input, "ctr");
        const cpcRaw = req(input, "cpc");
        const ctr = ctrRaw === "" ? 1.5 : Number(ctrRaw);
        const cpc = cpcRaw === "" ? 0.25 : Number(cpcRaw);
        if (Number.isNaN(ctr) || ctr < 0 || ctr > 100 || Number.isNaN(cpc) || cpc < 0) {
          throw new RangeError("CTR must be 0-100% and CPC zero or more.");
        }
        monthlyUSD = pageviews * (ctr / 100) * cpc;
        assumptions = `${pageviews.toLocaleString("en-US")} pageviews at ${ctr}% CTR and $${cpc} CPC.`;
      } else {
        throw new RangeError(`Unknown mode "${req(input, "mode")}". Use ctr-cpc or rpm.`);
      }
      const rate = currency === "INR" ? ADSENSE_USD_TO_INR : 1;
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      const monthly = round2(monthlyUSD * rate);
      const symbol = currency === "INR" ? "₹" : "$";
      return {
        monthly,
        daily: round2(monthly / 30),
        assumptions: `${assumptions} Shown in ${currency} (${symbol}) at an approximate $${ADSENSE_USD_TO_INR} = ₹${ADSENSE_USD_TO_INR} rate. Real earnings move with country mix, season and placement — this is planning maths, not a forecast.`,
      };
    },
  },
  {
    id: "tax-calculator",
    slug: "tax-calculator",
    name: "Tax Calculator (GST / VAT)",
    description: "Add or remove sales tax worldwide: pick a region for its standard rates, or type any custom rate. Shows the CGST/SGST split for India.",
    category: "finance",
    icon: "receipt",
    keywords: ["gst calculator", "vat calculator", "sales tax calculator", "cgst sgst", "tax inclusive exclusive", "add remove tax"],
    popular: true,
    featured: false,
    inputs: [
      str("amount", "Amount"),
      { id: "region", type: "select", labelKey: "Region", required: true, defaultValue: "india", options: TAX_REGION_OPTIONS },
      str("rate", "Rate % — empty uses the regional standard", false),
      str("customRate", "Custom rate % — overrides everything when set", false),
      str("mode", "Mode: add (default) or remove", false),
    ],
    outputs: [numOut("net", "Net amount"), numOut("tax", "Tax amount"), numOut("gross", "Gross amount"), out("split", "Tax split"), out("appliedRate", "Rate applied")],
    validate: (input) => {
      if (req(input, "amount") === "" || Number.isNaN(Number(req(input, "amount")))) {
        return err("amount", "Enter an amount as a number.");
      }
      return ok();
    },
    execute: async (input) => {
      const amount = Number(req(input, "amount"));
      if (!Number.isFinite(amount) || amount < 0) {
        throw new RangeError("Amount must be zero or more.");
      }
      const { rate, regionLabel, note } = resolveTaxRate(req(input, "region"), req(input, "rate"), req(input, "customRate"));
      const mode = (req(input, "mode") || "add").toLowerCase();
      const round2 = (v: number): number => Math.round(v * 100) / 100;
      let net: number;
      let tax: number;
      let gross: number;
      if (mode === "remove") {
        net = amount / (1 + rate / 100);
        tax = amount - net;
        gross = amount;
      } else if (mode === "add" || mode === "") {
        net = amount;
        tax = (amount * rate) / 100;
        gross = amount + tax;
      } else {
        throw new RangeError(`Unknown mode "${req(input, "mode")}". Use add or remove.`);
      }
      const regionKey = (req(input, "region").trim() === "" ? "india" : req(input, "region").trim()).toLowerCase();
      const split = TAX_REGIONS[regionKey]?.splitCGST === true
        ? `CGST (${round2(rate / 2)}%): ${round2(tax / 2).toFixed(2)}, SGST (${round2(rate / 2)}%): ${round2(tax / 2).toFixed(2)}`
        : `Single ${regionLabel} levy — no split.`;
      return { net: round2(net), tax: round2(tax), gross: round2(gross), split, appliedRate: note };
    },
  },
  {
    id: "youtube-thumbnail-downloader",
    slug: "youtube-thumbnail-downloader",
    name: "YouTube Thumbnail Downloader",
    description: "Grab full-resolution thumbnails from any YouTube URL — no API key. Thumbnails are public files; this tool just builds the address.",
    category: "seo",
    icon: "youtube",
    requiresNetwork: true,
    keywords: ["youtube thumbnail", "thumbnail downloader", "yt thumbnail grabber", "maxresdefault", "video thumbnail"],
    popular: false,
    featured: false,
    inputs: [str("url", "YouTube URL or 11-character video ID")],
    outputs: [out("maxres", "Full HD 1280×720"), out("sd", "SD 640×480"), out("hq", "High 480×360"), out("mq", "Medium 320×180"), out("default", "Default 120×90"), out("note", "How to use")],
    validate: (input) => {
      if (req(input, "url") === "") {
        return err("url", "Paste a YouTube URL or video ID.");
      }
      try {
        extractYouTubeVideoId(req(input, "url"));
      } catch (error) {
        return err("url", error instanceof Error ? error.message : "Invalid YouTube URL.");
      }
      return ok();
    },
    execute: async (input) => {
      const id = extractYouTubeVideoId(req(input, "url"));
      const base = `https://i.ytimg.com/vi/${id}`;
      return {
        maxres: `${base}/maxresdefault.jpg`,
        sd: `${base}/sddefault.jpg`,
        hq: `${base}/hqdefault.jpg`,
        mq: `${base}/mqdefault.jpg`,
        default: `${base}/default.jpg`,
        note: "Open a link to view it, then right-click → save. Maxres exists only on videos uploaded in HD — if it 404s, use SD. Downloading needs the network.",
      };
    },
  },
  {
    id: "image-converter",
    slug: "image-converter",
    name: "Image Converter",
    description: "Convert between PNG, JPG and WebP with full quality control — one file or twenty at a time, all on your device.",
    category: "image",
    icon: "repeat",
    browserOnly: true,
    keywords: ["image converter", "png to webp", "jpg to png", "convert image format", "webp converter"],
    popular: false,
    featured: false,
    inputs: [
      { id: "images", type: "file", labelKey: "Images (JPG, PNG, WebP — up to 20)", required: true },
      str("format", "Output format: webp (default), jpeg or png", false),
      str("quality", "Quality 1-100 for JPEG/WebP (default 85)", false),
    ],
    outputs: [out("files", "Converted files (download in the tool below)"), numOut("count", "Files converted")],
    validate: (input) => {
      const images = input["images"];
      const present = typeof images === "string" ? images.trim() !== "" : images instanceof Blob;
      return present ? ok() : err("images", "Choose at least one image to convert.");
    },
    execute: async () => {
      throw new Error("Image conversion runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize photos by exact pixels or percentage with the aspect ratio locked — plus presets for YouTube, Instagram and Open Graph.",
    category: "image",
    icon: "scaling",
    browserOnly: true,
    keywords: ["image resizer", "resize photo", "resize image pixels", "youtube thumbnail size", "instagram size"],
    popular: true,
    featured: false,
    inputs: [
      { id: "image", type: "file", labelKey: "Image (JPG, PNG, WebP)", required: true },
      str("width", "Width in pixels (pixels mode)", false),
      str("height", "Height in pixels (pixels mode)", false),
      str("scale", "Scale percent, e.g. 50 (percent mode)", false),
      str("format", "Output format: same (default), webp, jpeg or png", false),
    ],
    outputs: [out("file", "Resized file (download in the tool below)"), out("dimensions", "New dimensions")],
    validate: (input) => {
      const image = input["image"];
      const present = typeof image === "string" ? image.trim() !== "" : image instanceof Blob;
      return present ? ok() : err("image", "Choose an image to resize.");
    },
    execute: async () => {
      throw new Error("Image resizing runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
  {
    id: "image-compressor",
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Shrink JPG, PNG and WebP by quality or to an exact target size in KB — batch supported, all on your device.",
    category: "image",
    icon: "shrink",
    browserOnly: true,
    keywords: ["image compressor", "compress jpg", "compress image to 100kb", "reduce photo size", "shrink image"],
    popular: true,
    featured: true,
    inputs: [
      { id: "images", type: "file", labelKey: "Images (JPG, PNG, WebP — up to 20)", required: true },
      str("mode", "Mode: quality (default) or target-size", false),
      str("quality", "JPEG quality 1-100 (default 72)", false),
      str("targetKb", "Target size in KB, e.g. 100 (target-size mode)", false),
      flag("webp", "Also output WebP", false),
      flag("capWidth", "Cap width at 1920px before compressing", false),
    ],
    outputs: [out("files", "Compressed files (download in the tool below)"), numOut("savedBytes", "Total bytes saved")],
    validate: (input) => {
      const images = input["images"];
      const present = typeof images === "string" ? images.trim() !== "" : images instanceof Blob;
      return present ? ok() : err("images", "Choose at least one image to compress.");
    },
    execute: async () => {
      throw new Error("Image compression runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
  {
    id: "favicon-generator",
    slug: "favicon-generator",
    name: "Favicon Generator",
    description: "Turn one image into every favicon size plus the HTML to paste — all on your device.",
    category: "image",
    icon: "star",
    browserOnly: true,
    keywords: ["favicon generator", "favicon maker", "apple touch icon", "site icon", "create favicon"],
    popular: false,
    featured: false,
    inputs: [
      { id: "image", type: "file", labelKey: "Source image (square works best)", required: true },
    ],
    outputs: [out("files", "Favicon files (download in the tool below)"), out("html", "HTML to paste into <head>")],
    validate: (input) => {
      const image = input["image"];
      const present = typeof image === "string" ? image.trim() !== "" : image instanceof Blob;
      return present ? ok() : err("image", "Choose a source image.");
    },
    execute: async () => {
      throw new Error("Favicon generation runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
  {
    id: "color-picker-from-image",
    slug: "color-picker-from-image",
    name: "Color Picker from Image",
    description: "Pull the exact HEX code from any pixel in an image you upload — plus the six colors that dominate it.",
    category: "image",
    icon: "pipette",
    browserOnly: true,
    keywords: ["color picker", "eyedropper", "image color picker", "hex from image", "dominant colors"],
    popular: false,
    featured: false,
    inputs: [
      { id: "image", type: "file", labelKey: "Image to sample colors from", required: true },
    ],
    outputs: [out("sampled", "Sampled color (pick in the tool below)"), out("palette", "Dominant colors")],
    validate: (input) => {
      const image = input["image"];
      const present = typeof image === "string" ? image.trim() !== "" : image instanceof Blob;
      return present ? ok() : err("image", "Choose an image to sample.");
    },
    execute: async () => {
      throw new Error("Color picking runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
  {
    id: "image-cropper",
    slug: "image-cropper",
    name: "Image Cropper",
    description: "Crop to 1:1, 4:5, 16:9 or a 1280×720 YouTube thumbnail — drag the box or type exact pixels, all on your device.",
    category: "image",
    icon: "crop",
    browserOnly: true,
    keywords: ["image cropper", "crop photo", "crop 16:9", "youtube thumbnail size", "crop to square"],
    popular: true,
    featured: false,
    inputs: [
      { id: "image", type: "file", labelKey: "Image (JPG, PNG, WebP)", required: true },
      str("ratio", "Aspect ratio: free (default), 1:1, 4:5, 16:9, 4:3 or youtube", false),
    ],
    outputs: [out("file", "Cropped file (download in the tool below)"), out("dimensions", "New dimensions")],
    validate: (input) => {
      const image = input["image"];
      const present = typeof image === "string" ? image.trim() !== "" : image instanceof Blob;
      return present ? ok() : err("image", "Choose an image to crop.");
    },
    execute: async () => {
      throw new Error("Image cropping runs on the browser canvas. Open this tool on the RovoTools website — it cannot run here.");
    },
  },
];

export const EXTRA_TOOLS: ReadonlyArray<ToolRegistryEntry> = SPECS.map((spec) => ({
  definition: defineTool<Record<string, unknown>, Record<string, unknown>>({
    id: spec.id,
    slug: spec.slug,
    name: spec.name,
    description: spec.description,
    category: spec.category,
    icon: spec.icon,
    keywords: [...spec.keywords],
    featured: spec.featured,
    popular: spec.popular,
    supportedPlatforms: [...ALL_PLATFORMS],
    processingMode: "LOCAL",
    supportedFormats: [],
    requiresNetwork: spec.requiresNetwork ?? false,
    localizationKey: `tools.${spec.id}`,
    relatedTools: [],
    seo: {
      title: `${spec.name} | RovoTools`,
      description: `Free ${spec.name.toLowerCase()}. ${spec.description}`,
      keywords: [...spec.keywords, spec.name.toLowerCase(), "free online"],
    },
    nameKey: `tools.${spec.id}.name`,
    descriptionKey: `tools.${spec.id}.description`,
    metadata: { version: "1.0.0", isOfflineCapable: !(spec.requiresNetwork ?? false), tags: [spec.category, "free", "local"] },
    inputs: spec.inputs,
    outputs: spec.outputs,
    validate: spec.validate,
    execute: spec.execute,
  }),
}));

export function registerExtraTools(registry: ToolRegistry): ToolRegistry {
  for (const entry of EXTRA_TOOLS) {
    if (!registry.has(entry.definition.id)) {
      registry.register(entry);
    }
  }
  return registry;
}

export const BROWSER_ONLY_TOOL_IDS: ReadonlySet<string> = new Set(
  SPECS.filter((spec) => spec.browserOnly === true).map((spec) => spec.id),
);
