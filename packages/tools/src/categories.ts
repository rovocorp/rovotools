import type { ToolCategory } from "@rovotools/types";

export interface CategoryMetadata {
  readonly category: ToolCategory;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly keywords: ReadonlyArray<string>;
  readonly path: string;
}

const CATEGORY_COPY: Record<ToolCategory, { title: string; description: string; keywords: ReadonlyArray<string> }> = {
  pdf: {
    title: "PDF Tools",
    description: "Create, convert and work with PDF files. Text to PDF runs fully in your browser — your content never leaves your device.",
    keywords: ["pdf tools", "text to pdf", "pdf creator", "free pdf"],
  },
  image: {
    title: "Image Tools",
    description: "Encode, decode and convert images. Base64 conversion runs locally in your browser.",
    keywords: ["image tools", "image to base64", "base64 to image"],
  },
  document: {
    title: "Document Tools",
    description: "Count words, convert cases, clean text and generate slugs for documents and publishing.",
    keywords: ["document tools", "word counter", "case converter"],
  },
  developer: {
    title: "Developer Tools",
    description: "Format JSON, encode Base64 and URLs, decode JWTs, test regex and generate UUIDs — all locally.",
    keywords: ["developer tools", "json formatter", "base64", "jwt decoder", "uuid"],
  },
  text: {
    title: "Text Tools",
    description: "Count, convert, clean and generate text. Fast, free and private — everything runs in your browser.",
    keywords: ["text tools", "word counter", "character counter", "lorem ipsum"],
  },
  security: {
    title: "Security Tools",
    description: "Generate passwords and hashes locally. Nothing you type is uploaded or stored.",
    keywords: ["security tools", "password generator", "hash generator", "sha-256"],
  },
  design: {
    title: "Design Tools",
    description: "Generate CSS gradients, shadows, border-radius and buttons with live copy-ready output.",
    keywords: ["design tools", "css gradient", "box shadow", "border radius"],
  },
  color: {
    title: "Color Tools",
    description: "Convert HEX, RGB and HSL, and check contrast ratios for accessible design.",
    keywords: ["color tools", "hex to rgb", "contrast checker"],
  },
  qr: {
    title: "QR & Barcode Tools",
    description: "Build correctly-formatted QR payloads for URLs, WiFi, vCards and plain text. Scan-ready strings generated locally.",
    keywords: ["qr generator", "wifi qr", "vcard qr", "url qr"],
  },
  calculator: {
    title: "Calculators",
    description: "Free calculators for health, money, and everyday maths — BMI, loans, tips, and more.",
    keywords: ["online calculators", "free calculators", "finance calculators"],
  },
  finance: {
    title: "Finance Tools",
    description: "Compound interest, EMI, ROI, discount and VAT calculations with transparent formulas.",
    keywords: ["finance", "compound interest", "emi calculator", "roi", "vat"],
  },
  seo: {
    title: "SEO Tools",
    description: "Generate slugs, meta tags and check content length for search-friendly pages.",
    keywords: ["seo tools", "slug generator", "meta tags"],
  },
  utility: {
    title: "Utility Tools",
    description: "Everyday utilities that run privately on your device — age, dates, and practical helpers.",
    keywords: ["utility tools", "online utilities", "free tools"],
  },
  converter: {
    title: "Unit Converters",
    description: "Convert length, weight, temperature, and more with exact, audited factors.",
    keywords: ["unit converter", "measurement converter", "metric imperial"],
  },
  analytics: {
    title: "Analytics Tools",
    description: "Turn numbers into insight with transparent, reproducible analytics tools.",
    keywords: ["analytics tools", "data tools"],
  },
  validator: {
    title: "Validators",
    description: "Check and validate inputs with clear, explainable rules.",
    keywords: ["validators", "input validation"],
  },
  formatter: {
    title: "Formatters",
    description: "Format numbers, dates, and text consistently across platforms.",
    keywords: ["formatters", "number formatting"],
  },
  other: {
    title: "More Tools",
    description: "Every other free RovoTools utility, all running privately on your device.",
    keywords: ["free online tools"],
  },
};

export function getCategoryPath(category: ToolCategory): string {
  return `/tools/category/${category}`;
}

export function getCategoryMetadata(category: ToolCategory): CategoryMetadata {
  const copy = CATEGORY_COPY[category];
  return {
    category,
    slug: category,
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    path: getCategoryPath(category),
  };
}

export function getAllCategoryMetadata(): ReadonlyArray<CategoryMetadata> {
  return (Object.keys(CATEGORY_COPY) as Array<ToolCategory>).map(getCategoryMetadata);
}
