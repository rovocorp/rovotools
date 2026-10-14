import type { ToolCategory } from "@/shared/types";

export interface CategoryMetadata {
  readonly category: ToolCategory;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** Multi-paragraph hub intro rendered under the H1 for curation/SEO depth. */
  readonly longDescription: ReadonlyArray<string>;
  readonly keywords: ReadonlyArray<string>;
  readonly path: string;
}

interface CategoryCopy {
  title: string;
  description: string;
  longDescription: ReadonlyArray<string>;
  keywords: ReadonlyArray<string>;
}

const CATEGORY_COPY: Record<ToolCategory, CategoryCopy> = {
  pdf: {
    title: "PDF Tools",
    description:
      "Work with PDF files quickly using tools to merge, split, compress, convert, create, protect and manage PDF documents online.",
    longDescription: [
      "PDF is the default format for contracts, invoices, forms and anything that must print the same everywhere. This hub gathers every browser-based PDF workflow on RovoTools — combining files, breaking them apart, shrinking size, converting to and from images and Word, and creating clean documents from plain text.",
      "Start with the job you need done. To combine receipts or chapters, use Merge PDF. To pull out a page range, use Split PDF. To email a smaller attachment, Compress PDF. For scans and photos of documents, JPG to PDF wraps images in a printable container; PDF to JPG flattens pages back to images.",
      "When you need a brand-new document rather than editing an existing one, PDF Creator builds a real downloadable PDF from text entirely in your browser — no upload, no watermark, no account. Extract text from a PDF with PDF Extract Text when you need searchable content from a scan or locked file.",
      "Every tool in this category is designed for privacy-conscious everyday work: process locally whenever the browser can do it, keep files on your device, and avoid sending sensitive contracts to third-party conversion farms.",
    ],
    keywords: [
      "pdf tools",
      "text to pdf",
      "pdf creator",
      "free pdf",
      "merge pdf",
      "split pdf",
      "compress pdf",
      "jpg to pdf",
      "pdf to jpg",
      "word to pdf",
      "sign pdf",
      "pdf to word",
      "pdf to excel",
    ],
  },
  image: {
    title: "Image Tools",
    description:
      "Compress, resize, convert, crop and optimize images for websites, documents, social media and everyday file sharing.",
    longDescription: [
      "Images dominate page weight and message size. This hub covers the practical image jobs you hit when publishing, emailing or preparing assets: compress for faster pages, resize to display dimensions, convert between formats, crop to the right aspect ratio for social or product shots, and work with SVG vectors in both directions.",
      "A reliable order of operations is resize first, then convert or compress. A 4000 px photo shown at 800 px wastes bytes no quality setting can recover. Prefer WebP or AVIF for web delivery when your audience's browsers support them; keep JPEG for broad compatibility with photographs and PNG when you need sharp edges or transparency.",
      "Use Image Compressor to cut file size with minimal visible loss, Image Resizer for exact pixel targets, Image Converter for format changes, and Image Cropper when framing matters more than resolution. Colour Picker From Image helps sample brand colours directly from a screenshot or photo.",
      "The SVG family covers the vector side of everyday work. SVG to PNG/JPG/WebP rasterizes logos and icons at any scale for social, email and documents. Image to SVG Vectorizer traces PNG, JPG and WebP into clean scalable paths — best for high-contrast logos, icons and line art. SVG Viewer previews files with dimensions, viewBox and element counts, and SVG to Base64 encodes markup for CSS and API payloads.",
      "All processing is designed to stay on your device whenever the browser supports it — product shots, ID scans, private brand assets and unreleased design work should not need a remote server.",
    ],
    keywords: [
      "image tools",
      "image to base64",
      "base64 to image",
      "compress image",
      "resize image",
      "convert image",
      "svg to png",
      "png to svg",
      "svg converter",
    ],
  },
  developer: {
    title: "Developer Tools",
    description:
      "Format, validate, encode, decode, compare and transform JSON, text, URLs, tokens and other developer data.",
    longDescription: [
      "Everyday engineering is full of small transformations: pretty-print a payload, minify it for an API call, encode a query parameter, decode a JWT, generate a UUID, test a regular expression. This hub keeps those utilities in one private, browser-first place.",
      "The JSON cluster — Formatter, Validator, Minifier, and converters to YAML, CSV and TypeScript — is built for debugging real API traffic. Paste a broken payload, find the trailing comma or unescaped quote, fix it, then minify only when you need compact transport.",
      "Encoding tools (Base64, URL, hex) exist for transport safety, not secrecy — never treat Base64 as encryption. JWT Decoder and Hash Generator support security workflows with clear honesty about what each can and cannot prove.",
      "Everything runs client-side by default so tokens, keys and private configs never have to leave your machine.",
    ],
    keywords: ["developer tools", "json formatter", "base64", "jwt decoder", "uuid", "regex tester"],
  },
  text: {
    title: "Text Tools",
    description:
      "Count, clean, transform and format text for writing, content creation, development, marketing and everyday work.",
    longDescription: [
      "Writing for the web, apps and documents means hitting character limits, cleaning pasted drafts, and normalising messy input. This hub covers counting, case conversion, line cleanup, slug generation, placeholder text and reading-time estimates.",
      "Word Counter is the workhorse for essays, meta descriptions, tweets and ad copy — words, characters with and without spaces, sentences, paragraphs and reading time in one pass. Case Converter handles title, camel, snake and kebab styles when you are aligning identifiers or headlines.",
      "Duplicate Line Remover and Empty Line Remover clean logs and pasted drafts. Text Cleaner strips the invisible junk that breaks parsers. Lorem Ipsum Generator produces neutral placeholder copy when real content is not ready yet.",
      "Because everything runs in the browser, confidential drafts and unreleased product copy stay private.",
    ],
    keywords: ["text tools", "word counter", "character counter", "lorem ipsum", "case converter"],
  },
  security: {
    title: "Security Tools",
    description:
      "Use practical browser-based security utilities for passwords, hashes, encoding, decoding and developer security tasks.",
    longDescription: [
      "Security work is full of one-off tasks: generate a strong password, check how weak an old one is, hash a string for a checksum, mint a UUID for a session id, encode a value safely. This hub groups those utilities with privacy as the default.",
      "Password Generator creates high-entropy passwords in browser memory only. Password Strength Checker estimates entropy and flags dictionary words, keyboard runs and years — without ever transmitting the password you paste.",
      "Hash Generator computes MD5, SHA-1, SHA-256 and SHA-512 with Web Crypto, warning clearly that MD5 and SHA-1 are for legacy checksums only. UUID Generator and Random Token Generator provide identifiers and opaque secrets for tests and staging.",
      "Treat Base64 and hex tools as encoding, not encryption. Never store production secrets as 'protected' Base64 in client bundles — real protection is server-side hashing, short-lived tokens and TLS.",
    ],
    keywords: ["security tools", "password generator", "hash generator", "sha-256", "uuid generator"],
  },
  design: {
    title: "Design Tools",
    description: "Generate CSS gradients, shadows, border-radius and buttons with live copy-ready output.",
    longDescription: [
      "Front-end design often means writing the same CSS properties by hand: linear gradients, layered shadows, modern border-radius stacks and button chrome. This hub generates those snippets with visual previews so you can copy production-ready CSS instead of guessing values.",
      "CSS Gradient Generator covers linear, radial and conic gradients with multiple stops and angle control. Box Shadow Generator builds layered shadows with spread, blur and inset options. Border Radius Generator helps with the asymmetric corner style popular in modern UI kits.",
      "CSS Button Generator assembles padding, radius, gradient and hover states into a single copyable block — useful when you need a consistent primary action style without a full design system.",
      "Output is plain CSS you can paste into stylesheets or inline style blocks; no framework lock-in.",
    ],
    keywords: ["design tools", "css gradient", "box shadow", "border radius"],
  },
  color: {
    title: "Color Tools",
    description:
      "Pick colors, generate palettes, convert HEX, RGB and HSL, and check contrast ratios for accessible design.",
    longDescription: [
      "Colour decisions show up everywhere: brand palettes, UI states, charts and accessibility checks. This hub helps you pick, convert and validate colours without a design suite.",
      "Color Picker and Color Picker From Image sample exact values from a canvas or screenshot. Palette Generator builds complementary, analogous, triadic and custom harmonies when you need a cohesive set. Color Converter moves between HEX, RGB and HSL so you can match tokens across tools and libraries.",
      "Colour Contrast Checker is the accessibility workhorse: enter foreground and background colours to get the WCAG contrast ratio and whether text passes AA or AAA for normal and large sizes. Aim for at least 4.5:1 for body text and 3:1 for large text and UI components.",
      "Everything computes locally — brand palettes and client screenshots stay on your machine.",
    ],
    keywords: ["color tools", "color picker", "color palette", "hex to rgb", "contrast checker"],
  },
  qr: {
    title: "QR & Barcode Tools",
    description:
      "Build correctly-formatted QR payloads for URLs, WiFi, vCards and plain text. Scan-ready strings generated locally.",
    longDescription: [
      "A QR code is a visual encoding of a short text payload. The hard part is not drawing the squares — it is getting the payload format right so phones actually open the link, join the network or save the contact.",
      "URL QR Generator encodes a full https link with size and error-correction controls. WiFi QR Generator builds the WIFI:T:…;S:…;P:…;; string so guests can join by camera. vCard QR Generator packs name, phone, email and org into a contact code for events and business cards. Text QR Generator handles arbitrary short strings.",
      "Print tips that matter: keep payloads short, leave a quiet-zone margin, use dark modules on light background, and size codes at least 2 cm for close scanning. Higher error correction (Q or H) helps when the code will be small or partially covered by a logo.",
      "Generation runs entirely in your browser — WiFi passwords and private links are not sent to a third-party QR API.",
    ],
    keywords: ["qr generator", "wifi qr", "vcard qr", "url qr"],
  },
  calculator: {
    title: "Calculators & Converters",
    description:
      "Calculate percentages, BMI, age, dates and everyday values — plus unit, length, weight and temperature conversions — with easy online calculators.",
    longDescription: [
      "Everyday maths — tips, percentages, ages, dates, BMI, unit conversions — should not require a spreadsheet. This hub collects the general-purpose calculators you reach for at work, school and home.",
      "Percentage Calculator handles X% of Y, percentage change and reverse percentage questions. Unit Converter covers length, weight and temperature with the formula shown for every result. Age Calculator and Date Difference Calculator give calendar-aware answers rather than rough year estimates.",
      "Tip Calculator splits bills fairly; Average Calculator handles mean, median and mode for quick stats. All of them run in the browser with instant results and no signup.",
      "If you need finance-specific modelling (loans, compound interest, ROI), jump to the Finance hub; if you need health screening numbers, start with the BMI Calculator and read its limitations.",
    ],
    keywords: [
      "online calculators",
      "free calculators",
      "unit converter",
      "measurement converter",
      "metric imperial",
      "bmi calculator",
      "age calculator",
      "percentage calculator",
    ],
  },
  finance: {
    title: "Finance Tools",
    description:
      "Estimate loans, mortgage payments, compound interest, savings, investments, ROI and other common financial calculations.",
    longDescription: [
      "Financial planning maths is straightforward once you see the formulas — but errors are expensive. This hub groups loan amortisation, compound growth, ROI, discounts, tax and AdSense revenue estimation with transparent calculations.",
      "Loan Calculator applies the standard amortising formula so you can compare monthly payment, total payable and total interest across home, personal, car and business scenarios. Compound Interest Calculator projects savings growth with any compounding frequency and a year-by-year table. ROI Calculator reports return on investment as both percentage and absolute profit.",
      "Discount Calculator and Tax Calculator cover everyday shopping and invoicing maths. AdSense Earnings Calculator estimates publisher revenue from pageviews, CTR and CPC — with an explicit disclaimer that figures are estimates, not guarantees.",
      "All finance tools run locally. You can model scenarios involving real numbers without signing up or sharing account details with a server.",
    ],
    keywords: ["finance", "compound interest", "loan calculator", "roi", "vat", "mortgage calculator", "home loan", "interest"],
  },
  seo: {
    title: "SEO Tools",
    description:
      "Create and check common SEO resources and website metadata for better search visibility and technical website management.",
    longDescription: [
      "Search visibility depends on both content quality and technical hygiene: clean metadata, valid robots directives, sensible sitemaps and pages that render what crawlers expect. This hub covers the practical checks and generators for that work.",
      "SEO Checker scores a page's on-page signals from its HTML — title, headings, images and social tags. Open Graph Checker and Meta Tag Analyzer verify social preview tags. Sitemap Checker validates XML structure and lastmod coverage. Robots.txt Checker and Generator handle crawler directives. SERP Preview shows how a result might appear in search.",
      "Meta Tag Generator, UTM Builder, Keyword Density Checker and Slug Generator support the content side — consistent titles, trackable campaign URLs and clean URL slugs.",
      "Several checkers can fetch a public URL in your browser for convenience; they are labelled as requiring a network connection. Nothing is stored on a server.",
    ],
    keywords: ["seo tools", "slug generator", "meta tags", "robots.txt generator", "keyword density"],
  },
  validator: {
    title: "Validators",
    description: "Check and validate inputs with clear, explainable rules.",
    longDescription: [
      "Validation tools answer a single question cleanly: is this value structurally valid, and if not, why? They are useful in forms, data cleanup, API debugging and QA.",
      "Email Validator checks local-part and domain syntax without sending mail. URL Validator confirms scheme, host and path shape. JSON Validator reports the exact position of the first syntax error. Schema Validator checks JSON against a schema. Regex Tester shows live matches and groups for JavaScript regular expressions.",
      "None of these prove that a mailbox exists or a URL is safe — they check structure. Pair them with confirmation flows or live checks when existence matters.",
      "Validation runs in the browser so sample data and test credentials stay private.",
    ],
    keywords: ["validators", "input validation"],
  },
  formatter: {
    title: "Formatters",
    description: "Format numbers, dates, and text consistently across platforms.",
    longDescription: [
      "Formatting is where data becomes readable — and where inconsistent locale rules cause subtle bugs. This hub normalises numbers, dates and text so output looks the same across tools and platforms.",
      "Number Formatter handles decimal places, thousands separators and locale-aware display. Date Formatter converts between common layouts when you need a stable string for reports or filenames. Case Converter and related text tools keep identifiers and headlines consistent.",
      "When a value must round-trip (for example, machine-readable config), keep the canonical machine format in storage and format only at the presentation edge. Formatters here are for display and export, not for changing the underlying value.",
      "Everything runs locally in the browser.",
    ],
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
    longDescription: copy.longDescription,
    keywords: copy.keywords,
    path: getCategoryPath(category),
  };
}

export function getAllCategoryMetadata(): ReadonlyArray<CategoryMetadata> {
  return (Object.keys(CATEGORY_COPY) as Array<ToolCategory>).map(getCategoryMetadata);
}
