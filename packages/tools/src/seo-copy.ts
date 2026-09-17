import type { ToolDefinition } from "@rovotools/types";

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
    title: "Image Compressor — Compress Images Online | RovoTools",
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
    title: "Image Resizer — Resize Images Online | RovoTools",
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
    title: "Image Converter — Convert JPG, PNG & WebP | RovoTools",
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
    title: "Merge PDF — Combine PDF Files Online | RovoTools",
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
    title: "Split PDF — Extract Pages Online | RovoTools",
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
    title: "Compress PDF — Reduce PDF Size Online | RovoTools",
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
    title: "JPG to PDF — Convert Images to PDF Online | RovoTools",
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
    title: "PDF to JPG — Convert PDF Pages to Images Online | RovoTools",
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
    title: "Word to PDF — Convert DOCX Online | RovoTools",
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
    title: "PDF Creator — Make a PDF Online Free | RovoTools",
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
    title: "Sign PDF — E-Sign Documents Online | RovoTools",
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
    title: "PDF to Word — Convert PDF to DOCX Online | RovoTools",
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
    title: "PDF to Excel — Convert PDF to XLSX Online | RovoTools",
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
    title: "JSON Formatter — Format & Beautify JSON Online | RovoTools",
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
    title: "JSON Validator — Check JSON Online | RovoTools",
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
    title: "Base64 Encoder — Encode Text Online | RovoTools",
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
    title: "JWT Decoder — Decode JSON Web Tokens Online | RovoTools",
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
    title: "Password Generator — Create Strong Passwords | RovoTools",
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
    title: "BMI Calculator — Calculate Body Mass Index | RovoTools",
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
    title: "Loan Calculator — Monthly Payment & Interest | RovoTools",
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
    title: "UTM URL Builder — Campaign Tracking Links | RovoTools",
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
    title: "SERP Snippet Preview — Google Result Preview | RovoTools",
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
    title: "Schema Markup Validator — JSON-LD Checker | RovoTools",
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
    title: "Meta Tag Analyzer — Audit Page Tags | RovoTools",
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
    title: "Robots.txt Checker — Validate Crawler Rules | RovoTools",
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
    title: "Website SEO Checker — On-Page Audit | RovoTools",
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
    title: "Open Graph Checker — Social Preview Tags | RovoTools",
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
    title: "XML Sitemap Checker — Validate Sitemaps | RovoTools",
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
    title: "Analytics Tag Detector — Find Trackers | RovoTools",
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
    title: "Website Performance Analyzer — Page Weight Hints | RovoTools",
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
  };
}
