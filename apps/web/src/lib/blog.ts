export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly date: string;
  readonly category: string;
  readonly body: ReadonlyArray<string>;
  readonly relatedTools: ReadonlyArray<string>;
}

export const BLOG_POSTS: ReadonlyArray<BlogPost> = [
  {
    slug: "bmi-explained",
    title: "What Your BMI Actually Tells You",
    excerpt: "How body mass index is calculated, what the categories mean, and its limits.",
    date: "2026-08-02",
    category: "Health",
    relatedTools: ["bmi-calculator", "average-calculator"],
    body: [
      "Body mass index (BMI) estimates body fat from weight and height with one shared formula: weight in kilograms divided by height in metres squared. A 70 kg person who is 1.75 m tall has a BMI of 70 / (1.75 × 1.75) ≈ 22.9.",
      "The standard adult categories are: under 18.5 underweight, 18.5–24.9 healthy range, 25–29.9 overweight, and 30 or above obesity. These cut-offs come from population studies linking BMI ranges to health risk, not from any single ideal body shape.",
      "To use it well, measure in the morning, use consistent units, and treat small day-to-day changes as noise — hydration and meals move the number more than fat changes do.",
      "RovoTools computes BMI locally in your browser with the BMI Calculator: nothing you type leaves your device, and the result appears instantly with its category.",
      "Know the limits. BMI cannot distinguish muscle from fat, so athletes often score as overweight while carrying little body fat. It also underestimates risk in older adults who have lost muscle, and the cut-offs fit some ethnic backgrounds less well.",
      "Use BMI as a screening signal, not a diagnosis. If your result surprises you, track waist circumference too, look at trends over months rather than days, and discuss concerns with a clinician.",
    ],
  },
  {
    slug: "loan-interest-basics",
    title: "How Loan Interest Really Works",
    excerpt: "Amortization, monthly payments, and why early payments save so much interest.",
    date: "2026-07-14",
    category: "Finance",
    relatedTools: ["loan-calculator", "compound-interest-calculator"],
    body: [
      "Each monthly loan payment splits into two parts: interest on the remaining balance plus principal reduction. Early in the loan, most of your payment is interest; later, most of it reduces principal. This schedule is called amortization.",
      "The standard amortising-loan formula is M = P × r(1+r)^n / ((1+r)^n − 1), where P is the principal, r the monthly rate and n the number of payments. RovoTools applies exactly this formula in the Loan Calculator.",
      "Because interest accrues on the outstanding balance, extra principal payments compound your savings: every dollar paid early stops earning interest for the lender for the rest of the term. Even one extra payment a year can cut years off a mortgage.",
      "Try this experiment: enter your loan in the Loan Calculator, note the total interest, then reduce the term by two years and compare. The monthly rise is usually smaller than people expect, while the interest saving is large.",
      "Watch the annual percentage rate (APR), not just the headline rate — APR includes fees and reflects the true yearly cost. Fixed rates give certainty; variable rates start cheaper but can rise.",
      "All RovoTools finance calculators run locally in your browser, so you can model scenarios privately without signing up or sharing financial details.",
    ],
  },
  {
    slug: "tipping-guide",
    title: "A Practical Guide to Tipping and Splitting Bills",
    excerpt: "Standard percentages, per-person math, and edge cases like tax and discounts.",
    date: "2026-06-20",
    category: "Everyday",
    relatedTools: ["tip-calculator", "discount-calculator"],
    body: [
      "A 15 to 20 percent tip covers most restaurant service in many regions, with 20 percent the common default for good service in the US. For takeaway counters or buffets, 10 percent is typical — and there is no obligation where service staff earn full wages.",
      "The fair order of operations is: start from the pre-tax subtotal, compute the tip, add it to get the total, then split evenly. Splitting after tip means everyone shares the gratuity fairly instead of penalising whoever does the math.",
      "Discounts and coupons need care: tip on the pre-discount subtotal, because the kitchen and server did the full work. The Discount Calculator shows the sale price while you keep the original amount for the tip base.",
      "For uneven orders — one person had steak, another salad — split shared items (tax, tip, appetisers) evenly, assign individual mains, then sum each share. Rounding each share up to the nearest dollar usually covers the tip gap.",
      "The RovoTools Tip Calculator does this transparently: enter the bill, the percentage and the headcount, and it shows tip, total and per-person amounts instantly, all computed on your device.",
    ],
  },
  {
    slug: "what-is-base64",
    title: "What Is Base64 and When Should You Use It?",
    excerpt: "A plain-English guide to Base64 encoding with everyday examples.",
    date: "2026-08-20",
    category: "Developers",
    relatedTools: ["base64-encoder", "base64-decoder"],
    body: [
      "Base64 is a way to represent arbitrary bytes using only 64 safe text characters (A–Z, a–z, 0–9, + and /). It exists because many systems — email headers, URLs, JSON payloads — only reliably transport plain text.",
      "The trade-off is size: Base64 output is roughly 33 percent larger than the input. It is an encoding, not encryption — anyone can decode it, so never use it to hide secrets.",
      "Common uses include embedding small images directly in HTML or CSS as data URLs, transmitting binary attachments in JSON APIs, and storing tokens such as JWT segments (which use a URL-safe Base64 variant).",
      "To try it, paste any text into the Base64 Encoder and decode it back with the Base64 Decoder. Both run entirely in your browser, so even sensitive strings never leave your device.",
      "Watch for padding: Base64 strings often end with one or two = signs. If decoding fails, check for missing padding or line breaks introduced by copy-paste.",
    ],
  },
  {
    slug: "how-jwt-tokens-work",
    title: "How JWT Tokens Work (and How to Inspect Them Safely)",
    excerpt: "Header, payload, signature — and why you should never paste tokens into random sites.",
    date: "2026-08-28",
    category: "Developers",
    relatedTools: ["jwt-decoder", "base64-decoder", "timestamp-converter"],
    body: [
      "A JSON Web Token (JWT) has three dot-separated parts: header, payload and signature. The header names the algorithm, the payload carries claims like user id and expiry, and the signature proves the token was issued by someone holding the secret key.",
      "The first two parts are only Base64URL-encoded, not encrypted — anyone with the token can read them. The signature can only be verified with the secret, which is why decoding a token never proves it is valid.",
      "Typical payload claims include sub (subject), iat (issued-at), exp (expiry as a Unix timestamp) and iss (issuer). You can convert exp with the Timestamp Converter to see exactly when a token expires.",
      "Safety rules: never paste production tokens into untrusted decoder sites, because the token is a live credential. Prefer local tools — the RovoTools JWT Decoder runs fully in your browser and explicitly does not verify signatures.",
      "If a token leaks, revoke it server-side immediately: decoding cannot undo exposure. Keep lifetimes short and store tokens away from JavaScript where possible (httpOnly cookies).",
    ],
  },
  {
    slug: "how-to-compress-pdf",
    title: "How to Compress a PDF Without Ruining Quality",
    excerpt: "Why PDFs get big and the practical levers that shrink them.",
    date: "2026-09-01",
    category: "PDF",
    relatedTools: ["pdf-creator"],
    body: [
      "PDFs get large for predictable reasons: high-resolution images, embedded fonts, uncompressed scans and duplicated resources. Knowing which one dominates your file tells you which lever to pull.",
      "For scanned documents, the biggest win is downsampling images to the resolution you actually need — 150 DPI is plenty for on-screen reading, 300 DPI for print. Re-saving with JPEG quality around 70–80 usually halves image weight invisibly.",
      "For digitally created PDFs, subset embedded fonts (include only used glyphs), flatten transparency before export, and prefer vector graphics over screenshots of charts.",
      "If you only need a few pages, extract them instead of compressing the whole file: fewer pages always beat cleverer compression.",
      "Need a fresh lightweight PDF? The RovoTools PDF Creator tool generates a clean PDF from plain text entirely in your browser — ideal for notes, letters and simple documents.",
    ],
  },
  {
    slug: "jpg-to-pdf-guide",
    title: "How to Convert JPG to PDF (and When Image-to-PDF Makes Sense)",
    excerpt: "From photos to shareable documents: the right settings and order of operations.",
    date: "2026-09-05",
    category: "PDF",
    relatedTools: ["pdf-creator", "svg-placeholder-generator"],
    body: [
      "Converting a JPG to PDF wraps the image in a document container so it prints predictably, keeps page order, and opens everywhere without photo apps. It does not improve image quality — the photo stays exactly as sharp as it was.",
      "For multi-photo documents, sort images first, keep orientation consistent, and aim for one image per page with modest margins. Mixed orientations force readers to rotate pages.",
      "Watch file size: phone photos at full resolution produce enormous PDFs. Resize images so their pixel width roughly matches the print width times 150–200 DPI before converting.",
      "For text-heavy originals, a photo-PDF is not searchable. If the content matters more than the look, retype or paste the text and generate a real text PDF instead — the RovoTools PDF Creator tool creates one locally in seconds.",
    ],
  },
  {
    slug: "reduce-image-size",
    title: "How to Reduce Image File Size for the Web",
    excerpt: "Format choice, dimensions and compression: the three levers that matter.",
    date: "2026-09-08",
    category: "Images",
    relatedTools: ["svg-placeholder-generator", "color-converter"],
    body: [
      "Three levers control image weight: format, dimensions and compression. In that order, they typically beats any single clever trick.",
      "Choose the format by content: JPEG for photos, PNG for graphics with sharp edges or transparency, WebP or AVIF when browser support allows (both beat JPEG at equal quality), and SVG for logos and icons.",
      "Serve the dimensions you display. A 4000 px photo shown at 800 px wastes roughly 25× the bytes. Resize first, then compress — compression works far better on correctly sized images.",
      "For placeholders and mockups, skip bytes entirely: the RovoTools SVG Placeholder Generator creates tiny resolution-independent placeholders as data URLs, generated locally with your exact size, colors and label.",
      "Finally, strip metadata (camera EXIF data adds kilobytes and can leak location), prefer progressive JPEG for large hero images, and always compare before/after at 100 percent zoom before shipping.",
    ],
  },
  {
    slug: "how-to-format-json",
    title: "How to Format JSON (and Debug It When It Breaks)",
    excerpt: "Pretty-printing, validation errors, and the commas that ruin everything.",
    date: "2026-09-10",
    category: "Developers",
    relatedTools: ["json-formatter", "json-validator", "json-minifier"],
    body: [
      "Formatted (pretty-printed) JSON uses indentation and line breaks so humans can scan structure; minified JSON removes all optional whitespace so machines transfer fewer bytes. They carry identical data.",
      "When JSON breaks, the culprit is almost always a trailing comma, a single-quoted string, an unescaped quote inside a string, or a comment pasted from documentation. Validators point at the position where parsing failed — look just before it.",
      "A reliable workflow: paste the payload into the JSON Formatter to pretty-print and pinpoint errors, fix them, then run the JSON Validator to confirm, and finally the JSON Minifier before sending the payload to an API.",
      "For configuration files, keep a canonical formatted copy in version control and minify only at build or deploy time — diffs of minified files are unreadable.",
      "All three RovoTools JSON utilities parse locally in your browser, so API keys and private payloads in your JSON never travel anywhere.",
    ],
  },
  {
    slug: "how-to-create-qr-code",
    title: "How to Create a QR Code That Actually Scans",
    excerpt: "Payload formats for URLs, WiFi and contacts, plus print-size rules.",
    date: "2026-09-11",
    category: "Guides",
    relatedTools: ["url-qr-generator", "wifi-qr-generator", "vcard-qr-generator", "text-qr-generator"],
    body: [
      "A QR code is just a visual container for a short text payload. URL codes hold the link itself, WiFi codes use the format WIFI:T:WPA;S:network;P:password;;, and contact codes hold a vCard. The RovoTools QR generators build these exact payloads for you locally.",
      "Shorter payloads scan more reliably because they produce simpler patterns. Use https links without tracking parameters, and keep WiFi passwords free of unusual characters where possible.",
      "Size matters in print: a QR code should be at least 2 × 2 cm on paper, larger on posters viewed from distance. Always leave quiet-zone whitespace around it — patterns that run to the edge of a design often fail.",
      "Test before publishing: scan with both an iPhone and an Android camera app, in the actual lighting where it will hang, from the actual distance. Screens, glossy lamination and curved surfaces all degrade scanning.",
      "Never encode secrets or session URLs that expire — anyone who photographs the code can reuse the payload indefinitely.",
    ],
  },
  {
    slug: "compound-interest-explained",
    title: "Compound Interest Explained With Real Numbers",
    excerpt: "Why starting early beats saving more, shown step by step.",
    date: "2026-09-12",
    category: "Finance",
    relatedTools: ["compound-interest-calculator", "loan-calculator", "roi-calculator"],
    body: [
      "Compound interest means each period's interest itself earns interest next period. The formula is A = P(1 + r/n)^(nt): principal times one plus the per-period rate, raised to the number of periods.",
      "The math rewards time more than amount. Saving $200 a month from age 25 to 35 ($24,000 total) at 7 percent grows to roughly the same as saving $200 a month from 35 to 65 ($72,000 total) — a decade of compounding outweighs triple the contributions.",
      "Compounding frequency matters less than people think: monthly versus daily compounding on the same nominal rate differs by fractions of a percent. The rate and the time horizon dominate.",
      "Costs compound too. A 1 percent annual fee on the same portfolio quietly consumes nearly a third of returns over 40 years. Model both sides with the Compound Interest Calculator, then compare investments with the ROI Calculator.",
      "Debt is compounding in reverse: credit-card balances grow by the same exponential curve. The Loan Calculator shows how much of each payment is interest, which is why overpaying early saves the most.",
    ],
  },
  {
    slug: "pdf-format-guide",
    title: "The PDF Format, Explained Simply",
    excerpt: "What a PDF actually contains and why it prints the same everywhere.",
    date: "2026-09-06",
    category: "PDF",
    relatedTools: ["pdf-creator"],
    body: [
      "A PDF is a self-contained document: text, fonts (or subsets), vector drawings and images, plus a cross-reference table so readers can jump to any page instantly. That self-containment is why a PDF prints identically on any machine.",
      "Text in a PDF is positioned glyph by glyph with coordinates, unlike HTML which flows. This precision is what makes PDFs print-perfect — and what makes reflowing them on small screens awkward.",
      "Fonts are the classic gotcha: a PDF that references but does not embed a font renders with a substitute on other machines. Embedding (or subsetting) fonts fixes it at the cost of file size.",
      "Real PDFs come in flavors: born-digital PDFs with selectable text, scanned image-only PDFs that need OCR to become searchable, and tagged accessible PDFs with reading order for screen readers.",
      "You can see the format in action with the RovoTools PDF Creator tool, which writes a real downloadable PDF directly in your browser — a good mental model of the format with no server involved.",
    ],
  },
  {
    slug: "image-format-comparison",
    title: "JPEG vs PNG vs WebP vs SVG: Which Image Format When?",
    excerpt: "A practical decision guide with no jargon.",
    date: "2026-09-09",
    category: "Images",
    relatedTools: ["svg-placeholder-generator"],
    body: [
      "JPEG uses lossy compression tuned for photographs: smooth gradients compress beautifully, but sharp text and logos develop visible artefacts. Use it for photos, never for screenshots of text.",
      "PNG is lossless with sharp edges and transparency, at the price of large files for photographic content. Use it for UI graphics, logos with transparency, and images containing text.",
      "WebP (and AVIF where supported) beat both for web delivery — typically 25–35 percent smaller than JPEG at equal quality — with transparency and animation included. Serve them with a JPEG fallback for very old clients.",
      "SVG is not a photo format at all: it describes shapes as code, so logos and icons stay razor-sharp at any size in a few hundred bytes. The SVG Placeholder Generator shows how expressive tiny SVGs can be.",
      "Decision shortcut: photo → WebP/JPEG, graphic with transparency → PNG/WebP, logo or icon → SVG, animation → WebP/MP4 over GIF.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
