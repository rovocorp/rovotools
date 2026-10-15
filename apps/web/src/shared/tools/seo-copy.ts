import type { ToolDefinition } from "@/shared/types";

export interface ToolFaq {
  readonly question: string;
  readonly answer: string;
}

export interface ToolWorkflowStep {
  readonly label: string;
  readonly href: string;
}

export interface ToolWorkflow {
  readonly title: string;
  readonly steps: ReadonlyArray<ToolWorkflowStep>;
}

/**
 * Central per-tool SEO deck (see docs: SEO content upgrade).
 *
 * Hand-written copy lives here for priority tools. Every other tool falls
 * back to generated copy derived from its own registry spec, so each page
 * still gets unique intro/how-to text with no duplication and no fake claims.
 */
export interface ToolPageCopy {
  readonly title?: string;
  readonly description?: string;
  readonly intro: string;
  readonly benefits: ReadonlyArray<string>;
  readonly howTo: ReadonlyArray<string>;
  readonly faqs: ReadonlyArray<ToolFaq>;
  readonly related?: ReadonlyArray<string>;
  readonly workflow?: ToolWorkflow;
}

export interface ResolvedToolPageCopy {
  readonly title?: string;
  readonly description?: string;
  readonly intro: string;
  readonly benefits: ReadonlyArray<string>;
  readonly howTo: ReadonlyArray<string>;
  readonly faqs: ReadonlyArray<ToolFaq>;
  readonly related: ReadonlyArray<string>;
  readonly workflow?: ToolWorkflow;
  /** True only when a hand-written deck exists — used to suppress HowTo schema on template pages. */
  readonly hasCustomCopy: boolean;
}

const IMAGE_WORKFLOW: ToolWorkflow = {
  title: "Website image optimization",
  steps: [
    { label: "Resize the image", href: "/tools/image-resizer" },
    { label: "Compress the image", href: "/tools/image-compressor" },
    { label: "Convert to WebP", href: "/tools/image-converter" },
  ],
};

const JSON_WORKFLOW: ToolWorkflow = {
  title: "Clean up JSON for a project",
  steps: [
    { label: "Format JSON", href: "/tools/json-formatter" },
    { label: "Validate JSON", href: "/tools/json-validator" },
    { label: "Minify JSON", href: "/tools/json-minifier" },
  ],
};

const PDF_WORKFLOW: ToolWorkflow = {
  title: "Work with PDFs end to end",
  steps: [
    { label: "Create a PDF", href: "/tools/pdf/pdf-creator" },
    { label: "Merge PDFs", href: "/tools/pdf/merge-pdf" },
    { label: "Compress the result", href: "/tools/pdf/compress-pdf" },
  ],
};

