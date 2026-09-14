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

const TOOL_PAGE_COPY: Record<string, ToolPageCopy> = {
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
  "text-to-pdf": {
    title: "Text to PDF — Create PDF Files Online | RovoTools",
    description:
      "Convert plain text into a downloadable single-page PDF online. Paste your text, generate the PDF locally and download it instantly.",
    intro:
      "Convert plain text into a downloadable single-page PDF. Paste your content, generate the file locally in your browser and save it with a .pdf extension.",
    benefits: [
      "Single-page PDF generated instantly from any text",
      "No signup, no watermark, no upload",
      "Works offline once the page has loaded",
    ],
    howTo: [
      "Paste or type your text into the input box.",
      "Press Execute to generate the PDF.",
      "Download the result and rename it with a .pdf extension if needed.",
    ],
    faqs: [
      {
        question: "How do I save the generated PDF?",
        answer:
          "Use the Download button to save the result, then make sure the file ends with .pdf so readers open it correctly.",
      },
      {
        question: "Is my text uploaded anywhere?",
        answer: "No. The PDF is generated locally in your browser from the text you enter.",
      },
    ],
    related: ["word-counter", "case-converter", "text-cleaner", "slug-generator"],
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
  "loan-payment-calculator": {
    title: "Loan Payment Calculator — Monthly Payments & Interest | RovoTools",
    description:
      "Estimate monthly loan payments and total interest from the loan amount, annual rate and term. Transparent amortising-loan formula, free.",
    intro:
      "Estimate monthly loan payments and total interest. Enter the loan amount, annual interest rate and term in years to see the monthly payment and overall cost.",
    benefits: [
      "Standard amortising-loan formula with full transparency",
      "Monthly payment plus total interest over the term",
      "Compare scenarios privately — no signup, no data sharing",
    ],
    howTo: [
      "Enter the loan amount (principal).",
      "Enter the annual interest rate as a percent.",
      "Enter the term in years, then press Execute.",
      "Compare the monthly payment and total interest across scenarios.",
    ],
    faqs: [
      {
        question: "How are monthly payments calculated?",
        answer:
          "With the standard amortising-loan formula M = P × r(1+r)^n / ((1+r)^n − 1), where P is the principal, r the monthly rate and n the number of payments.",
      },
      {
        question: "What is the difference between this and an EMI calculator?",
        answer:
          "EMI (equated monthly instalment) is the term commonly used in some markets, such as India, for the same fixed monthly loan payment this calculator computes.",
      },
    ],
    related: ["emi-calculator", "compound-interest-calculator", "discount-calculator", "percentage-calculator"],
  },
  "emi-calculator": {
    title: "EMI Calculator — Loan EMI Online | RovoTools",
    description:
      "Calculate your loan EMI (equated monthly instalment) from principal, rate and term. See the monthly payment and total interest instantly.",
    intro:
      "Calculate your equated monthly instalment (EMI) for a loan. EMI is the fixed amount you pay each month — the term commonly used in markets such as India for the periodic payment on an amortising loan.",
    benefits: [
      "Fixed monthly EMI from principal, rate and term",
      "Total interest shown alongside the instalment",
      "Same transparent formula as the Loan Payment Calculator",
      "Private modelling — figures never leave your device",
    ],
    howTo: [
      "Enter the loan principal amount.",
      "Enter the annual interest rate as a percent.",
      "Enter the term, then press Execute to see your EMI and total interest.",
    ],
    faqs: [
      {
        question: "What does EMI mean?",
        answer:
          "EMI stands for equated monthly instalment: the fixed payment you make every month toward a loan, covering both interest and principal.",
      },
      {
        question: "How is EMI different from the Loan Payment Calculator?",
        answer:
          "They compute the same amortising payment. Use whichever name you prefer — both pages cross-link so you can compare.",
      },
    ],
    related: ["loan-payment-calculator", "compound-interest-calculator", "discount-calculator", "percentage-calculator"],
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
