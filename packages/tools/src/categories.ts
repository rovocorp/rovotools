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
    description: "Work with PDF files quickly using tools to merge, split, compress, convert, create, protect and manage PDF documents online.",
    keywords: ["pdf tools", "text to pdf", "pdf creator", "free pdf", "merge pdf", "split pdf", "compress pdf", "jpg to pdf", "pdf to jpg", "word to pdf", "sign pdf", "pdf to word", "pdf to excel"],
  },
  image: {
    title: "Image Tools",
    description: "Compress, resize, convert, crop and optimize images for websites, documents, social media and everyday file sharing.",
    keywords: ["image tools", "image to base64", "base64 to image", "compress image", "resize image", "convert image"],
  },
  developer: {
    title: "Developer Tools",
    description: "Format, validate, encode, decode, compare and transform JSON, text, URLs, tokens and other developer data.",
    keywords: ["developer tools", "json formatter", "base64", "jwt decoder", "uuid", "regex tester"],
  },
  text: {
    title: "Text Tools",
    description: "Count, clean, transform and format text for writing, content creation, development, marketing and everyday work.",
    keywords: ["text tools", "word counter", "character counter", "lorem ipsum", "case converter"],
  },
  security: {
    title: "Security Tools",
    description: "Use practical browser-based security utilities for passwords, hashes, encoding, decoding and developer security tasks.",
    keywords: ["security tools", "password generator", "hash generator", "sha-256", "uuid generator"],
  },
  design: {
    title: "Design Tools",
    description: "Generate CSS gradients, shadows, border-radius and buttons with live copy-ready output.",
    keywords: ["design tools", "css gradient", "box shadow", "border radius"],
  },
  color: {
    title: "Color Tools",
    description: "Pick colors, generate palettes, convert HEX, RGB and HSL, and check contrast ratios for accessible design.",
    keywords: ["color tools", "color picker", "color palette", "hex to rgb", "contrast checker"],
  },
  qr: {
    title: "QR & Barcode Tools",
    description: "Build correctly-formatted QR payloads for URLs, WiFi, vCards and plain text. Scan-ready strings generated locally.",
    keywords: ["qr generator", "wifi qr", "vcard qr", "url qr"],
  },
  calculator: {
    title: "Calculators & Converters",
    description: "Calculate percentages, BMI, age, dates and everyday values — plus unit, length, weight and temperature conversions — with easy online calculators.",
    keywords: ["online calculators", "free calculators", "unit converter", "measurement converter", "metric imperial", "bmi calculator", "age calculator", "percentage calculator"],
  },
  finance: {
    title: "Finance Tools",
    description: "Estimate loans, mortgage payments, compound interest, savings, investments, ROI and other common financial calculations.",
    keywords: ["finance", "compound interest", "loan calculator", "roi", "vat", "mortgage calculator", "home loan", "interest"],
  },
  seo: {
    title: "SEO Tools",
    description: "Create and check common SEO resources and website metadata for better search visibility and technical website management.",
    keywords: ["seo tools", "slug generator", "meta tags", "robots.txt generator", "keyword density"],
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