const TOOL_PAGE_COPY: Record<string, ToolPageCopy> = {
  "adsense-earnings-calculator": {
    description:
      "Estimate AdSense revenue from pageviews using CTR and CPC, or RPM — in USD, EUR, GBP, INR and 8 more currencies with live rates.",
    intro:
      "Estimate ad revenue from pageviews using click-through rate and cost-per-click, or revenue per mille. Pick your currency from the dropdown, refresh live USD rates or enter a custom rate, and get monthly and daily estimates.",
    benefits: [
      "Two modes: CTR + CPC for traffic estimates, RPM for known rates",
      "12 currencies with a dropdown — no more USD-or-INR limit",
      "Live USD rates on tap, with a custom-rate override box",
      "Planning estimate computed on your device — figures stay private",
    ],
    howTo: [
      "Enter your monthly pageviews.",
      "Choose CTR + CPC mode (with your click rate and cost per click) or RPM mode (with revenue per 1000 views).",
      "Pick a currency from the dropdown and tap Refresh live rates — or type a custom USD rate.",
      "Press Execute to see estimated monthly and daily earnings.",
    ],
    faqs: [
      {
        question: "Where do the currency rates come from?",
        answer:
          "Tap Refresh live rates to fetch current USD rates (via open.er-api.com), or type your own rate. Without a refresh the tool uses built-in approximate rates — check the assumptions line to see which rate applied.",
      },
      {
        question: "Are these earnings guaranteed?",
        answer:
          "No. Real AdSense earnings move with country mix, season, niche and ad placement. Treat the result as planning maths, not a forecast.",
      },
      {
        question: "Is my traffic data uploaded?",
        answer: "No. The estimate is computed on your device; only a rate refresh contacts the rate service.",
      },
    ],
    related: ["roi-calculator", "compound-interest-calculator", "loan-calculator", "percentage-calculator"],
  },
  "image-compressor": {
    title: "Image Compressor — Compress Images Online",
    description:
      "Compress JPG, PNG and WebP images online to reduce file size while maintaining good visual quality. Fast, simple and easy to use.",
    intro:
      "Compress images online and reduce JPG, PNG or WebP file sizes for websites, email, social media and online uploads. Adjust the compression settings and compare the result before downloading.",
    benefits: [
      "Shrink images by quality (1–100) or to an exact target size in KB",
      "Batch mode handles up to 20 images at once",
      "Optional WebP output and 1920px width cap",
      "Everything runs on your device — images never leave your browser",
    ],
    howTo: [
      "Select or drop up to 20 JPG, PNG or WebP images.",
      "Choose quality mode or enter a target size in KB, with optional WebP output.",
      "Preview each result and compare the original and compressed file size.",
      "Download the optimized images.",
    ],
    faqs: [
      {
        question: "What does an image compressor do?",
        answer:
          "An image compressor reduces the amount of data required to store or transfer an image while aiming to preserve acceptable visual quality.",
      },
      {
        question: "Which image formats can I compress?",
        answer:
          "This tool accepts JPG, PNG and WebP images, and can additionally output WebP versions of your files.",
      },
      {
        question: "Does image compression reduce quality?",
        answer:
          "Lowering JPEG/WebP quality discards some visual detail to save space; higher values keep more detail. Start at the default quality of 72 and adjust while comparing the preview.",
      },
      {
        question: "Can I use the image compressor on mobile?",
        answer:
          "Yes. The page is responsive and compression runs in mobile browsers that support the Canvas API.",
      },
    ],
    related: ["image-resizer", "image-converter", "image-cropper", "favicon-generator"],
    workflow: IMAGE_WORKFLOW,
  },
  "image-resizer": {
    title: "Image Resizer — Resize Images Online",
    description:
      "Resize JPG, PNG and WebP images by exact pixels or percentage with the aspect ratio locked. Includes presets for YouTube, Instagram and Open Graph.",
    intro:
      "Resize photos by exact pixels or percentage with the aspect ratio locked. Use presets for YouTube thumbnails, Instagram posts and Open Graph images, then download the result.",
    benefits: [
      "Exact pixel dimensions or simple percentage scaling",
      "Aspect ratio stays locked so photos never stretch",
      "One-click presets for YouTube, Instagram and Open Graph",
      "Processed locally in your browser — nothing is uploaded",
    ],
    howTo: [
      "Select or drop a JPG, PNG or WebP image.",
      "Enter a width and height in pixels, a scale percent, or pick a preset.",
      "Choose the output format: same as input, WebP, JPEG or PNG.",
      "Download the resized image.",
    ],
    faqs: [
      {
        question: "Will resizing stretch my photo?",
        answer:
          "No. The aspect ratio stays locked, so the image scales proportionally and never stretches or squashes.",
      },
      {
        question: "Which formats can I resize and export?",
        answer:
          "You can upload JPG, PNG or WebP and export in the same format, WebP, JPEG or PNG.",
      },
    ],
    related: ["image-compressor", "image-converter", "image-cropper", "color-picker-from-image"],
    workflow: IMAGE_WORKFLOW,
  },
  "image-converter": {
    title: "Image Converter — Convert JPG, PNG & WebP",
    description:
      "Convert images between JPG, PNG and WebP online with quality control. Convert one file or up to twenty at a time, free.",
    intro:
      "Convert images between PNG, JPG and WebP with full quality control. Process one file or twenty at a time, entirely on your device.",
    benefits: [
      "Convert between JPG, PNG and WebP formats",
      "Quality slider (1–100) for JPEG and WebP output",
      "Batch conversion of up to 20 images",
      "Runs locally — your images are never uploaded",
    ],
    howTo: [
      "Select or drop up to 20 images.",
      "Pick the output format: WebP, JPEG or PNG.",
      "Adjust the quality for JPEG and WebP output if needed.",
      "Download the converted files.",
    ],
    faqs: [
      {
        question: "Which conversions are supported?",
        answer: "JPG, PNG and WebP in any combination — for example PNG to WebP or JPG to PNG.",
      },
      {
        question: "Does converting change image quality?",
        answer:
          "Converting to a lossless format like PNG preserves pixels exactly. JPEG and WebP use the quality setting you choose; the default of 85 keeps detail high while saving space.",
      },
    ],
    related: ["image-compressor", "image-resizer", "image-cropper", "favicon-generator"],
    workflow: IMAGE_WORKFLOW,
  },
  "merge-pdf": {
    title: "Merge PDF — Combine PDF Files Online",
    description:
      "Merge 2-20 PDF files into one document in your chosen order. Free, no signup — files never leave your device.",
    intro:
      "Combine multiple PDFs into a single document. Drop your files, arrange them in order, and download the merged PDF instantly.",
    benefits: [
      "Combine up to 20 PDFs preserving page order",
      "Reorder files before merging",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select 2-20 PDF files.",
      "Drag them into the order you want.",
      "Press Merge and download the combined PDF.",
    ],
    faqs: [
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Merging happens entirely in your browser with pdf-lib; your files never leave your device.",
      },
      {
        question: "Is there a file limit?",
        answer: "You can merge up to 20 PDFs at once, each up to 100 MB.",
      },
    ],
    related: ["split-pdf", "compress-pdf", "pdf-creator", "jpg-to-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "split-pdf": {
    title: "Split PDF — Extract Pages Online",
    description:
      "Split a PDF by extracting the pages you need, e.g. 1-3,5. Free, no signup — files never leave your device.",
    intro:
      "Extract specific pages from a PDF into a brand-new file. Enter ranges like 1-3,5 and download just those pages.",
    benefits: [
      "Extract any pages with 1-3,5 style ranges",
      "Original file stays untouched",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to split.",
      "Enter the pages to keep, e.g. 1-3,5.",
      "Press Split and download the new PDF.",
    ],
    faqs: [
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Splitting happens entirely in your browser; your files never leave your device.",
      },
      {
        question: "Can I extract non-contiguous pages?",
        answer: "Yes. List singles and ranges separated by commas, for example 1,4-6,9.",
      },
    ],
    related: ["merge-pdf", "compress-pdf", "pdf-to-jpg", "pdf-creator"],
    workflow: PDF_WORKFLOW,
  },
  "compress-pdf": {
    title: "Compress PDF — Reduce PDF Size Online",
    description:
      "Shrink a PDF with lossless re-save plus optional image downscaling. Free, no signup — files never leave your device.",
    intro:
      "Reduce your PDF's file size for email and uploads. Pick a strength, compare before/after, and download the smaller file.",
    benefits: [
      "Lossless re-save plus light, balanced or strong image downscaling",
      "See exact bytes saved before downloading",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to compress.",
      "Choose a strength: light, balanced or strong.",
      "Press Compress and download the smaller PDF.",
    ],
    faqs: [
      {
        question: "Will compression hurt quality?",
        answer:
          "Light and balanced modes are visually lossless for most documents. Strong mode downscales large images — compare the preview before downloading.",
      },
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Compression happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["merge-pdf", "split-pdf", "jpg-to-pdf", "pdf-creator"],
    workflow: PDF_WORKFLOW,
  },
  "jpg-to-pdf": {
    title: "JPG to PDF — Convert Images to PDF Online",
    description:
      "Turn JPG, PNG or WebP photos into a PDF, one page per image. Free, no signup — files never leave your device.",
    intro:
      "Convert photos into a shareable PDF document. Choose portrait, landscape or exact-fit pages and download instantly.",
    benefits: [
      "One page per image, up to 20 images",
      "Portrait, landscape or exact-fit pages",
      "Photos embedded losslessly — no recompression",
    ],
    howTo: [
      "Select up to 20 JPG or PNG images.",
      "Pick portrait, landscape or fit pages.",
      "Press Convert and download the PDF.",
    ],
    faqs: [
      {
        question: "Does converting reduce image quality?",
        answer: "No. Photos are embedded without recompression; the PDF keeps the original pixels.",
      },
      {
        question: "Are my photos uploaded anywhere?",
        answer: "No. Conversion happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["pdf-to-jpg", "pdf-creator", "compress-pdf", "merge-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "pdf-to-jpg": {
    title: "PDF to JPG — Convert PDF Pages to Images Online",
    description:
      "Render PDF pages as JPG images at 1x-3x scale. Free, no signup — files never leave your device.",
    intro:
      "Turn PDF pages into shareable images. Pick the pages and render scale, then download each page as a JPG.",
    benefits: [
      "Render any pages with 1-3,5 style selection",
      "1x-3x scale for crisp images",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to convert.",
      "Choose pages (default: all) and a render scale.",
      "Press Convert and download the JPGs.",
    ],
    faqs: [
      {
        question: "Which scale should I use?",
        answer: "2x suits screens and slides; 3x is best for print. Higher scales make larger files.",
      },
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Rendering happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["jpg-to-pdf", "split-pdf", "compress-pdf", "pdf-creator"],
    workflow: PDF_WORKFLOW,
  },
  "word-to-pdf": {
    title: "Word to PDF — Convert DOCX Online",
    description:
      "Convert a .docx document into a clean PDF in your browser. Free, no signup — files never leave your device.",
    intro:
      "Turn a Word document into a PDF that prints the same everywhere. Text and structure are preserved; complex formatting may simplify.",
    benefits: [
      "Clean multi-page PDF from any .docx",
      "Headings and lists preserved",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select a .docx file.",
      "Press Convert and preview the result.",
      "Download the PDF.",
    ],
    faqs: [
      {
        question: "Will my formatting survive?",
        answer:
          "Text, headings and lists carry over cleanly. Pixel-perfect layout (floating images, intricate tables) may simplify — this is a private on-device conversion, not a desktop Word export.",
      },
      {
        question: "Are my documents uploaded anywhere?",
        answer: "No. Conversion happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["pdf-to-word", "pdf-creator", "merge-pdf", "compress-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "pdf-creator": {
    title: "PDF Creator — Make a PDF Online Free",
    description:
      "Create a multi-page PDF from text with a title. Free, no signup — everything runs on your device.",
    intro:
      "Write or paste text, add a title, and generate a clean multi-page A4 PDF you can download instantly.",
    benefits: [
      "Multi-page A4 PDF with automatic wrapping",
      "Optional document title",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Paste or type your text.",
      "Add a title (optional).",
      "Press Execute and download the PDF.",
    ],
    faqs: [
      {
        question: "How many pages can it make?",
        answer: "As many as your text needs — pages are added automatically with comfortable margins.",
      },
      {
        question: "Is my text uploaded anywhere?",
        answer: "No. The PDF is generated locally from the text you enter.",
      },
    ],
    related: ["word-to-pdf", "jpg-to-pdf", "merge-pdf", "compress-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "sign-pdf": {
    title: "Sign PDF — E-Sign Documents Online",
    description:
      "Draw or type your signature and stamp it onto any PDF page. Free, no signup — files never leave your device.",
    intro:
      "Sign a PDF without printing. Draw with your mouse or finger, place the signature where you want it, and download the signed file.",
    benefits: [
      "Draw, type or upload a signature",
      "Place and size it on any page",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to sign.",
      "Draw or type your signature.",
      "Drag it into position, pick the page, and download.",
    ],
    faqs: [
      {
        question: "Is this a legal signature?",
        answer:
          "It places a visible signature image for everyday agreements. For regulated or high-value contracts, use a qualified e-signature provider.",
      },
      {
        question: "Are my documents uploaded anywhere?",
        answer: "No. Signing happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["merge-pdf", "compress-pdf", "pdf-creator", "split-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "pdf-to-word": {
    title: "PDF to Word — Convert PDF to DOCX Online",
    description:
      "Extract a PDF's text into an editable .docx document. Free, no signup — files never leave your device.",
    intro:
      "Turn a PDF back into editable text. Extract per-page text into a .docx you can open in Word or Google Docs.",
    benefits: [
      "Editable .docx with per-page sections",
      "Works on text-based PDFs",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to convert.",
      "Press Convert to extract the text.",
      "Download the .docx and edit freely.",
    ],
    faqs: [
      {
        question: "Will layout be preserved?",
        answer:
          "Text content carries over; original layout does not. Scanned image-only PDFs need OCR first and will extract no text.",
      },
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Extraction happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["word-to-pdf", "pdf-to-excel", "pdf-creator", "split-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "pdf-to-excel": {
    title: "PDF to Excel — Convert PDF to XLSX Online",
    description:
      "Extract a PDF's text rows into an editable .xlsx spreadsheet. Free, no signup — files never leave your device.",
    intro:
      "Pull text lines out of a PDF into spreadsheet rows — one row per line, page breaks marked — ready for Excel or Sheets.",
    benefits: [
      "One spreadsheet row per text line",
      "Page breaks marked for reference",
      "No signup, no watermark, no upload",
    ],
    howTo: [
      "Select the PDF to convert.",
      "Press Convert to extract rows.",
      "Download the .xlsx and analyse freely.",
    ],
    faqs: [
      {
        question: "Does it detect tables?",
        answer:
          "No — lines become rows in reading order. True table detection needs server-side layout analysis; tidy columns in a spreadsheet afterwards.",
      },
      {
        question: "Are my PDFs uploaded anywhere?",
        answer: "No. Extraction happens entirely in your browser; your files never leave your device.",
      },
    ],
    related: ["pdf-to-word", "word-to-pdf", "split-pdf", "compress-pdf"],
    workflow: PDF_WORKFLOW,
  },
  "json-formatter": {
    title: "JSON Formatter — Format & Beautify JSON Online",
    description:
      "Format, beautify and validate JSON online with clear error messages. Paste JSON, choose indentation and copy the readable result.",
    intro:
      "Pretty-print and validate JSON with clear error messages. Paste raw JSON, choose an indent width and copy the formatted result for development and debugging.",
    benefits: [
      "Readable pretty-printed output with 0–8 space indentation",
      "Precise parse error messages that point at the problem",
      "Validation result included with every format",
      "Runs entirely in your browser — data stays private",
    ],
    howTo: [
      "Paste your JSON into the input box.",
      "Set the indent width (default 2 spaces, 0–8 supported).",
      "Press Execute to format and validate.",
      "Copy the formatted JSON or fix the reported error and retry.",
    ],
    faqs: [
      {
        question: "What does a JSON formatter do?",
        answer:
          "It parses raw JSON and reprints it with consistent indentation and line breaks so the structure is easy to read and debug.",
      },
      {
        question: "What happens if my JSON is invalid?",
        answer:
          "The tool reports the parse error message instead of formatted output, so you can locate and fix the problem.",
      },
    ],
    related: ["json-validator", "json-minifier", "json-to-yaml", "json-to-csv"],
    workflow: JSON_WORKFLOW,
  },
  "json-validator": {
    title: "JSON Validator — Check JSON Online",
    description:
      "Check whether text is valid JSON online and see the parsed root type. Instant validation with helpful detail, free.",
    intro:
      "Check whether text is valid JSON and see the parsed root type. Paste any JSON document to get an instant valid-or-invalid verdict with detail.",
    benefits: [
      "Instant valid/invalid verdict with the parsed root type",
      "Helpful error detail when parsing fails",
      "Private by design — validation runs on your device",
    ],
    howTo: [
      "Paste the JSON text into the input box.",
      "Press Execute to validate it.",
      "Read the verdict, root type and detail message.",
    ],
    faqs: [
      {
        question: "How do I know if my JSON is valid?",
        answer:
          "Paste it into the validator. A valid document returns true with its root type (object, array, string and so on); an invalid one returns false with the parse error detail.",
      },
    ],
    related: ["json-formatter", "json-minifier", "yaml-to-json", "csv-to-json"],
    workflow: JSON_WORKFLOW,
  },
  "base64-encoder": {
    title: "Base64 Encoder — Encode Text Online",
    description:
      "Encode any text into Base64 online. Paste text, get the encoded output with its length, instantly and privately.",
    intro:
      "Encode any text into Base64. Paste your text and get the encoded output with its character length — everything happens in your browser.",
    benefits: [
      "Standard Base64 encoding of any UTF-8 text",
      "Output length shown for payload planning",
      "No uploads, no logs, no storage",
    ],
    howTo: ["Enter the text to encode.", "Press Execute.", "Copy the Base64 output."],
    faqs: [
      {
        question: "What is Base64 used for?",
        answer:
          "Base64 represents binary or special text as plain ASCII characters, commonly used in data URLs, API payloads, email attachments and configuration values.",
      },
      {
        question: "Is Base64 encryption?",
        answer:
          "No. Base64 is an encoding, not encryption — anyone can decode it. Never use it to protect secrets or passwords.",
      },
    ],
    related: ["base64-decoder", "url-encoder", "hex-encoder", "jwt-decoder"],
  },
  "jwt-decoder": {
    title: "JWT Decoder — Decode JSON Web Tokens Online",
    description:
      "Decode a JSON Web Token locally to inspect its header and payload. Decoding does not verify the signature — free and private.",
    intro:
      "Decode a JSON Web Token locally to inspect its header and payload. Decoding does not verify the token's signature or prove that the token is authentic.",
    benefits: [
      "Header and payload shown as readable JSON",
      "Format check requires three dot-separated parts",
      "Decoded on your device — tokens are never sent anywhere",
    ],
    howTo: [
      "Paste the JWT (header.payload.signature) into the input box.",
      "Press Execute to decode the header and payload.",
      "Inspect the claims. Remember the signature is not verified.",
    ],
    faqs: [
      {
        question: "Does decoding verify the token?",
        answer:
          "No. Decoding only reveals the header and payload. Verifying authenticity requires checking the signature against the issuer's secret or public key, which this tool does not do.",
      },
      {
        question: "Is it safe to paste tokens here?",
        answer:
          "Decoding runs locally in your browser and nothing is transmitted. Even so, avoid pasting production secrets or long-lived tokens into any website.",
      },
    ],
    related: ["base64-decoder", "json-formatter", "json-validator", "hash-generator"],
  },
  "password-generator": {
    title: "Password Generator — Create Strong Passwords",
    description:
      "Create strong random passwords online with custom length and character sets. Generated locally with an entropy readout — nothing stored.",
    intro:
      "Create strong random passwords locally. Choose a length from 4 to 128 characters and toggle uppercase, digits and symbols — nothing is stored or sent anywhere.",
    benefits: [
      "Lengths from 4 to 128 characters (default 16)",
      "Toggle uppercase letters, digits and symbols",
      "Entropy readout in bits for every password",
      "Generated on your device — never transmitted or logged",
    ],
    howTo: [
      "Set the password length and character sets.",
      "Press Execute to generate a password.",
      "Copy it into your password manager. Generate a fresh one per account.",
    ],
    faqs: [
      {
        question: "Are generated passwords stored anywhere?",
        answer:
          "No. Passwords are generated in your browser's memory and are never sent to a server, logged or stored.",
      },
      {
        question: "What makes a password strong?",
        answer:
          "Length plus unpredictability. Use at least 16 random characters from all four character sets, never reuse passwords across sites, and store them in a password manager.",
      },
      {
        question: "Should I use this for my bank or email?",
        answer:
          "Random generated passwords are suitable anywhere, but always enable two-factor authentication on important accounts and never share passwords.",
      },
    ],
    related: ["password-strength-checker", "random-token-generator", "uuid-generator", "hash-generator"],
  },
  "bmi-calculator": {
    title: "BMI Calculator — Calculate Body Mass Index",
    description:
      "Calculate BMI from height and weight using the standard body mass index formula. Get a quick BMI result and understand the calculation.",
    intro:
      "Calculate Body Mass Index using height and weight. Enter your measurements to calculate BMI and see the result based on the standard BMI formula.",
    benefits: [
      "Standard formula: BMI = weight ÷ height²",
      "Accepts weight in kilograms and height in centimetres",
      "Instant result with its weight category",
      "Computed on your device — measurements stay private",
    ],
    howTo: [
      "Enter your weight in kilograms.",
      "Enter your height in centimetres.",
      "Press Execute to calculate your BMI and see its category.",
    ],
    faqs: [
      {
        question: "How is BMI calculated?",
        answer:
          "BMI divides weight in kilograms by height in metres squared. For example, 70 kg at 1.75 m gives 70 ÷ (1.75 × 1.75) ≈ 22.9.",
      },
      {
        question: "What do the BMI categories mean?",
        answer:
          "Common adult bands are under 18.5 underweight, 18.5–24.9 healthy range, 25–29.9 overweight, and 30 or above obesity. They are population screening bands, not personal diagnoses.",
      },
      {
        question: "Is BMI a diagnosis?",
        answer:
          "No. BMI is a screening measure and does not directly measure body fat or provide a medical diagnosis. Discuss health concerns with a clinician.",
      },
    ],
    related: ["age-calculator", "percentage-calculator", "unit-converter"],
  },
  "loan-calculator": {
    title: "Loan Calculator — Monthly Payment & Interest",
    description:
      "Free loan calculator. Estimate the monthly payment, total payable and total interest from the loan amount, annual rate and term.",
    intro:
      "Estimate monthly loan payments, total payable and total interest. Pick a loan type (home, personal, car, education, business), enter the loan amount, annual interest rate and term in years, then calculate.",
    benefits: [
      "Standard amortising-loan formula with full transparency",
      "Monthly payment, total payable and total interest over the term",
      "Loan-type presets (home, personal, car, education, business) plus currency choice",
      "Compare scenarios privately — no signup, no data sharing",
    ],
    howTo: [
      "Pick a loan type and currency (optional — defaults are General and USD).",
      "Enter the loan amount (principal).",
      "Enter the annual interest rate as a percent.",
      "Enter the term in years, then press Execute.",
      "Compare the monthly payment, total payable and total interest across scenarios.",
    ],
    faqs: [
      {
        question: "How are monthly payments calculated?",
        answer:
          "With the standard amortising-loan formula M = P × r(1+r)^n / ((1+r)^n − 1), where P is the principal, r the monthly rate and n the number of payments.",
      },
      {
        question: "What was EMI?",
        answer:
          "EMI (equated monthly instalment) is the term commonly used in some markets, such as India, for the same fixed monthly loan payment this calculator computes. This page replaces the old EMI Calculator and Loan Payment Calculator.",
      },
      {
        question: "Do loan-type presets change the maths?",
        answer:
          "No. The preset only labels the scenario (home, personal, car, education, business). The monthly payment always follows the same amortising-loan formula from your amount, rate and term.",
      },
    ],
    related: ["compound-interest-calculator", "discount-calculator", "percentage-calculator", "tip-calculator"],
  },
  "utm-builder": {
    title: "UTM URL Builder — Campaign Tracking Links",
    description:
      "Build UTM-tagged campaign URLs for Google Analytics. Add source, medium and campaign — get a clean tracked link.",
    intro:
      "Tag any link with UTM parameters so Analytics shows exactly which newsletter, ad or post drove each visit.",
    benefits: [
      "Correctly encoded source, medium, campaign, term and content",
      "Keeps existing query strings and page anchors intact",
      "Runs locally — campaign names never leave your device",
    ],
    howTo: [
      "Paste the destination page URL.",
      "Fill in source, medium and campaign (term and content optional).",
      "Copy the tagged URL into your newsletter, ad or post.",
    ],
    faqs: [
      {
        question: "Which UTM parameters do I actually need?",
        answer:
          "Source, medium and campaign — they answer where, how and which campaign. Term and content are optional refinements for paid keywords and A/B variants.",
      },
      {
        question: "Will it break my existing query string?",
        answer:
          "No. Existing parameters are preserved and the UTM tags are appended with correct separators.",
      },
    ],
    related: ["url-validator", "meta-tag-generator", "keyword-density-checker"],
  },
  "serp-preview": {
    title: "SERP Snippet Preview — Google Result Preview",
    description:
      "Preview your Google search snippet before publishing. Check title and description length against truncation limits.",
    intro:
      "See your title, URL and description the way Google shows them — and catch truncation before it costs you clicks.",
    benefits: [
      "Title check against the ~60-character truncation limit",
      "Description check against the ~160-character limit",
      "Instant rendered preview to copy into your CMS",
    ],
    howTo: [
      "Enter the page title, URL and meta description.",
      "Press Execute to see the checks and preview.",
      "Trim anything flagged too long, then publish.",
    ],
    faqs: [
      {
        question: "Why 60 and 160 characters?",
        answer:
          "Google truncates by pixel width, not characters, but ~60 for titles and ~160 for descriptions are the practical limits most snippets stay inside.",
      },
      {
        question: "Does Google always use my description?",
        answer:
          "No — Google rewrites it when the query matches page content better. A good description still wins the click when it is shown.",
      },
    ],
    related: ["meta-tag-generator", "slug-generator", "keyword-density-checker"],
  },
  "schema-validator": {
    title: "Schema Markup Validator — JSON-LD Checker",
    description:
      "Validate JSON-LD structured data. Confirm @context and @type, list declared schema types, catch syntax errors.",
    intro:
      "Paste JSON-LD structured data and confirm it parses, declares a context and names real schema types — before Google sees it.",
    benefits: [
      "Syntax check with pinpointed JSON errors",
      "Lists every declared @type, including @graph blocks",
      "Flags missing @context and untyped objects",
    ],
    howTo: [
      "Paste the JSON-LD block from your page.",
      "Press Execute to validate it.",
      "Fix anything flagged, then re-test in Google's Rich Results Test.",
    ],
    faqs: [
      {
        question: "Does valid markup guarantee rich results?",
        answer:
          "No — validity is the entry ticket. Google decides eligibility per page, type and policy compliance.",
      },
      {
        question: "Can I validate multiple blocks at once?",
        answer:
          "Yes. Paste an array of blocks or a full @graph document — every node is checked.",
      },
    ],
    related: ["json-validator", "meta-tag-generator", "code-minifier"],
  },
  "meta-tag-analyzer": {
    title: "Meta Tag Analyzer — Audit Page Tags",
    description:
      "Audit any page's title, meta description, canonical and social tags from its HTML. Find what's missing or too long.",
    intro:
      "Paste page source and get a complete inventory of its head tags — title, description, canonical, robots and every Open Graph and Twitter tag — with issues flagged.",
    benefits: [
      "Full inventory of title, description, canonical and robots tags",
      "Open Graph and Twitter tag extraction",
      "Missing and over-length tags flagged automatically",
    ],
    howTo: [
      "Open the page, view source and copy the HTML (the <head> is enough).",
      "Paste it and press Analyze — or fetch a live URL in your browser.",
      "Work through the flagged issues top to bottom.",
    ],
    faqs: [
      {
        question: "Do I need the whole page source?",
        answer:
          "No — everything this tool reads lives in the <head>. Paste from <head> to </head> for the fastest analysis.",
      },
      {
        question: "How is this different from the Meta Tag Generator?",
        answer:
          "The generator writes new tags; the analyzer reads existing ones. Use them as a pair: generate, publish, then analyze to verify.",
      },
    ],
    related: ["meta-tag-generator", "open-graph-checker", "seo-checker"],
  },
  "robots-txt-checker": {
    title: "Robots.txt Checker — Validate Crawler Rules",
    description:
      "Validate robots.txt files. Catch site-wide blocks, malformed lines and missing sitemap references before crawlers do.",
    intro:
      "Paste a robots.txt and get its groups, rules and sitemap lines parsed — with dangerous blocks and syntax slips called out.",
    benefits: [
      "Parses User-agent groups, Allow/Disallow and Sitemap lines",
      "Flags site-wide Disallow: / blocks",
      "Catches malformed lines and unknown directives",
    ],
    howTo: [
      "Paste the full robots.txt contents.",
      "Press Execute to parse and check it.",
      "Fix flagged rules, then pair with the generator to rebuild cleanly.",
    ],
    faqs: [
      {
        question: "How is this different from the Robots.txt Generator?",
        answer:
          "The generator builds a new file from presets; the checker audits an existing one. Verify what you publish with the checker.",
      },
      {
        question: "Does Allow override Disallow?",
        answer:
          "For Google, the most specific matching rule wins regardless of order. When in doubt, test the exact URL pattern.",
      },
    ],
    related: ["robots-txt-generator", "sitemap-checker", "seo-checker"],
  },
  "seo-checker": {
    title: "Website SEO Checker — On-Page Audit",
    description:
      "Score any page's on-page SEO from its HTML: title, description, headings, images and social tags in one audit.",
    intro:
      "Paste page source — or fetch a live URL — and get a 0–100 on-page score with every issue explained in plain language.",
    benefits: [
      "Single 0–100 score across six on-page checks",
      "Heading structure and missing-alt image audit",
      "Open Graph completeness included",
    ],
    howTo: [
      "Paste the page HTML or fetch the live URL above.",
      "Press Audit page.",
      "Fix the listed issues in order — title and headings first.",
    ],
    faqs: [
      {
        question: "What does the score actually measure?",
        answer:
          "Six on-page basics: title, description, one H1, image alt text, canonical and Open Graph completeness. It is a hygiene score, not a ranking prediction.",
      },
      {
        question: "My page fetches but scores 0 — why?",
        answer:
          "JavaScript-rendered pages return an empty shell to simple fetchers. Paste the rendered source (view-source after load) instead.",
      },
    ],
    related: ["meta-tag-analyzer", "open-graph-checker", "keyword-density-checker"],
  },
  "open-graph-checker": {
    title: "Open Graph Checker — Social Preview Tags",
    description:
      "Verify og:title, og:description, og:image and Twitter card tags so links unfurl correctly on social platforms.",
    intro:
      "Paste page source — or fetch a live URL — and confirm the exact tags Facebook, X, LinkedIn and messengers use for link previews.",
    benefits: [
      "Checks the core trio: title, description, image",
      "Reads og:url, og:type and twitter:card too",
      "Tells you exactly which tag is missing",
    ],
    howTo: [
      "Paste the page HTML or fetch the live URL above.",
      "Press Check tags.",
      "Add any missing tags, then re-scrape in each platform's debugger.",
    ],
    faqs: [
      {
        question: "I fixed my tags but the preview is stale — why?",
        answer:
          "Platforms cache previews aggressively. Re-scrape the URL in the Facebook Sharing Debugger or X Card Validator to refresh.",
      },
      {
        question: "What image size works best?",
        answer:
          "1200×630 is the safe universal choice — it fills large cards on Facebook and LinkedIn without cropping surprises.",
      },
    ],
    related: ["meta-tag-generator", "meta-tag-analyzer", "seo-checker"],
  },
  "sitemap-checker": {
    title: "XML Sitemap Checker — Validate Sitemaps",
    description:
      "Validate XML sitemaps: urlset vs index format, URL counts, lastmod coverage and the 50,000-URL protocol limit.",
    intro:
      "Paste sitemap XML — or fetch a live sitemap URL — and confirm crawlers can actually read what you published.",
    benefits: [
      "Detects urlset vs sitemapindex (and mixed-up files)",
      "Counts URLs and flags the 50,000-URL limit",
      "Measures <lastmod> coverage across entries",
    ],
    howTo: [
      "Paste the sitemap XML or fetch its URL above.",
      "Press Check sitemap.",
      "Split oversized files and backfill missing lastmod dates.",
    ],
    faqs: [
      {
        question: "How big can a sitemap be?",
        answer:
          "50,000 URLs or 50 MB uncompressed per file. Larger sites use a sitemap index pointing at multiple files.",
      },
      {
        question: "Do I need lastmod on every URL?",
        answer:
          "Not required, but accurate dates help crawlers prioritize recrawls of changed pages.",
      },
    ],
    related: ["robots-txt-checker", "robots-txt-generator", "seo-checker"],
  },
  "tag-detector": {
    title: "Analytics Tag Detector — Find Trackers",
    description:
      "Detect Google Analytics, Tag Manager, Meta Pixel, TikTok and LinkedIn tags in any page's HTML.",
    intro:
      "Paste page source — or fetch a live URL — and see exactly which analytics and marketing tags fire on the page, with IDs where visible.",
    benefits: [
      "Finds GA4, GTM, Meta Pixel, TikTok and LinkedIn tags",
      "Shows measurement IDs straight from the markup",
      "Spots bonus tools like Hotjar, Clarity and Segment",
    ],
    howTo: [
      "Paste the page HTML or fetch the live URL above.",
      "Press Detect tags.",
      "Compare against your tag plan — anything unexpected is worth investigating.",
    ],
    faqs: [
      {
        question: "Can it see tags loaded by Tag Manager?",
        answer:
          "Only the GTM container itself is visible in static HTML — tags fired inside GTM need the Tag Assistant or network inspection.",
      },
      {
        question: "Why do IDs matter?",
        answer:
          "An unfamiliar measurement ID means data flows somewhere you didn't authorize — often leftover agency or theme code.",
      },
    ],
    related: ["seo-checker", "meta-tag-analyzer", "performance-analyzer"],
  },
  "performance-analyzer": {
    title: "Website Performance Analyzer — Page Weight Hints",
    description:
      "Estimate page-weight performance from HTML: markup size, scripts, stylesheets and image dimensions with fix hints.",
    intro:
      "Paste page source — or fetch a live URL — and get honest static hints about what slows the page down, with concrete fixes.",
    benefits: [
      "HTML weight, script and stylesheet counts",
      "Images missing width/height (layout-shift culprits)",
      "Plain-language fix for every flag",
    ],
    howTo: [
      "Paste the page HTML or fetch the live URL above.",
      "Press Analyze weight.",
      "Fix the flagged items, then confirm with PageSpeed Insights for real timings.",
    ],
    faqs: [
      {
        question: "Is this a speed score?",
        answer:
          "No — these are static HTML hints, not measured timings. They point at likely problems; PageSpeed Insights gives you lab and field data.",
      },
      {
        question: "Why do image dimensions matter?",
        answer:
          "Without width and height the browser can't reserve space, so content jumps as images load — that is Cumulative Layout Shift.",
      },
    ],
    related: ["seo-checker", "tag-detector", "image-compressor"],
  },
  "tax-calculator": {
    title: "Tax Calculator (GST / VAT) — Sales Tax Online",
    description:
      "Add or remove sales tax worldwide: US states, Canadian provinces, EU/UK VAT and GST — or stack your own custom tax rows.",
    intro:
      "Pick a country or state for its standard rate (editable), or stack extra city and county levies with + — works even when your country isn't listed.",
    benefits: [
      "45 regions across Asia, Europe, the Americas, Africa and Oceania",
      "Stack extra state, county or city taxes additively",
      "CGST/SGST split for India, custom-rate escape hatch for the rest",
    ],
    howTo: [
      "Enter the amount and pick a country — or leave it blank and type a custom rate.",
      "Press + to stack extra taxes like City = 1.5.",
      "Press Calculate tax and copy the breakdown.",
    ],
    faqs: [
      {
        question: "Can I stack state + city tax?",
        answer:
          "Yes. Add one row per levy with + and they sum additively on the net amount — the standard US approach. Quebec's QST-on-GST compounding is the known exception.",
      },
      {
        question: "How current are the standard rates?",
        answer:
          "The bundled table is reviewed periodically (see the date on the tool page) and every rate stays editable, so a stale table never blocks you.",
      },
    ],
    related: ["loan-calculator", "compound-interest-calculator", "percentage-calculator"],
  },
  "color-picker": {
    title: "Color Picker — HEX, RGB & HSL Codes",
    description:
      "Pick any color and get its HEX, RGB and HSL codes instantly, plus tints, shades and its complementary color.",
    intro:
      "Choose a color visually or paste a HEX or RGB value — get every code format designers and developers need, with click-to-copy swatches.",
    benefits: [
      "HEX, RGB and HSL codes for any picked color",
      "Ready-made tints, shades and complementary color",
      "Click any swatch to copy its code",
    ],
    howTo: [
      "Pick a color with the visual swatch or type a HEX/RGB value.",
      "Press Pick color.",
      "Click any code chip to copy it into your design or stylesheet.",
    ],
    faqs: [
      {
        question: "What formats can I paste?",
        answer:
          "Six-digit and three-digit HEX with or without the hash (like #4f46e5 or fff), plus rgb() and rgba() strings.",
      },
      {
        question: "How are tints and shades made?",
        answer:
          "Tints mix the color toward white and shades toward black in even steps — the standard way to build a tonal scale from one brand color.",
      },
    ],
    related: ["color-converter", "palette-generator", "color-picker-from-image"],
  },
  "palette-generator": {
    title: "Color Palette Generator — Harmonious Schemes",
    description:
      "Generate harmonious color palettes: complementary, analogous, triadic or random — with copy-ready CSS variables.",
    intro:
      "Start from a brand color (or nothing at all) and generate a balanced palette on classic color-wheel harmonies.",
    benefits: [
      "Complementary, analogous, triadic and split harmonies",
      "Random mode for instant inspiration",
      "Exports HEX list plus :root CSS variables",
    ],
    howTo: [
      "Enter a base HEX color — or leave empty for a random start.",
      "Choose a harmony and press Generate palette.",
      "Copy the HEX codes or the CSS variables block.",
    ],
    faqs: [
      {
        question: "Which harmony should I choose?",
        answer:
          "Analogous feels calm (neighbors on the wheel), complementary has punch (opposites), triadic is balanced but lively. When in doubt, start analogous.",
      },
      {
        question: "Can I use the palette commercially?",
        answer:
          "Yes — colors themselves aren't copyrightable, and everything is generated locally from your input.",
      },
    ],
    related: ["color-picker", "color-converter", "css-gradient-generator"],
  },
  "word-unscrambler": {
    title: "Word Unscrambler — Unscramble Letters Into Words",
    description:
      "Free word unscrambler: enter scrambled letters and find every valid word with Scrabble and Words With Friends scores. No signup, runs on your device.",
    intro:
      "Type your tiles and instantly see every dictionary word they can build — longest first, each with its Scrabble and Words With Friends point value. Use ? for a blank tile, filter by length, and toggle exact mode for jumble-style puzzles where every letter must be used.",
    benefits: [
      "Subset and exact-anagram modes for Scrabble, Words With Friends, jumbles and crosswords",
      "Blank-tile (?) support for real rack situations",
      "Scrabble and Words With Friends scores on every result",
      "Runs entirely on your device — letters are never sent anywhere",
    ],
    howTo: [
      "Enter 2–15 scrambled letters (add ? for each blank tile).",
      "Keep All mode for every playable word, or switch to Exact for full-rack anagrams.",
      "Set a minimum length and press Unscramble.",
      "Pick your play from the longest, highest-scoring matches.",
    ],
    faqs: [
      {
        question: "How does the word unscrambler work?",
        answer:
          "It compares your tiles against a built-in ENABLE-derived word list using letter-frequency matching, so two S tiles can build a word with two S letters but never three. Results are grouped longest-first with Scrabble and Words With Friends scores.",
      },
      {
        question: "Can I use blank tiles?",
        answer:
          "Yes — type ? or * for each blank (up to two). A blank matches any letter, which mirrors how wildcards work in Scrabble and Words With Friends.",
      },
      {
        question: "Is this an official Scrabble dictionary?",
        answer:
          "No. Results come from a public-domain ENABLE-derived list that closely matches casual play, but it is not the official TWL/NWL, SOWPODS/CSW or Words With Friends word list. Confirm rare plays against your tournament list.",
      },
      {
        question: "What is the difference between All and Exact mode?",
        answer:
          "All mode returns every word your tiles can build, including shorter ones — usually what you want mid-game. Exact mode only returns words using every tile, ideal for jumbles and bingo hunts.",
      },
      {
        question: "Is my input private?",
        answer:
          "Yes. Solving runs locally in your browser; your letters are never uploaded, logged or stored.",
      },
    ],
    related: ["random-word-generator", "word-counter", "readability-checker", "case-converter"],
    workflow: {
      title: "Sharpen your word game",
      steps: [
        { label: "Draw practice letters", href: "/tools/random-word-generator" },
        { label: "Unscramble them", href: "/tools/word-unscrambler" },
        { label: "Count your words", href: "/tools/word-counter" },
      ],
    },
  },
  "readability-checker": {
    title: "Readability Checker — Flesch Score & Grade Level",
    description:
      "Free readability checker: paste text to get Flesch Reading Ease, grade level, word and sentence counts. Private and instant.",
    intro:
      "Paste any draft and get an instant readability verdict: Flesch Reading Ease, Flesch-Kincaid grade level, plus word and sentence counts — everything computed on your device.",
    benefits: [
      "Flesch Reading Ease and grade level in one click",
      "Word and sentence counts for context",
      "Plain-English difficulty band with every score",
      "Runs locally — drafts never leave your browser",
    ],
    howTo: [
      "Paste your article or essay text.",
      "Press Check readability.",
      "Aim for grade 8 or below for general audiences; shorten sentences if the score is high.",
    ],
    faqs: [
      {
        question: "What is a good Flesch Reading Ease score?",
        answer:
          "60–70 is plain English most adults read comfortably; 70–80 is fairly easy; below 30 is very difficult academic or legal prose. Higher is easier.",
      },
      {
        question: "How is the grade level calculated?",
        answer:
          "With the standard Flesch-Kincaid formula from average sentence length and average syllables per word. It estimates the US school grade needed to understand the text.",
      },
      {
        question: "Is my text uploaded anywhere?",
        answer: "No. Scoring runs entirely in your browser and nothing is transmitted or stored.",
      },
    ],
    related: ["word-counter", "reading-time-calculator", "text-cleaner", "keyword-density-checker"],
  },
  "invoice-generator": {
    title: "Invoice Generator — Free Online Invoice Maker",
    description:
      "Create a clean invoice online: add line items, tax and your business name, then copy the result. Free, no signup.",
    intro:
      "Type the client name, list items as description, quantity and price, add an optional tax rate — and get a tidy invoice with subtotal, tax and total due, ready to copy into an email or document.",
    benefits: [
      "Line-item math with subtotal, tax and total done for you",
      "Any currency symbol and tax/VAT rate",
      "Copy-ready text for emails, docs and PDFs",
      "Private by design — figures stay on your device",
    ],
    howTo: [
      "Enter the client name and your business name (optional).",
      "Add one item per line as: description, quantity, price.",
      "Set the tax rate and currency, then press Build invoice.",
      "Copy the invoice into your email or accounting tool.",
    ],
    faqs: [
      {
        question: "How do I format item lines?",
        answer:
          "One per line with commas separating description, quantity and price — for example: Logo design, 1, 450. Descriptions may contain commas; the last two values are always read as quantity and price.",
      },
      {
        question: "Can I use VAT or GST rates?",
        answer:
          "Yes — enter any percentage in the tax field. The generator applies it to the subtotal and shows tax and total separately.",
      },
      {
        question: "Is this a legal tax invoice?",
        answer:
          "It produces a clear payment request, but formal tax invoices in some regions require invoice numbers, addresses and registration details. Add those in your own document when required.",
      },
    ],
    related: ["tax-calculator", "number-formatter", "pdf-creator", "date-formatter"],
  },
  "text-to-speech": {
    title: "Text to Speech — Read Aloud Online",
    description:
      "Free text to speech: paste text and listen with your browser's voices, with speed control. No uploads, no signup.",
    intro:
      "Paste any text, pick a speed, and press Speak — your browser reads it aloud using its built-in voices.(decide male/female voices in your system settings). A word count and time estimate help you plan listening sessions.",
    benefits: [
      "One-tap Speak, Pause and Stop player",
      "Speed control from 0.5× to 2×",
      "Word count and listening-time estimate",
      "Nothing uploaded — speech uses your device's own voices",
    ],
    howTo: [
      "Paste or type the text to hear.",
      "Set the speed (1 is normal narration pace).",
      "Press Speak; use Pause and Stop to control playback.",
    ],
    faqs: [
      {
        question: "Which voices are available?",
        answer:
          "Your operating system and browser provide the voices (for example Microsoft, Apple or Google voices), including other languages where installed. RovoTools simply plays text through them.",
      },
      {
        question: "Is there a text length limit?",
        answer:
          "Very long pastes are best split into sections — browsers handle narration most reliably under a few thousand words at a time.",
      },
      {
        question: "Does my text leave my device?",
        answer:
          "No upload happens. The text is prepared locally and spoken by your browser's on-device speech engine.",
      },
    ],
    related: ["word-counter", "reading-time-calculator", "readability-checker", "lorem-ipsum-generator"],
  },
  "countdown-timer": {
    title: "Countdown Timer — Count Down to Any Date",
    description:
      "Free countdown timer: enter a target date or a duration in seconds and see the exact time remaining.",
    intro:
      "Count down to launches, deadlines and holidays — enter a target date and time, or simply a duration in seconds, and get the remaining days, hours, minutes and seconds instantly.",
    benefits: [
      "Target-date and duration modes",
      "Clear days-hours-minutes-seconds readout",
      "Total seconds for developers and planners",
      "Free, instant and private",
    ],
    howTo: [
      "Enter a target like 2026-12-31 23:59 — or a duration in seconds.",
      "Press Start countdown.",
      "Re-run anytime for a fresh remaining figure.",
    ],
    faqs: [
      {
        question: "What date formats work?",
        answer:
          "Anything your browser understands, such as 2026-12-31 23:59 or 2026-12-31T23:59. Times are interpreted in your local timezone.",
      },
      {
        question: "What happens after the moment passes?",
        answer: "The timer reports that the moment has passed instead of showing negative time.",
      },
    ],
    related: ["date-difference-calculator", "date-formatter", "timestamp-converter", "age-calculator"],
  },
  "random-word-generator": {
    title: "Random Word Generator — Writing & Game Prompts",
    description:
      "Draw random English words for writing prompts, vocabulary practice and word games — with repeatable seeds. Free.",
    intro:
      "Draw 1–50 random English words in one click, optionally fixed to one length. Add a seed to replay the exact same draw — perfect for classroom games, writing sprints and unscrambling practice.",
    benefits: [
      "1–50 words per draw with optional fixed length",
      "Seeds make draws repeatable for classes and games",
      "Draws from the same ENABLE-derived game list as the unscrambler",
      "Local and instant — no signup",
    ],
    howTo: [
      "Choose how many words to draw.",
      "Optionally fix the word length for level play.",
      "Press Draw words — add a seed when everyone should get the same set.",
    ],
    faqs: [
      {
        question: "How do seeds work?",
        answer:
          "The same seed text always produces the same draw on the same list, so a teacher can share one seed and the whole class practices identical words.",
      },
      {
        question: "Can I practice unscrambling with this?",
        answer:
          "Yes — draw a long word, scramble its letters by hand, then check yourself with the Word Unscrambler.",
      },
    ],
    related: ["word-unscrambler", "lorem-ipsum-generator", "word-counter", "readability-checker"],
  },
  "pdf-extract-text": {
    title: "Extract Text From PDF — Free Online",
    description:
      "Copy text out of any PDF in your browser: page-by-page extraction with .txt download. Files never leave your device.",
    intro:
      "Drop in a PDF and get its selectable text back page by page, ready to copy or download as .txt. Scanned image-only PDFs are detected and reported instead of returning gibberish.",
    benefits: [
      "Page-by-page text extraction in seconds",
      "One-click .txt download",
      "Clear warning for scanned (image-only) PDFs",
      "100% local — documents never leave your browser",
    ],
    howTo: [
      "Choose a PDF file.",
      "Press Extract text.",
      "Copy what you need or download the full .txt.",
    ],
    faqs: [
      {
        question: "Why does my PDF return no text?",
        answer:
          "It is probably a scan or photo of pages rather than real text. Scanned PDFs need OCR first — the tool tells you when this is the case.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Files up to 100 MB are accepted. Very large documents simply take longer on slower devices.",
      },
      {
        question: "Are my documents uploaded?",
        answer: "No. Extraction runs with an in-browser PDF engine; your file never leaves your device.",
      },
    ],
    related: ["pdf-to-word", "pdf-to-excel", "word-counter", "text-cleaner"],
    workflow: {
      title: "Work with PDFs end to end",
      steps: [
        { label: "Extract text from a PDF", href: "/tools/pdf/pdf-extract-text" },
        { label: "Count the words", href: "/tools/word-counter" },
        { label: "Create a fresh PDF", href: "/tools/pdf/pdf-creator" },
      ],
    },
  },
  "age-calculator": {
    title: "Age Calculator — Exact Age in Years, Months & Days",
    description:
      "Free age calculator. Find exact age in years, months and days from a birth date — or the age difference between two dates. Private, instant, no signup.",
    intro:
      "Find out how old someone is in years, months and days. Enter a birth date and an optional as-of date (defaults to today) to get a precise age breakdown using calendar-aware arithmetic — not a rough year estimate. Useful for birthdays, forms, HR checks, school enrolment and any situation that needs an exact age.",
    benefits: [
      "Exact years, months and days — not a rounded year estimate",
      "Compare against today or any as-of date",
      "Handles month-end and leap-day edge cases correctly",
      "Runs entirely on your device — the dates you enter never leave the browser",
    ],
    howTo: [
      "Enter the birth date in DD/MM/YYYY format.",
      "Leave the as-of date as today, or enter another date to measure against.",
      "Press Execute to see the age in years, months and days.",
      "Change the as-of date to plan a future birthday or verify a form entry.",
    ],
    faqs: [
      {
        question: "How is age calculated exactly?",
        answer:
          "Exact age counts full years between the two dates, then remaining months and leftover days. For example, someone born on 15 March 2000 is 26 full years old on 14 March 2026, and 26 years 11 months 15 days on 14 February 2027.",
      },
      {
        question: "What if the birth day is the 29th of February?",
        answer:
          "In non-leap years the anniversary is treated as 1 March (or 28 February, depending on jurisdiction). This calculator uses standard calendar arithmetic so you always get a consistent, explainable result.",
      },
      {
        question: "Can I calculate the age difference between two people?",
        answer:
          "Yes. Enter the first person's birth date with today's as-of date, note the result, then repeat for the second — or set both dates relative to a fixed as-of date so the difference is stable.",
      },
      {
        question: "Is my data private?",
        answer:
          "Yes. The calculation runs in your browser. The dates you type are not uploaded to a server, logged or stored.",
      },
    ],
    related: ["date-difference-calculator", "date-formatter", "timestamp-converter", "bmi-calculator"],
  },
  "unit-converter": {
    intro:
      "Convert everyday measurements in one place: kilometres to miles, kilograms to pounds, Celsius to Fahrenheit, inches to centimetres and more. Pick a from-unit and a to-unit from the same family, enter a value, and get the converted result plus the formula used so you can check the maths yourself.",
    benefits: [
      "Length, weight and temperature in metric and imperial",
      "Shows the conversion formula with every result",
      "Guards against mismatched unit families (e.g. km to kg)",
      "Instant and private — nothing is sent to a server",
    ],
    howTo: [
      "Enter the numeric value you want to convert.",
      "Choose the from-unit and to-unit from the dropdowns.",
      "Press Execute to see the converted value and the formula.",
      "Swap the units to convert in the other direction.",
    ],
    faqs: [
      {
        question: "Which units are supported?",
        answer:
          "Length includes kilometres, metres, centimetres, millimetres, miles, yards, feet and inches. Weight covers kilograms, grams, milligrams, pounds and ounces. Temperature covers Celsius, Fahrenheit and Kelvin.",
      },
      {
        question: "Why can't I convert kilometres to kilograms?",
        answer:
          "Distance and mass are different dimensions. The converter checks unit families and refuses cross-family conversions so you never get a meaningless number.",
      },
      {
        question: "How do you convert Celsius to Fahrenheit?",
        answer:
          "Fahrenheit = (Celsius × 9/5) + 32. The tool also handles Kelvin = Celsius + 273.15. The exact formula is shown with every temperature result.",
      },
    ],
    related: ["percentage-calculator", "number-formatter", "color-converter", "age-calculator"],
  },
  "word-counter": {
    title: "Word Counter — Count Words, Characters & Reading Time",
    description:
      "Free word counter. Count words, characters (with and without spaces), sentences and paragraphs — plus estimated reading time.",
    intro:
      "Paste any text to instantly count words, characters with and without spaces, sentences and paragraphs, and get an estimated reading and speaking time. Useful for essays, meta descriptions, tweets, ad copy, subtitles and any limit that is measured in words or characters.",
    benefits: [
      "Words, characters (with/without spaces), sentences and paragraphs",
      "Reading time and speaking-time estimates",
      "Live counts as you type or paste",
      "Text never leaves your browser — safe for confidential drafts",
    ],
    howTo: [
      "Paste or type your text into the text area.",
      "Read the live word, character, sentence and paragraph counts.",
      "Use the reading-time estimate to check length against limits.",
      "Clear the box to start a new draft.",
    ],
    faqs: [
      {
        question: "Does the word counter count hyphenated words as one or two?",
        answer:
          "Hyphenated compounds like 'well-known' count as one word, matching common word-processor behaviour. Numbers and standalone symbols count as words when separated by spaces.",
      },
      {
        question: "How is reading time estimated?",
        answer:
          "At an average silent reading speed of about 200–250 words per minute. Speaking time uses roughly 130–150 words per minute, closer to a natural presentation pace.",
      },
      {
        question: "Is my text stored or uploaded?",
        answer:
          "No. Counting happens in your browser. Nothing you paste is sent to a server, logged or saved after you leave the page.",
      },
    ],
    related: ["reading-time-calculator", "case-converter", "duplicate-line-remover", "text-cleaner"],
  },
  "tip-calculator": {
    title: "Tip Calculator — Split Bills Fairly",
    description:
      "Free tip calculator. Calculate tip percentage, total bill and per-person share when splitting with friends or family.",
    intro:
      "Work out the tip and the total without mental arithmetic. Enter the bill amount, the tip percentage and how many people are splitting, then get the tip, the grand total and each person's share. Ideal for restaurants, taxis, delivery and shared holidays.",
    benefits: [
      "Tip amount, total bill and per-person share in one result",
      "Any tip percentage — 10%, 15%, 18%, 20% or custom",
      "Handles group splits cleanly with rounding awareness",
      "Private and offline-friendly — no bill data leaves the device",
    ],
    howTo: [
      "Enter the bill amount before tip.",
      "Enter the tip percentage (for example 15 or 20).",
      "Enter how many people are splitting the bill.",
      "Press Execute to see the tip, total and each person's share.",
    ],
    faqs: [
      {
        question: "What tip percentage should I leave?",
        answer:
          "In the US, 15–20% of the pre-tax bill is common for table service; 10–15% for counter service. Elsewhere, check local norms — many countries include service already. Use any custom percentage this calculator accepts.",
      },
      {
        question: "Should tip be calculated on the pre-tax or post-tax bill?",
        answer:
          "Customarily on the pre-tax amount, though some people tip on the total. Enter whichever base you prefer as the bill amount — the tool simply applies your percentage.",
      },
      {
        question: "How do I split evenly with a shared bill?",
        answer:
          "Set people to the number of diners. The per-person figure is the grand total divided equally. For itemised splits, calculate each person's items separately then tip on their share.",
      },
    ],
    related: ["percentage-calculator", "discount-calculator", "loan-calculator", "age-calculator"],
  },
  "url-qr-generator": {
    title: "URL QR Code Generator — Free, Instant, Private",
    description:
      "Generate a QR code for any URL. Customise size and error correction, then download a PNG — no signup, no tracking.",
    intro:
      "Turn a website address into a scannable QR code in seconds. Paste the URL, choose size and error-correction level, and download a clean PNG ready for print, slides, menus or packaging. Codes are generated entirely in your browser — no link history is stored.",
    benefits: [
      "Works with any http/https URL",
      "Choose pixel size and error-correction level",
      "Download as PNG for print or screens",
      "Generated locally — the URL is not sent to a third-party QR API",
    ],
    howTo: [
      "Paste the full URL, including https://.",
      "Pick a size (for example 300 px for small print, 1000 px for posters).",
      "Choose an error-correction level (M is fine for most uses).",
      "Press Execute, then download the PNG.",
    ],
    faqs: [
      {
        question: "What error correction level should I use?",
        answer:
          "Level M (about 15% recovery) balances density and reliability for most URLs. Use Q or H if the code will be printed small, damaged, or partially obscured (menus, stickers).",
      },
      {
        question: "Will the QR code expire?",
        answer:
          "The image itself never expires. Scanners open whatever URL was encoded — if you later change the destination page, the same QR still points at the same address unless you use a redirect you control.",
      },
      {
        question: "Can I make a short-link QR instead of a long URL?",
        answer:
          "Yes. Generate the code for your short link (or any redirect you control). Shorter URLs produce denser-looking codes only when the string is long; error correction still applies.",
      },
    ],
    related: ["wifi-qr-generator", "vcard-qr-generator", "text-qr-generator", "url-encoder"],
  },
  "percentage-calculator": {
    title: "Percentage Calculator — Of, Change & Reverse %",
    description:
      "Free percentage calculator. Work out X% of Y, percentage change between values, and what number a percentage is of another.",
    intro:
      "Solve everyday percentage problems in one tool: what is X% of Y, the percentage change from an old value to a new one, and reverse questions like 'X is what percent of Y'. Enter the numbers, press execute, and get a clear step-by-step result you can trust for discounts, grades, markups and stats.",
    benefits: [
      "X% of Y, percentage change and reverse percentage in one place",
      "Shows the working, not just the number",
      "Handles zero and negative values safely",
      "Runs on your device — no data is uploaded",
    ],
    howTo: [
      "Enter the base value (Y) and the percentage (X) for 'X% of Y'.",
      "Optionally enter an old value to compute percentage change to the new total.",
      "Press Execute to see all computed percentage results with their formulas.",
      "Reuse the same inputs after tweaking a number for quick scenarios.",
    ],
    faqs: [
      {
        question: "How do you calculate percentage change?",
        answer:
          "Change = (new − old) ÷ old × 100. A price from 80 to 100 is a 25% increase; from 100 to 80 is a 20% decrease — the bases differ, which is why direction and wording matter.",
      },
      {
        question: "What is 15% of 240?",
        answer:
          "0.15 × 240 = 36. The tool shows this as X% of Y so you can verify any similar question.",
      },
      {
        question: "How do I find what percent 45 is of 60?",
        answer:
          "45 ÷ 60 × 100 = 75%. Use the reverse-percentage mode with the part and the whole.",
      },
    ],
    related: ["discount-calculator", "roi-calculator", "compound-interest-calculator", "unit-converter"],
  },
  "compound-interest-calculator": {
    title: "Compound Interest Calculator — Growth Over Time",
    description:
      "Free compound interest calculator. Project principal growth with annual compounding frequency, years and rate — plus yearly breakdown.",
    intro:
      "See how money grows with compound interest. Enter the principal, annual interest rate, number of years and how often interest compounds (annually, semi-annually, quarterly, monthly or daily). Get the future value, total interest earned and a year-by-year table so you can compare scenarios side by side.",
    benefits: [
      "Future value with any compounding frequency",
      "Total interest and yearly growth table",
      "Compare rates and terms without spreadsheets",
      "Calculations stay on your device",
    ],
    howTo: [
      "Enter the starting principal (initial investment or loan base).",
      "Enter the annual interest rate as a percentage.",
      "Enter how many years the money compounds for.",
      "Choose compounds per year (12 is a common monthly default).",
      "Press Execute to see future value, total interest and the yearly table.",
    ],
    faqs: [
      {
        question: "What is the compound interest formula?",
        answer:
          "A = P(1 + r/n)^(n×t), where P is principal, r the annual rate as a decimal, n compounds per year and t years. Total interest is A − P.",
      },
      {
        question: "How does compounding frequency affect the result?",
        answer:
          "More frequent compounding grows money slightly faster for the same nominal rate. Monthly (n=12) vs annual (n=1) is a small but real difference over long horizons.",
      },
      {
        question: "Does this include regular monthly deposits?",
        answer:
          "This calculator models a single principal with compound growth. For recurring contributions, run yearly scenarios or use a dedicated savings planner with payment schedules.",
      },
    ],
    related: ["roi-calculator", "loan-calculator", "percentage-calculator", "discount-calculator"],
  },
  "roi-calculator": {
    title: "ROI Calculator — Return on Investment",
    description:
      "Free ROI calculator. Work out return on investment as a percentage and absolute gain from cost and revenue.",
    intro:
      "Measure return on investment the standard way. Enter what you spent (cost) and what you got back (gain or revenue) to get ROI as a percentage plus the absolute profit. Useful for marketing campaigns, freelance projects, side hustles and comparing where money actually works hardest.",
    benefits: [
      "Standard ROI = (gain − cost) ÷ cost × 100",
      "Shows absolute profit and percentage together",
      "Handles negative ROI when costs exceed returns",
      "Instant and private in the browser",
    ],
    howTo: [
      "Enter the total cost or investment amount.",
      "Enter the total gain, revenue or exit value.",
      "Press Execute to see ROI percentage and absolute profit.",
      "Swap numbers to compare alternative scenarios quickly.",
    ],
    faqs: [
      {
        question: "What is a good ROI?",
        answer:
          "It depends on the channel and risk. A single campaign that doubles spend (100% ROI) is very different from a diversified portfolio average. Always compare against your own baseline and alternatives, not a universal number.",
      },
      {
        question: "What if ROI is negative?",
        answer:
          "The tool reports negative ROI when cost exceeds gain. That is still useful information — it shows which activities destroyed value so you can stop or redesign them.",
      },
      {
        question: "Does this account for time or inflation?",
        answer:
          "No. ROI here is a simple cost-vs-return ratio. For multi-year returns, annualise separately or combine with the compound interest tool to compare growth rates.",
      },
    ],
    related: ["compound-interest-calculator", "percentage-calculator", "discount-calculator", "tax-calculator"],
  },
  "discount-calculator": {
    title: "Discount Calculator — Sale Price & Savings",
    description:
      "Free discount calculator. Find the sale price and money saved from any percentage discount, with optional tax.",
    intro:
      "Work out what you actually pay after a sale. Enter the original price and the discount percentage to get the sale price and the amount saved. Built for shopping, wholesale quotes and clearance maths where mental arithmetic gets sloppy.",
    benefits: [
      "Sale price and absolute savings in one result",
      "Any discount percentage — 10%, 25%, 50% or custom",
      "Clear formula so you can verify the shop's sticker",
      "On-device calculation — prices stay private",
    ],
    howTo: [
      "Enter the original price before discount.",
      "Enter the discount percentage (for example 25 for 25% off).",
      "Press Execute to see the sale price and how much you saved.",
      "Compare stacked offers by recalculating with different percentages.",
    ],
    faqs: [
      {
        question: "How is the sale price calculated?",
        answer:
          "Sale price = original × (1 − discount/100). A 20% discount on 150 is 150 × 0.80 = 120, saving 30.",
      },
      {
        question: "How do I compare two discounts?",
        answer:
          "Run the calculator once per offer with the same original price, then compare both sale prices and savings. Deeper percentage always wins on the same base price.",
      },
      {
        question: "Does this include sales tax or VAT?",
        answer:
          "No — it applies only the discount. Add tax manually on the sale price, or chain it with a percentage calculation for the tax amount.",
      },
    ],
    related: ["percentage-calculator", "roi-calculator", "tax-calculator", "tip-calculator"],
  },
  "uuid-generator": {
    title: "UUID Generator — v4 Random IDs, Batch Up to 50",
    description:
      "Generate cryptographically strong UUID v4 identifiers. Create up to 50 at a time, copy or download as a list — free and private.",
    intro:
      "Generate RFC 4122 version 4 UUIDs for database keys, test fixtures, correlation IDs and API samples. Create up to fifty identifiers in one click, copy them to the clipboard or download a plain-text file. Values come from the browser's cryptographic random source — never from a weak PRNG.",
    benefits: [
      "UUID v4 using the browser's crypto.getRandomValues",
      "Batch generate up to 50 IDs at once",
      "Copy to clipboard or download as a text list",
      "No server round-trip — IDs never leave the device",
    ],
    howTo: [
      "Choose how many UUIDs you need (1–50).",
      "Press Execute to generate the batch.",
      "Copy the list or download it as a text file.",
      "Generate again if you need a fresh set.",
    ],
    faqs: [
      {
        question: "What is a UUID v4?",
        answer:
          "A 128-bit identifier formatted as eight groups of hex digits (for example 550e8400-e29b-41d4-a716-446655440000). Version 4 fills 122 bits with random data, making collisions astronomically unlikely for typical app use.",
      },
      {
        question: "Are these UUIDs safe for secrets?",
        answer:
          "They are strong random values, but they are not a substitute for dedicated secret managers or session tokens with proper expiry. Use them as identifiers, not as sole authentication material.",
      },
      {
        question: "How is this different from a sequential ID?",
        answer:
          "Sequential IDs reveal order and volume. UUID v4 values do not encode time or sequence, which avoids leaking growth metrics and reduces collision risk across systems.",
      },
    ],
    related: ["random-token-generator", "hash-generator", "password-generator", "regex-tester"],
  },
  "regex-tester": {
    title: "Regex Tester — Test Regular Expressions Online",
    description:
      "Test JavaScript regular expressions against sample text. Live match list with groups and flags — private, in-browser regex playground.",
    intro:
      "Write and test JavaScript regular expressions without leaving the browser. Enter a pattern, optional flags (g, i, m, s, u) and sample text to see every match with capture groups highlighted in the results. Ideal for form validation, log parsing, refactors and interview prep.",
    benefits: [
      "Live matches with capture groups",
      "Supports common JS flags (g, i, m, s, u, y)",
      "Invalid patterns report clear errors instead of failing silently",
      "Patterns and sample text stay on your device",
    ],
    howTo: [
      "Enter the pattern without surrounding slashes (for example \\d+).",
      "Optionally add flags such as g for global or i for case-insensitive.",
      "Paste the text you want to match against.",
      "Press Execute to list every match and its groups.",
    ],
    faqs: [
      {
        question: "Which regex flavour is this?",
        answer:
          "JavaScript (ECMAScript) regular expressions, the same engine your browser uses. Lookbehind and named groups depend on browser support but are widely available in modern browsers.",
      },
      {
        question: "Why do I get zero matches when the pattern looks correct?",
        answer:
          "Check escaping (\\d not d for digits), whether you need the g flag for multiple matches, and whether whitespace or case sensitivity matters. The error panel flags syntax problems.",
      },
      {
        question: "Can I use this regex in Python or Java?",
        answer:
          "Many patterns transfer, but flavours differ (lookbehind, word boundaries, flags). Treat this as a JS tester and verify language-specific syntax in your target runtime's docs.",
      },
    ],
    related: ["diff-checker", "json-validator", "email-validator", "uuid-generator"],
  },
  "base64-decoder": {
    title: "Base64 Decoder — Decode Base64 Strings Online",
    description:
      "Free Base64 decoder. Decode Base64 (and URL-safe Base64) back to plain text instantly — private, no upload.",
    intro:
      "Decode Base64-encoded text back to readable characters. Paste a Base64 string — standard or URL-safe — and get the decoded text immediately. Common for JWT payloads, email attachments, data URIs and API debugging. Decoding runs entirely in your browser.",
    benefits: [
      "Handles standard and URL-safe Base64 alphabets",
      "Ignores whitespace and line breaks in the input",
      "Shows clear errors for invalid padding or characters",
      "Nothing is uploaded — safe for tokens and payloads you shouldn't share",
    ],
    howTo: [
      "Paste the Base64 string into the input box.",
      "Press Execute to decode it to plain text.",
      "Copy the result, or fix the input if an error is reported.",
      "Use the paired encoder if you need to go the other way.",
    ],
    faqs: [
      {
        question: "What is Base64?",
        answer:
          "A binary-to-text encoding that maps three bytes to four ASCII characters from a 64-symbol alphabet. It is not encryption — anyone can decode it. Use it for transport safety, not secrecy.",
      },
      {
        question: "Why is my decoded text garbled?",
        answer:
          "The payload may be binary (images, compressed data) rather than text, or it may be URL-safe Base64 with - and _ instead of + and /. This tool accepts URL-safe input; binary payloads will still look noisy as text.",
      },
      {
        question: "Is Base64 safe for passwords or secrets?",
        answer:
          "No. Base64 is encoding, not encryption. Never store or transmit passwords as 'protected' Base64 — use proper hashing and TLS instead.",
      },
    ],
    related: ["base64-encoder", "url-encoder", "url-decoder", "jwt-decoder"],
  },
  "url-encoder": {
    title: "URL Encoder — Percent-Encode Query Strings",
    description:
      "Free URL encoder. Percent-encode text for query strings and URLs — standard encodeURIComponent behaviour, private and instant.",
    intro:
      "Percent-encode any text so it is safe inside a URL query string or path segment. Spaces become %20 (or + depending on context), reserved characters like &, ?, # and = are escaped, and unicode is UTF-8 encoded. Essential for building API calls, tracking links and form GET URLs by hand.",
    benefits: [
      "Standard encodeURIComponent behaviour",
      "Safe for query values, path segments and form bodies",
      "Handles unicode and multi-byte characters correctly",
      "Encoding runs locally — content is not sent anywhere",
    ],
    howTo: [
      "Paste the raw text you need to place in a URL.",
      "Press Execute to produce the percent-encoded string.",
      "Copy the result into your query string or API client.",
      "Use the decoder if you need to reverse an encoded value.",
    ],
    faqs: [
      {
        question: "What is the difference between %20 and + for spaces?",
        answer:
          "+ is traditional for application/x-www-form-urlencoded bodies. %20 works in both query strings and paths. This encoder uses encodeURIComponent (%20), which is the safer general choice.",
      },
      {
        question: "Which characters must be encoded in a query value?",
        answer:
          "At minimum: space, #, &, +, =, ?, %, and non-ASCII. encodeURIComponent escapes all of these plus !, ', (, ) and * — all safe to leave encoded.",
      },
      {
        question: "Can I encode an entire URL?",
        answer:
          "You can, but you usually should not. Encode only the parameter values, not the scheme, host or path separators. Encoding a whole URL breaks navigation.",
      },
    ],
    related: ["url-decoder", "base64-encoder", "url-validator", "slug-generator"],
  },
  "password-strength-checker": {
    title: "Password Strength Checker — Entropy & Weak-Pattern Hints",
    description:
      "Check password strength offline. Estimates entropy, flags weak patterns and dictionary words — never sends the password anywhere.",
    intro:
      "Paste a password to estimate its strength: length, character-class mix, entropy in bits, and warnings for common patterns (sequences, repeats, keyboard runs, dictionary words). The check runs entirely in your browser — the password is never transmitted, logged or stored. Use it to harden passwords before saving them in your manager.",
    benefits: [
      "Entropy estimate in bits plus a plain-language rating",
      "Flags sequences, repeats, years and common words",
      "Password never leaves the device — safe for real checks",
      "Works offline once the page has loaded",
    ],
    howTo: [
      "Paste the password you want to evaluate.",
      "Press Execute to see length, character classes, entropy and warnings.",
      "Address the listed weak patterns (replace dictionary words, avoid runs).",
      "Re-check until the rating and entropy meet your policy.",
    ],
    faqs: [
      {
        question: "How many bits of entropy are enough?",
        answer:
          "For online accounts, 60+ bits is a practical floor; 80+ bits is comfortable for high-value secrets. Entropy depends on true randomness — a long passphrase of random words often beats a short 'complex' password.",
      },
      {
        question: "Does this store or send my password?",
        answer:
          "No. Analysis happens in JavaScript in your tab. Nothing is sent to a server. Close the tab and the value is gone from the page.",
      },
      {
        question: "Is a strong score safe to reuse everywhere?",
        answer:
          "No. Strength does not protect against breach reuse. Generate a unique password per site (see the password generator) and store them in a password manager.",
      },
    ],
    related: ["password-generator", "hash-generator", "random-token-generator", "uuid-generator"],
  },
  "hash-generator": {
    title: "Hash Generator — MD5, SHA-1, SHA-256, SHA-512 Online",
    description:
      "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes of any text — entirely in your browser with the Web Crypto API.",
    intro:
      "Hash any text string with MD5, SHA-1, SHA-256 or SHA-512. Useful for checksums, verifying file integrity references, comparing cached strings and learning how digests work. Hashing uses your browser's crypto — the input never reaches a server. MD5 and SHA-1 are shown for compatibility only; use SHA-256 or better for security-sensitive work.",
    benefits: [
      "MD5, SHA-1, SHA-256 and SHA-512 in one run",
      "Web Crypto API — fast native hashing in the browser",
      "Clear warning when a digest is not collision-resistant",
      "Input stays on the device",
    ],
    howTo: [
      "Paste the text you want to hash.",
      "Press Execute to compute all supported digests.",
      "Copy the hash you need (usually SHA-256 or SHA-512).",
      "Re-run after any input change to get updated digests.",
    ],
    faqs: [
      {
        question: "Which hash should I use?",
        answer:
          "SHA-256 or SHA-512 for anything security-related. MD5 and SHA-1 are included for legacy checksums only — both are broken against deliberate collisions.",
      },
      {
        question: "Is hashing the same as encryption?",
        answer:
          "No. Hashing is one-way: you cannot recover the input from the digest. Encryption is reversible with a key. Passwords need slow hashes (bcrypt, argon2), not fast SHA digests alone.",
      },
      {
        question: "Why do two different strings sometimes look related in length?",
        answer:
          "All SHA-256 digests are 256 bits (64 hex characters) regardless of input size — that is by design. Same-length output does not mean related content.",
      },
    ],
    related: ["password-strength-checker", "random-token-generator", "uuid-generator", "base64-encoder"],
  },
  "email-validator": {
    title: "Email Validator — Syntax & Structure Check",
    description:
      "Validate email address syntax offline. Checks local part, domain shape and common typos — without sending anything.",
    intro:
      "Check whether an email address is structurally valid before you add it to a form, CRM or mailing list. The validator checks local-part rules, domain shape, consecutive dots and other common typos. Validation is local to your browser — no verification emails are sent and nothing is stored.",
    benefits: [
      "RFC-aware local-part and domain checks",
      "Flags consecutive dots, missing @ and obvious typos",
      "No network call — the address never leaves the page",
      "Fast enough to re-check while typing",
    ],
    howTo: [
      "Paste the email address into the input field.",
      "Press Execute to run the syntax and structure checks.",
      "Read any warnings (for example double dots or missing TLD).",
      "Correct the address and re-validate.",
    ],
    faqs: [
      {
        question: "Does a valid syntax mean the mailbox exists?",
        answer:
          "No. Syntax validation cannot prove delivery. Only a confirmation email (double opt-in) verifies a mailbox actually receives mail.",
      },
      {
        question: "Why are plus-addresses like user+tag@example.com accepted?",
        answer:
          "Sub-addressing is a standard feature of many mail systems. A leading or trailing + in the local part is legal; this validator accepts it.",
      },
      {
        question: "Can I validate a list of emails at once?",
        answer:
          "This tool checks one address at a time. For bulk lists, run each through the validator or use a spreadsheet formula plus spot checks — never upload a list to an untrusted online service.",
      },
    ],
    related: ["url-validator", "regex-tester", "email-validator", "password-strength-checker"],
  },
  "date-difference-calculator": {
    title: "Date Difference Calculator — Days, Weeks & Months Between Dates",
    description:
      "Calculate the exact difference between two dates in days, weeks, months and years. Free, private, calendar-aware.",
    intro:
      "Find how many days, weeks, months and years fall between two dates. Useful for project timelines, age gaps, billing periods, leave balances and deadlines. The calculator is calendar-aware so month lengths and leap years are counted correctly — not just a raw day multiply.",
    benefits: [
      "Difference in days, weeks, months and years together",
      "Calendar-aware (handles leap years and uneven months)",
      "Either date order works — past or future ranges",
      "Dates stay in your browser",
    ],
    howTo: [
      "Enter the start date in DD/MM/YYYY format.",
      "Enter the end date in DD/MM/YYYY format.",
      "Press Execute to see days, weeks, months and years between them.",
      "Swap the dates if you need the reverse direction.",
    ],
    faqs: [
      {
        question: "Is the day count inclusive or exclusive?",
        answer:
          "The primary day count is exclusive of the end date (standard difference). For inclusive counts (both endpoints counted), add one day to the result.",
      },
      {
        question: "How are months calculated when days don't align?",
        answer:
          "Full calendar months are counted first, then leftover days. From 31 January to 28 February is 0 months and 28 days in some conventions, or 1 month in others — this tool reports full months plus remaining days so the breakdown is explicit.",
      },
      {
        question: "Can I use this for business-day only ranges?",
        answer:
          "No. This is a calendar difference. Weekends and holidays are not subtracted; compute business days separately if needed.",
      },
    ],
    related: ["age-calculator", "date-formatter", "countdown-timer", "timestamp-converter"],
  },
  "json-minifier": {
    title: "JSON Minifier — Remove Whitespace from JSON",
    description:
      "Minify JSON by stripping unnecessary whitespace. Validates structure while compacting — private, in-browser JSON tool.",
    intro:
      "Compress JSON by removing indentation and unnecessary whitespace while keeping structure intact. Paste pretty-printed JSON, minify it, and copy the compact payload for APIs, configs or size checks. Invalid JSON is rejected with a clear error before anything is produced. Everything runs locally.",
    benefits: [
      "Strips indentation and redundant whitespace only",
      "Rejects invalid JSON with a readable error",
      "Ideal for API payloads and config size checks",
      "Input never leaves the browser",
    ],
    howTo: [
      "Paste your JSON into the input area.",
      "Press Execute to validate and minify.",
      "Copy the compact single-line (or tightly spaced) result.",
      "Fix any reported syntax error and try again.",
    ],
    faqs: [
      {
        question: "Does minifying change my data?",
        answer:
          "No. Only whitespace outside string values is removed. Key order and values are preserved exactly as parsed.",
      },
      {
        question: "Why does my minified JSON fail in an API?",
        answer:
          "Some servers expect a specific Content-Type or reject very long single lines. Validate with the JSON formatter/validator first, and check the API docs for size limits.",
      },
      {
        question: "What is the difference from the JSON formatter?",
        answer:
          "The formatter pretty-prints for readability. The minifier does the opposite — compact output for transport and storage.",
      },
    ],
    related: ["json-formatter", "json-validator", "csv-to-json", "json-to-yaml"],
  },
  "svg-to-image": {
    title: "SVG to PNG/JPG/WebP Converter — Free, Online",
    description:
      "Convert SVG files to PNG, JPG or WebP online. Rasterize vector graphics at any scale (1×–8×) or exact pixel width — batch supported, 100% private, no upload.",
    intro:
      "Rasterize SVG files to PNG, JPG or WebP directly in your browser. Drop in one SVG or twenty, choose the output format, set a scale factor or exact pixel width, and download crisp raster images — no account, no server round-trip, nothing leaves your device. Ideal for exporting logos, icons and illustrations for social media, email signatures, documents and platforms that do not accept SVG.",
    benefits: [
      "Batch-convert up to 20 SVG files in one run",
      "Output PNG (keeps transparency), JPG (smallest) or WebP (modern, keeps transparency)",
      "Scale 1×–8× or set an exact pixel width — aspect ratio is always preserved",
      "Optional solid background for JPEG or when you need a filled canvas",
      "Everything runs in the browser: your SVGs are never uploaded",
    ],
    howTo: [
      "Drop your SVG files into the upload area (or click to browse).",
      "Choose the output format — PNG, JPG or WebP.",
      "Pick a scale (1×–8×) or type an exact pixel width to override it.",
      "Optionally set a background colour (recommended for JPEG, which has no transparency).",
      "Press Convert SVGs, then download each image or all at once.",
    ],
    faqs: [
      {
        question: "Why is my SVG blurry after converting to PNG?",
        answer:
          "SVGs are resolution-independent — the raster size is whatever you choose. If the result looks soft, increase the scale (or exact width) and re-convert. A 2× export is usually enough for retina screens.",
      },
      {
        question: "Does converting SVG to PNG lose quality?",
        answer:
          "The vector itself is not modified; you are freezing one rendered size. PNG is lossless for that size. For the smallest file with good quality, try WebP at 80–90% quality.",
      },
      {
        question: "Can I convert SVGs with external images or fonts?",
        answer:
          "SVGs that reference external URLs (remote images, web fonts) may render without those assets, because the browser blocks cross-origin loads inside a local preview. Inline everything into the SVG before converting.",
      },
      {
        question: "Is my SVG uploaded to a server?",
        answer: "No. Rendering happens entirely in your browser via the canvas API — nothing is transmitted.",
      },
    ],
    related: ["image-converter", "image-compressor", "svg-viewer", "svg-to-base64", "favicon-generator"],
  },
  "image-to-svg": {
    title: "Image to SVG Vectorizer — PNG/JPG to SVG Online",
    description:
      "Convert PNG, JPG or WebP images to SVG vectors online. Trace logos, icons and line art into clean scalable paths — private, free, no signup.",
    intro:
      "Turn raster images (PNG, JPG, WebP) into scalable SVG vectors with an in-browser Potrace engine. Perfect for logos, icons, stamps, signatures and high-contrast line art. Tune the threshold and despeckle, preview the result side by side with the original, and download a clean SVG — all on your device, with no upload and no account.",
    benefits: [
      "Trace PNG, JPG and WebP into editable SVG paths (Potrace algorithm, pure TypeScript)",
      "Auto threshold (Otsu) or manual 0–255 control for dark vs light subjects",
      "Despeckle slider removes noise and stray dots from the trace",
      "Optional invert for light shapes on dark backgrounds",
      "Batch-vectorize up to 10 images; download each SVG or all at once",
    ],
    howTo: [
      "Upload one or more PNG, JPG or WebP images (logos and icons work best).",
      "Leave threshold on auto, or set a value between 0 and 255 if the trace is too aggressive or too sparse.",
      "Adjust despeckle to remove small speckles without eating into real detail.",
      "Optionally set a fill colour for the traced shape and tick Invert for light-on-dark art.",
      "Press Vectorize, compare the side-by-side preview, then download the SVGs.",
    ],
    faqs: [
      {
        question: "What images trace well to SVG?",
        answer:
          "High-contrast, flat-colour artwork: logos, icons, stamps, signatures, line drawings and silhouettes. Photographs, gradients and noisy images produce large, imperfect vectors — convert a high-contrast or black-and-white version of the image first.",
      },
      {
        question: "Why is my vectorized SVG missing colours?",
        answer:
          "This tool produces single-colour (silhouette) traces — it captures shape, not multi-colour fills. For full-colour vectorization you need a multi-layer tracer; for most logo work a clean single-colour path is exactly what you want.",
      },
      {
        question: "How do I fix a noisy or speckled trace?",
        answer:
          "Increase the despeckle value to remove small stray paths. If large areas disappear, lower it again. Manual threshold tuning also helps when auto-threshold picks the wrong cut-off.",
      },
      {
        question: "Is my image uploaded anywhere?",
        answer: "No. Decoding, canvas rendering and tracing all run in your browser — the image never leaves your device.",
      },
    ],
    related: ["svg-to-image", "image-converter", "svg-viewer", "favicon-generator", "image-compressor"],
  },
  "svg-viewer": {
    title: "SVG Viewer — Preview SVG Files Online Free",
    description:
      "Preview SVG files instantly in your browser. Inspect dimensions, viewBox, element counts and file size — private, free, no upload required.",
    intro:
      "Open and inspect SVG files without installing design software. Upload a file or paste SVG markup to get an instant live preview on a checkerboard (so you can see transparency), plus the dimensions, viewBox, element and path counts and the file size. Copy the cleaned source or download the SVG — everything runs locally in your browser.",
    benefits: [
      "Instant live preview with light, dark and checkerboard backgrounds",
      "Shows intrinsic size, viewBox, element count, path count and file size",
      "Paste source directly or upload a file — nothing is uploaded either way",
      "Copy the normalized source or download the SVG in one click",
      "Useful for QA: catch clipped strokes, missing viewBox and oversized files before shipping",
    ],
    howTo: [
      "Upload an SVG file, or paste the SVG markup into the source box.",
      "The preview appears immediately — switch backgrounds to check transparency.",
      "Review the metadata panel: size, intrinsic dimensions, viewBox and element counts.",
      "Open View SVG source to inspect or copy the markup.",
      "Copy the source or download the file when you are happy with it.",
    ],
    faqs: [
      {
        question: "Why does my SVG look blank in the preview?",
        answer:
          "The file may use a viewBox with zero-size content, rely on external stylesheets, or draw outside the visible area. Check the source for width/height and viewBox, and make sure all shapes are inside the viewBox bounds.",
      },
      {
        question: "Does this tool edit or optimize SVGs?",
        answer:
          "No — the viewer is for inspection only. It shows the source as-is so you can debug it. For encoding to Base64 or data URIs, use the SVG to Base64 tool; for rasterizing, use SVG to PNG/JPG/WebP.",
      },
      {
        question: "Is my SVG file uploaded?",
        answer: "No. The file is read with the browser File API and rendered locally — it never leaves your device.",
      },
    ],
    related: ["svg-to-image", "svg-to-base64", "image-to-svg", "svg-placeholder-generator"],
  },
  "svg-to-base64": {
    title: "SVG to Base64 & Data URI Converter — Free Online",
    description:
      "Encode SVG markup as Base64, data URIs and CSS background snippets. Paste or upload an SVG — get copy-ready encodings instantly, 100% private.",
    intro:
      "Convert SVG markup into Base64, data URIs and ready-to-paste CSS background declarations. Paste the source or upload a file, then copy the encoding you need for inline icons, CSS sprites, JSON payloads or API responses. Everything is computed in your browser — your SVG never leaves your device.",
    benefits: [
      "Four outputs from one source: raw Base64, Base64 data URI, URL-encoded data URI and CSS background",
      "URL-encoded URI is often smaller than Base64 for text-heavy SVGs — compare both sizes",
      "Upload a file or paste markup; preview the SVG before encoding",
      "Copy any output with one click — no signup, no limits",
      "Encoding runs locally: private brand assets and client work stay private",
    ],
    howTo: [
      "Upload an SVG file, or paste the SVG markup into the source box.",
      "The preview and all four encodings update instantly.",
      "Pick the encoding you need: Base64 for APIs, data URI for <img src> or CSS, CSS background for stylesheets.",
      "Press Copy on the output you want and paste it into your code.",
    ],
    faqs: [
      {
        question: "Base64 or URL-encoded data URI — which should I use?",
        answer:
          "Base64 is safer inside CSS url() quotes and JSON strings; URL-encoded is often 10–30% smaller for SVGs with lots of text or path data. Compare the two output lengths and pick the smaller one that your context accepts.",
      },
      {
        question: "Why is my Base64 SVG not rendering?",
        answer:
          "Common causes: missing xmlns=\"http://www.w3.org/2000/svg\" on the root element, or an encoding error from copying a truncated string. Verify the source in the SVG Viewer first, then re-encode.",
      },
      {
        question: "Does Base64 encoding make my SVG smaller?",
        answer:
          "No — Base64 expands data by roughly 33%. Use it for embedding and transport, not compression. For shrinking SVGs, optimize the source (remove metadata, simplify paths) before encoding.",
      },
      {
        question: "Is my SVG uploaded?",
        answer: "No. Encoding is pure string processing in your browser — nothing is transmitted.",
      },
    ],
    related: ["svg-viewer", "svg-to-image", "image-to-svg", "base64-encoder"],
  },
};

export function getToolPageCopy(definition: ToolDefinition): ResolvedToolPageCopy {
  const deck = TOOL_PAGE_COPY[definition.id];
  const runsLocally = definition.processingMode === "LOCAL" && !definition.requiresNetwork;
  const fallbackBenefits = runsLocally
    ? [
        "Runs entirely on your device — nothing is uploaded",
        "Free to use with no signup",
        "Works on mobile, tablet and desktop",
      ]
    : [
        "Free to use with no signup",
        "Privacy-conscious: only the data needed for the task leaves your device",
        "Works on mobile, tablet and desktop",
      ];
  return {
    ...(deck?.title === undefined ? {} : { title: deck.title }),
    ...(deck?.description === undefined ? {} : { description: deck.description }),
    intro: deck?.intro ?? definition.description,
    benefits: deck?.benefits ?? fallbackBenefits,
    howTo: deck?.howTo ?? [
      `Enter your details in the inputs panel above.`,
      "Press Execute to compute the result instantly.",
      "Copy, download or share the result — or reset to start over.",
    ],
    faqs: deck?.faqs ?? [],
    related: deck?.related ?? [],
    ...(deck?.workflow === undefined ? {} : { workflow: deck.workflow }),
    hasCustomCopy: deck !== undefined,
  };
}
