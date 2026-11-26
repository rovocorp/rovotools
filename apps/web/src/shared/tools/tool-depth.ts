import type { ToolDepth, ToolPageCopy } from "./seo-copy";

// Hand-written decks for tools that previously fell back to template copy.
// These are indexable tools, so they get the full page structure: intro,
// benefits, how-to, a worked example, use cases, limitations and FAQs.
export const EXTRA_TOOL_COPY: Record<string, ToolPageCopy> = {
  "css-box-shadow-generator": {
    intro:
      "The CSS Box Shadow Generator turns an x/y offset, blur, spread and colour into a ready-to-paste box-shadow value. Use it to add depth to cards, buttons and modals without hand-tuning the syntax.",
    benefits: [
      "Produces a standards-compliant box-shadow value you can paste anywhere",
      "Accepts any CSS colour, including rgba with transparency",
      "No framework required — works in plain CSS, a style prop or arbitrary values",
    ],
    howTo: [
      "Set the horizontal and vertical offsets in pixels; positive x moves the shadow right and positive y moves it down.",
      "Add blur and spread — a larger blur softens the edge, while spread expands the shadow before it is blurred.",
      "Pick a colour with alpha, for example rgba(0,0,0,0.15), then copy the generated CSS.",
    ],
    faqs: [
      {
        question: "What order do the box-shadow values go in?",
        answer:
          "box-shadow takes offset-x, offset-y, blur-radius, spread-radius and colour, in that order. The generated value follows that order so it is valid as-is.",
      },
      {
        question: "Why does my shadow look clipped?",
        answer:
          "A parent element with overflow hidden clips the shadow. Remove the overflow rule or add padding so the shadow has room to render.",
      },
    ],
    related: ["css-border-radius-generator", "css-button-generator", "css-gradient-generator"],
    useCases: [
      "Prototyping card and button elevation before adding it to a design system",
      "Creating a soft, realistic shadow when you cannot remember the syntax",
      "Matching an existing shadow from a screenshot by adjusting offset and blur",
    ],
    limitations: [
      "It generates CSS only; you still apply it to an element yourself",
      "Browsers can render very large blur values slightly differently",
      "Shadows do not affect layout, so they can overlap neighbouring elements",
    ],
    example: {
      steps: ["Set x=0, y=8, blur=24, spread=0 and colour rgba(0,0,0,0.15)."],
      result:
        "The output is box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.15); — a soft shadow that sits below the element.",
    },
  },
  "diff-checker": {
    intro:
      "Diff Checker compares two blocks of text and shows which lines were added or removed. It is handy for reviewing an edit, checking a config change or confirming that two lists match.",
    benefits: [
      "Line-by-line - and + markers make changes obvious",
      "Handles multi-line text as large as your browser can hold",
      "Runs locally, so drafts and snippets stay on your device",
    ],
    howTo: [
      "Paste the original text in the first box and the modified text in the second.",
      "Run the comparison — unchanged lines are skipped, removed lines start with -, added lines with +.",
      "Use the summary and counts to confirm how many lines differ before you commit.",
    ],
    faqs: [
      {
        question: "Does it ignore whitespace or case?",
        answer:
          "No — every line is compared exactly, so a trailing space or different capitalisation counts as a change.",
      },
      {
        question: "Can I compare files?",
        answer:
          "Open each file, copy its text into the boxes and run the comparison. It compares text, not binary file contents.",
      },
    ],
    related: ["json-formatter", "json-validator", "text-cleaner"],
    useCases: [
      "Reviewing what changed between two versions of a config or script",
      "Checking whether two exports or lists are identical",
      "Spotting accidental edits before pasting content into production",
    ],
    limitations: [
      "It compares whole lines, not characters inside a line, so a single-word edit marks the whole line as changed",
      "Very large inputs are limited by available browser memory",
      "It does not understand code structure or reorderings",
    ],
    example: {
      steps: [
        "Original text lists red, blue, green — one colour per line.",
        "Modified text replaces green with yellow.",
      ],
      result:
        "The diff marks green as removed and yellow as added, and reports one removed plus one added line.",
    },
  },
  "duplicate-line-remover": {
    intro:
      "Duplicate Line Remover strips repeated lines from a list while keeping the first occurrence in its original position. Use it to clean exported lists, keyword sets and log excerpts.",
    benefits: [
      "Preserves the original order of the remaining lines",
      "Optional case-sensitive matching",
      "Reports how many duplicate lines were removed",
    ],
    howTo: [
      "Paste one entry per line into the input box.",
      "Choose whether matching should be case sensitive; turn it off to treat 'Apple' and 'apple' as duplicates.",
      "Run the tool and copy the deduplicated list.",
    ],
    faqs: [
      {
        question: "Which copy is kept?",
        answer: "The first occurrence is kept and later duplicates are removed.",
      },
      {
        question: "Does it trim spaces?",
        answer:
          "No — lines are compared as written, so 'x' and 'x ' differ. Remove stray whitespace first if that matters.",
      },
    ],
    related: ["empty-line-remover", "text-cleaner", "word-counter"],
    useCases: [
      "Deduplicating an exported email or keyword list",
      "Cleaning a log extract before sharing it",
      "Removing repeated options from a generated list",
    ],
    limitations: [
      "It compares whole lines, not substrings within a line",
      "It does not sort; sort first if you need sorted unique values",
      "Very large lists depend on browser memory",
    ],
    example: {
      steps: [
        "Paste alpha, beta, alpha, gamma, beta — one per line.",
        "Leave case-sensitive matching on and run.",
      ],
      result:
        "The output is alpha, beta, gamma. The second alpha and second beta are removed and the tool reports 2 duplicates removed.",
    },
  },
  "favicon-generator": {
    intro:
      "Favicon Generator turns a single square image into the icon sizes browsers and devices request — including 16, 32 and 48 px favicons and Apple touch icons — and gives you the HTML to paste into your head.",
    benefits: [
      "All common sizes generated from one source image",
      "Includes the markup so you do not miss a size",
      "Runs in your browser; the image is never uploaded",
    ],
    howTo: [
      "Upload a square image, ideally at least 512×512 with a simple design that stays readable when small.",
      "Generate the set and download the files into your site's public folder.",
      "Paste the provided HTML into the head of your pages and clear the browser cache to see the change.",
    ],
    faqs: [
      {
        question: "Why does my favicon still look old?",
        answer:
          "Browsers cache favicons aggressively. Hard-refresh, open the site in a private window, or replace the files with new names to bust the cache.",
      },
      {
        question: "What image should I start with?",
        answer:
          "A square PNG or SVG with generous padding. Detailed artwork becomes mush at 16 px, so favour a bold, simple mark.",
      },
    ],
    related: ["image-resizer", "image-converter", "svg-placeholder-generator"],
    useCases: [
      "Giving a new site a complete set of browser and home-screen icons",
      "Replacing mismatched or blurry favicons with one consistent source",
      "Generating Apple touch icons without a separate step",
    ],
    limitations: [
      "It cannot add detail — a complex logo will still be unclear at small sizes",
      "It runs in the browser and needs the image to stay on the page while generating",
      "You still upload the output and update your HTML",
    ],
    example: {
      steps: [
        "Upload a 512×512 square PNG with a bold, simple mark.",
        "Generate the set and download the files.",
        "Paste the provided link tags into the page head.",
      ],
      result:
        "You get the icon files plus markup such as a link rel=\"icon\" tag for each size, ready to paste into your head.",
    },
  },
  "json-to-typescript": {
    intro:
      "JSON to TypeScript reads a sample JSON object and generates a TypeScript interface with matching property names and inferred types. It saves hand-writing types when you wire an API response into a typed codebase.",
    benefits: [
      "Infers string, number, boolean, array and nested object types",
      "Names the interface whatever you choose",
      "No upload — the JSON stays in your browser",
    ],
    howTo: [
      "Paste a representative JSON object, including the optional fields you expect to see.",
      "Set the interface name, for example User or ApiResponse.",
      "Copy the generated interface into your project and review union types and optional fields by hand.",
    ],
    faqs: [
      {
        question: "Does it mark optional fields?",
        answer:
          "It infers from the sample only, so a field missing from your sample will not appear. Add optional fields manually.",
      },
      {
        question: "Can it handle arrays of objects?",
        answer:
          "Yes — it describes the element type. A mixed array may fall back to a union or any, which you should refine.",
      },
    ],
    related: ["json-formatter", "json-validator", "json-minifier"],
    useCases: [
      "Bootstrapping types for an API response you are integrating",
      "Turning a config example into a typed shape",
      "Speeding up typed mocks in tests",
    ],
    limitations: [
      "It infers from one sample, so unions, nullability and optional fields need review",
      "It produces types, not runtime validation",
      "Fields that are always null in the sample may be typed loosely",
    ],
    example: {
      steps: [
        "Paste a sample such as { \"id\": 1, \"name\": \"Ada\", \"admin\": true }.",
        "Set the interface name to User and run.",
      ],
      result:
        "The tool outputs an interface with id: number, name: string and admin: boolean.",
    },
  },
  "lorem-ipsum-generator": {
    intro:
      "Lorem Ipsum Generator produces placeholder paragraphs, sentences or words for mockups and layouts. Generate enough text to see how a design behaves with realistic line lengths, then replace it with real copy before publishing.",
    benefits: [
      "Choose paragraphs, sentences or words",
      "Classic Latin filler that will not distract reviewers with meaning",
      "Generated locally with no signup",
    ],
    howTo: [
      "Choose the unit — paragraphs, sentences or words — and how many you need.",
      "Generate the text.",
      "Paste it into your design and replace every block before launch.",
    ],
    faqs: [
      {
        question: "Why use Latin instead of English?",
        answer:
          "Latin filler looks like text without inviting reviewers to read it, so they focus on layout instead of wording.",
      },
      {
        question: "Will this hurt SEO if it ships?",
        answer:
          "Yes. Placeholder text left in production is thin, meaningless content. Always replace it before publishing.",
      },
    ],
    related: ["word-counter", "text-cleaner", "case-converter"],
    useCases: [
      "Filling a new page layout before the copywriter delivers",
      "Testing how long paragraphs wrap in a component",
      "Producing sample rows for a table or card grid",
    ],
    limitations: [
      "It is not real content and must be removed before publishing",
      "It does not reflect the tone or length of your final copy",
      "Search engines treat leftover filler as low-value content",
    ],
    example: {
      steps: ["Choose paragraphs, set the count to 3, and generate."],
      result:
        "You get three paragraphs of Latin filler sized to resemble normal body copy.",
    },
  },
  "random-number-generator": {
    intro:
      "Random Number Generator produces unbiased random integers in a range you choose, using the browser's cryptographic random source. It suits picking winners, sampling rows or generating test values.",
    benefits: [
      "Uses cryptographically secure randomness, not Math.random",
      "Choose the minimum, maximum and how many numbers you need",
      "Runs locally, so nothing is transmitted",
    ],
    howTo: [
      "Enter the minimum and maximum values; both ends of the range are included.",
      "Set how many numbers you need, up to the tool's per-run limit.",
      "Generate and copy the list.",
    ],
    faqs: [
      {
        question: "Are duplicates possible?",
        answer:
          "Yes. Values are drawn independently, so repeats can occur unless you generate unique selections yourself.",
      },
      {
        question: "Is it suitable for gambling or cryptography?",
        answer:
          "It uses secure randomness, but do not rely on any web page for regulated gambling or key generation.",
      },
    ],
    related: ["random-token-generator", "password-generator", "uuid-generator"],
    useCases: [
      "Picking a random winner or sample from a numbered list",
      "Generating test data within a known range",
      "Making a choice where bias must be avoided",
    ],
    limitations: [
      "Each number is independent, so the list may contain duplicates",
      "The per-run count is capped for usability",
      "The page must stay open; results are not stored",
    ],
    example: {
      steps: ["Set minimum 1, maximum 100 and count 5."],
      result:
        "Five integers between 1 and 100 inclusive, for example 17, 4, 88, 23 and 61.",
    },
  },
  "random-token-generator": {
    intro:
      "Random Token Generator creates hexadecimal tokens from the browser's cryptographic random source. Use it for non-production test secrets, mock API keys and sample identifiers — not as a replacement for a vetted secrets manager.",
    benefits: [
      "Cryptographically secure random bytes",
      "Choose the length in bytes; hex output is twice as long",
      "Runs entirely on your device",
    ],
    howTo: [
      "Choose how many random bytes to use; 32 bytes produces a 64-character hex token.",
      "Generate the token.",
      "Copy it into your development config and discard it when testing is done.",
    ],
    faqs: [
      {
        question: "How long is the token?",
        answer:
          "Each byte becomes two hex characters, so 32 bytes yields 64 characters.",
      },
      {
        question: "Should I use this for production keys?",
        answer:
          "Prefer your platform's secret manager. Generating keys on a web page is fine for tests but not a hardened key store.",
      },
    ],
    related: ["random-number-generator", "password-generator", "uuid-generator"],
    useCases: [
      "Creating placeholder API keys for local tests",
      "Making unique IDs for mock data",
      "Generating throwaway tokens for a demo",
    ],
    limitations: [
      "It produces hex only, not base64 or UUID formats",
      "Tokens are shown on the page and are not saved",
      "It is not a substitute for a dedicated secrets manager in production",
    ],
    example: {
      steps: ["Set bytes to 16 and generate."],
      result:
        "A 32-character hex string you can use as a test token.",
    },
  },
  "robots-txt-generator": {
    intro:
      "Robots.txt Generator assembles a valid robots.txt for common platforms — WordPress, Blogger and Shopify — and adds the sitemap line crawlers look for. Use it to get the syntax right before uploading the file to your site root.",
    benefits: [
      "Presets for popular platforms reduce mistakes",
      "Adds Allow and Disallow rules plus the Sitemap directive",
      "Output is plain text you can save as robots.txt",
    ],
    howTo: [
      "Pick a preset or start custom.",
      "Enter your sitemap URL and any extra Allow or Disallow paths, one per line.",
      "Copy the output, save it as robots.txt in your site root, and test it with a robots checker.",
    ],
    faqs: [
      {
        question: "Does robots.txt block a page from Google?",
        answer:
          "It stops crawling, not indexing. Use noindex to remove a page from results, and do not block the page that carries the noindex tag.",
      },
      {
        question: "Where does robots.txt go?",
        answer:
          "At the root of the domain, for example https://example.com/robots.txt.",
      },
    ],
    related: ["robots-txt-checker", "sitemap-checker", "meta-tag-generator"],
    useCases: [
      "Setting sane crawler rules on a new WordPress or Shopify store",
      "Adding a sitemap line so crawlers can discover it",
      "Blocking admin or internal search paths from crawling",
    ],
    limitations: [
      "It generates a file; you must upload it and keep it current",
      "Robots rules are advisory and ignored by some bots",
      "It cannot know which paths are private on your site",
    ],
    example: {
      steps: [
        "Choose the WordPress preset.",
        "Enter https://example.com/sitemap.xml.",
        "Generate and copy the output.",
      ],
      result:
        "A robots.txt with platform rules and a Sitemap: https://example.com/sitemap.xml line.",
    },
  },
  "svg-placeholder-generator": {
    intro:
      "SVG Placeholder Generator creates a lightweight placeholder image as an inline SVG data URL. Use it to reserve image space while assets load, or to mock a layout without shipping a binary file.",
    benefits: [
      "Produces a data URL you can drop straight into an image source",
      "Much smaller than a raster placeholder",
      "Choose size, colours and an optional label",
    ],
    howTo: [
      "Set the width and height in pixels to match the slot.",
      "Pick a background and text colour and add an optional label.",
      "Copy the data URL or the HTML snippet into your markup.",
    ],
    faqs: [
      {
        question: "Will it affect layout shift?",
        answer:
          "If you size it to the final dimensions, it reserves the space and reduces layout shift while the real image loads.",
      },
      {
        question: "Can I use it in CSS?",
        answer:
          "Yes. The data URL works in background-image as well as in an image source.",
      },
    ],
    related: ["image-resizer", "image-converter", "favicon-generator"],
    useCases: [
      "Reserving space for lazy-loaded images",
      "Mocking image slots in a prototype",
      "A dependency-free placeholder for demos",
    ],
    limitations: [
      "It is a flat placeholder, not a real image",
      "Data URLs bloat HTML if reused many times, so reference them sparingly",
      "Some email clients strip data URLs",
    ],
    example: {
      steps: [
        "Set width 600, height 400, background #e5e7eb and label 'Preview'.",
        "Copy the generated data URL.",
      ],
      result:
        "A compact data:image/svg+xml URL that renders a 600×400 grey box with the label centred.",
    },
  },
  "url-validator": {
    intro:
      "URL Validator checks whether a string parses as a well-formed URL and breaks it into protocol, host and path. It validates syntax only — it does not confirm that the page exists or is reachable.",
    benefits: [
      "Catches missing schemes and malformed hosts",
      "Shows the parsed protocol, host and path",
      "Runs locally with no network request",
    ],
    howTo: [
      "Paste the URL you want to check.",
      "Run the validator.",
      "Read the valid flag and the parsed parts; fix the scheme or host if it is rejected.",
    ],
    faqs: [
      {
        question: "Does a valid URL mean the site is live?",
        answer:
          "No. This checks syntax only. Use a link checker to test reachability.",
      },
      {
        question: "Are ftp or mailto links valid?",
        answer:
          "They may parse, but this validator reports http and https as valid for web links.",
      },
    ],
    related: ["email-validator", "url-encoder", "url-decoder"],
    useCases: [
      "Checking user-supplied links before storing them",
      "Confirming a pasted URL has the right scheme",
      "Debugging why a link does not open",
    ],
    limitations: [
      "A syntax-valid URL does not mean it is reachable or safe",
      "It does not resolve redirects or check TLS",
      "Internationalised domains may be shown in punycode",
    ],
    example: {
      steps: ["Validate https://example.com/path?q=1."],
      result:
        "valid: true, protocol: https, host: example.com, with a detail confirming the syntax looks correct.",
    },
  },
  "wifi-qr-generator": {
    intro:
      "WiFi QR Generator builds the WIFI: payload that lets guests join a network by scanning a QR code. Print it on a card in a café, office or rental so visitors do not have to type a long password.",
    benefits: [
      "Encodes the network name, password and security type correctly",
      "Supports WPA, WEP and open networks",
      "Runs locally; the password is not uploaded",
    ],
    howTo: [
      "Enter the network name (SSID) exactly as it appears.",
      "Add the password and choose the security type; leave the password empty for an open network.",
      "Generate the payload, then render it with a QR tool or your signage software.",
    ],
    faqs: [
      {
        question: "Is it safe to show the password in a QR code?",
        answer:
          "Anyone who scans it can join. Place it where only intended guests can see it, and rotate the password if the code leaks.",
      },
      {
        question: "Why does my phone not join?",
        answer:
          "Check the SSID spelling, the security type and whether the network is hidden.",
      },
    ],
    related: ["text-qr-generator", "url-qr-generator", "vcard-qr-generator"],
    useCases: [
      "Guest WiFi cards for cafés, offices and holiday rentals",
      "Sharing a network without reading out a long password",
      "Onboarding signage in a shared workspace",
    ],
    limitations: [
      "It outputs the WIFI payload; you still need a QR renderer or printer",
      "Hidden networks may need extra configuration",
      "Scanning joins the network but does not bypass a captive portal",
    ],
    example: {
      steps: [
        "SSID 'CafeGuest', password 'latte2026', security WPA.",
        "Generate the payload.",
      ],
      result:
        "WIFI:T:WPA;S:CafeGuest;P:latte2026;; which a QR renderer turns into a scannable join code.",
    },
  },
  "csv-to-json": {
    intro:
      "CSV to JSON converts a comma-separated table into a JSON array, using the first row as the property names. Paste a spreadsheet export and get clean, pretty-printed JSON you can drop into code, a test fixture or an API request.",
    benefits: [
      "Uses the header row as keys, so the output is self-describing",
      "Pretty-prints the JSON with two-space indentation",
      "Runs in your browser — pasted data never leaves the device",
    ],
    howTo: [
      "Paste CSV text whose first line contains the column headers.",
      "Press Execute to parse every following row into an object.",
      "Copy the JSON array and use it in your code or import it elsewhere.",
    ],
    faqs: [
      {
        question: "Does it handle quoted values that contain commas?",
        answer:
          "Not currently. The converter splits on commas, so a field such as an address with a comma needs cleaning or a dedicated CSV parser before converting.",
      },
      {
        question: "Why are all the values strings?",
        answer:
          "CSV carries no type information. Numbers and booleans arrive as text, so convert the fields your code needs to numbers explicitly.",
      },
    ],
    related: ["json-to-csv", "json-formatter", "json-validator"],
    useCases: [
      "Turning a spreadsheet export into JSON fixtures for a test suite",
      "Preparing tabular analytics data for a JavaScript chart",
      "Converting a small CSV list into an API request body",
    ],
    limitations: [
      "Expects simple comma-separated rows with no quoted commas or line breaks",
      "Only the first row is treated as headers; every row must match that shape",
      "Produces strings for every value, with no type inference",
    ],
    example: {
      steps: [
        "Paste a header row 'name,role' followed by 'Ada,Engineer' and 'Grace,Admiral'.",
        "Run the conversion.",
      ],
      result:
        'A JSON array such as [{"name":"Ada","role":"Engineer"},{"name":"Grace","role":"Admiral"}], indented for readability.',
    },
  },
  "json-to-csv": {
    intro:
      "JSON to CSV flattens a JSON array of objects into a comma-separated table. It reads the keys from the first object as headers, then writes one row per object — handy for opening API data in a spreadsheet.",
    benefits: [
      "Turns JSON arrays into a format spreadsheets open directly",
      "Derives column headers from the first object's keys",
      "Processes the input locally, with no upload",
    ],
    howTo: [
      "Paste a non-empty JSON array whose items are flat objects.",
      "Press Execute to build the header row and one line per item.",
      "Copy the CSV into a spreadsheet or save it as a .csv file.",
    ],
    faqs: [
      {
        question: "Which keys become the columns?",
        answer:
          "The keys of the first object. Keys missing from later objects are written as empty cells, and extra keys in later objects are ignored.",
      },
      {
        question: "What happens to nested objects or arrays?",
        answer:
          "They are stringified as [object Object], so flatten the data before converting if you need those values in separate columns.",
      },
    ],
    related: ["csv-to-json", "json-formatter", "json-validator"],
    useCases: [
      "Exporting API results to a spreadsheet for review",
      "Building a quick CSV from a JSON fixture or config list",
      "Sharing structured data with someone who works in Excel",
    ],
    limitations: [
      "Designed for flat objects; nested values are not expanded",
      "Column order follows only the first object's keys",
      "Values containing commas or newlines are not quoted, so they break columns",
    ],
    example: {
      steps: [
        'Paste [{"name":"Ada","role":"Engineer"},{"name":"Grace","role":"Admiral"}].',
        "Run the conversion.",
      ],
      result:
        "A CSV with the header row name,role followed by Ada,Engineer and Grace,Admiral.",
    },
  },
  "empty-line-remover": {
    intro:
      "Empty Line Remover strips blank lines from pasted text and can trim stray spaces at the same time. Use it to tidy lists, configuration snippets or notes before pasting them into another tool.",
    benefits: [
      "Removes blank lines in one pass and reports how many went",
      "Optional trimming clears lines that contain only spaces",
      "Works on any pasted text, entirely in the browser",
    ],
    howTo: [
      "Paste the text you want to clean into the input box.",
      "Leave 'Trim each line' enabled to treat whitespace-only lines as empty.",
      "Press Execute to get the cleaned text and the number of lines removed.",
    ],
    faqs: [
      {
        question: "Does it remove duplicate lines too?",
        answer:
          "No. It only removes empty lines. Use the Duplicate Line Remover for repeated lines, or run both tools in sequence.",
      },
      {
        question: "Will it change the text inside a line?",
        answer:
          "Only leading and trailing whitespace when trimming is on. The words and punctuation inside each kept line are untouched.",
      },
    ],
    related: ["duplicate-line-remover", "text-cleaner", "word-counter"],
    useCases: [
      "Cleaning a pasted list full of double-spaced gaps",
      "Tidying .env or config snippets copied from a document",
      "Preparing text for a word count or diff comparison",
    ],
    limitations: [
      "Does not collapse or reformat spaces inside a line",
      "Rewrites line endings to a single newline character",
      "Cannot remove lines that are intentionally blank but meaningful",
    ],
    example: {
      steps: ["Paste a list where every item is separated by a blank line.", "Run with trimming enabled."],
      result:
        "A compact list with each item on its own line and a 'removed' count showing how many blank lines were dropped.",
    },
  },
  "reading-time-calculator": {
    intro:
      "Reading Time Calculator estimates how long an article takes to read, using a words-per-minute rate you control. It returns both the reading time and the word count so you can label posts, scripts or documentation accurately.",
    benefits: [
      "Instant estimate based on the actual word count",
      "Adjustable speed for slow, average or fast readers",
      "Shows the word count alongside the time",
    ],
    howTo: [
      "Paste the article or script into the text box.",
      "Optionally enter a reading speed; the default is 200 words per minute.",
      "Press Execute to see the estimated time and word count.",
    ],
    faqs: [
      {
        question: "What reading speed should I use?",
        answer:
          "Two hundred words per minute is a common average for adults reading prose. Technical content is often slower, so 150 is a realistic estimate for documentation.",
      },
      {
        question: "How are words counted?",
        answer:
          "The text is split on whitespace, so hyphenated words count as one and code or numbers count as words too.",
      },
    ],
    related: ["word-counter", "readability-checker", "text-cleaner"],
    useCases: [
      "Adding an accurate reading-time label to a blog post",
      "Estimating how long a speech or video script will run",
      "Checking that documentation sections stay short",
    ],
    limitations: [
      "Counts whitespace-separated tokens, not human reading effort",
      "Ignores images, code blocks and complex formatting",
      "Speaking pace differs from silent reading pace",
    ],
    example: {
      steps: ["Paste a 600-word article and keep the default 200 wpm.", "Run the calculation."],
      result: "About 3 min at 200 wpm, with a word count of 600.",
    },
  },
  "hex-encoder": {
    intro:
      "Hex Encoder / Decoder converts text to its UTF-8 hexadecimal bytes and back again. It is useful for inspecting byte sequences, debugging encodings and producing hex literals without an external script.",
    benefits: [
      "Encodes UTF-8 text to lowercase hex byte pairs",
      "Decodes hex back to readable text",
      "Runs locally, so sample payloads stay private",
    ],
    howTo: [
      "Paste text and leave the mode on encode to get its hex bytes.",
      "To go the other way, switch the mode to decode and paste hex pairs.",
      "Press Execute and copy the result.",
    ],
    faqs: [
      {
        question: "Is hex encoding the same as encryption?",
        answer:
          "No. Hex is a representation of bytes, not a secret. Anyone can decode it, so never use it to protect passwords or sensitive data.",
      },
      {
        question: "Why was my hex rejected?",
        answer:
          "Decoding needs an even number of 0-9 or a-f characters. Spaces are ignored, but odd lengths or non-hex characters produce an error.",
      },
    ],
    related: ["base64-encoder", "url-encoder", "jwt-decoder"],
    useCases: [
      "Inspecting the bytes behind an unusual character",
      "Producing hex literals for a low-level configuration",
      "Checking that two encodings produce the same bytes",
    ],
    limitations: [
      "Not encryption — hex is trivially reversible",
      "Decoding assumes UTF-8 output",
      "Whitespace in decoded output is preserved exactly",
    ],
    example: {
      steps: ["Enter the text 'Hi' and encode.", "Then decode 4869 to confirm the round trip."],
      result: "'Hi' encodes to 4869, and 4869 decodes back to 'Hi'.",
    },
  },
  "css-border-radius-generator": {
    intro:
      "CSS Border Radius Generator produces a border-radius declaration for uniformly rounded or individually shaped corners. Set one value, override specific corners, and copy the CSS shorthand.",
    benefits: [
      "Outputs a single border-radius value when all corners match",
      "Falls back to the four-value shorthand for uneven corners",
      "No build step or framework required",
    ],
    howTo: [
      "Set the 'all corners' value in pixels as the starting radius.",
      "Override top-left, top-right, bottom-right or bottom-left individually if needed.",
      "Press Execute and copy the generated border-radius rule.",
    ],
    faqs: [
      {
        question: "What order do the four values follow?",
        answer:
          "Top-left, top-right, bottom-right, bottom-left — clockwise from the top-left corner, matching the CSS shorthand.",
      },
      {
        question: "Can I make an elliptical corner?",
        answer:
          "This generator writes simple radius values. Elliptical corners need the slash syntax, such as 50% / 20%, which you can add by hand.",
      },
    ],
    related: ["css-box-shadow-generator", "css-button-generator", "css-gradient-generator"],
    useCases: [
      "Rounding cards and avatars consistently across a design",
      "Creating a pill shape with a large radius",
      "Matching a UI kit's corner treatment quickly",
    ],
    limitations: [
      "Values are treated as pixels; percentages must be entered as plain numbers with care",
      "Does not generate the elliptical slash syntax",
      "Generates CSS only — you still apply it to an element",
    ],
    example: {
      steps: ["Set all corners to 12, then change the top-left corner to 32.", "Run the generator."],
      result: "border-radius: 32px 12px 12px 12px; — a card with one sharper top-left corner.",
    },
  },
  "css-button-generator": {
    intro:
      "CSS Button Generator writes a complete, copy-paste button style block from a background colour, text colour, padding and corner radius. It is a quick starting point for calls to action that you can then adapt.",
    benefits: [
      "Produces a full .btn rule rather than a single property",
      "Accepts any CSS colour and padding shorthand",
      "Includes sensible defaults for weight and cursor",
    ],
    howTo: [
      "Choose a background colour and a contrasting text colour.",
      "Set the padding and corner radius to match your design.",
      "Press Execute and copy the generated CSS block into your stylesheet.",
    ],
    faqs: [
      {
        question: "Does it include hover and focus styles?",
        answer:
          "No. The block covers the resting state only. Add :hover, :focus-visible and :disabled rules yourself so the button remains usable with a keyboard.",
      },
      {
        question: "Why is the class called .btn?",
        answer:
          "It is a neutral default. Rename the selector to fit your project's naming convention after pasting.",
      },
    ],
    related: ["css-box-shadow-generator", "css-border-radius-generator", "css-gradient-generator"],
    useCases: [
      "Creating a quick CTA button for a landing page",
      "Prototyping button colours before committing to a design system",
      "Generating a baseline style to extend with states",
    ],
    limitations: [
      "Only the resting visual style — no hover, focus or disabled states",
      "Uses a fixed .btn class name",
      "Does not check colour contrast; verify the text is readable on the background",
    ],
    example: {
      steps: ["Use #4f46e5 background, #ffffff text, 12px 24px padding and radius 8.", "Run the generator."],
      result:
        "A .btn block with indigo background, white text, comfortable padding and 8px rounded corners, plus bold weight and a pointer cursor.",
    },
  },
  "vcard-qr-generator": {
    intro:
      "vCard QR Generator builds a standard vCard 3.0 contact payload for a QR business card. Enter a name and optionally a phone number, email and organisation, then render the payload as a scannable code.",
    benefits: [
      "Produces a standards-based vCard 3.0 payload",
      "Only the fields you fill in are included",
      "Contact details are assembled in your browser",
    ],
    howTo: [
      "Enter the person's full name; this is the only required field.",
      "Add a phone number, email address or organisation as needed.",
      "Press Execute, then scan the preview to save the contact.",
    ],
    faqs: [
      {
        question: "Which fields should a vCard include?",
        answer:
          "At minimum FN (full name) plus either TEL or EMAIL. Adding ORG and a website makes the contact more useful at events.",
      },
      {
        question: "Can I include a photo or social profiles?",
        answer:
          "This generator writes the common name, phone, email and organisation fields only. Photos and social links would make the payload much larger and reduce scan reliability.",
      },
    ],
    related: ["wifi-qr-generator", "text-qr-generator", "url-qr-generator"],
    useCases: [
      "Printable QR business cards and conference badges",
      "Adding a contact shortcut to a portfolio or CV",
      "Sharing details at a networking event without typing",
    ],
    limitations: [
      "Writes vCard 3.0 and a small set of fields",
      "No photo, social profiles or multiple addresses",
      "Very long values make denser codes that are harder to scan",
    ],
    example: {
      steps: ["Enter name 'Ada Lovelace', email 'ada@example.com' and org 'Analytical Engines'.", "Generate the payload."],
      result:
        "A BEGIN:VCARD … END:VCARD payload containing FN, EMAIL and ORG, which the preview renders as a scannable contact code.",
    },
  },
  "text-qr-generator": {
    intro:
      "Text QR Generator turns a short piece of plain text into a QR-ready payload and renders it as a scannable code. Use it for instructions, labels, serial numbers or any short message that should travel with a scan.",
    benefits: [
      "Any plain text works — no URL required",
      "Length is checked to keep the code scannable",
      "Payload is generated locally, not sent to a QR service",
    ],
    howTo: [
      "Type or paste the text you want the code to carry, up to about 1000 characters.",
      "Press Execute to build the payload.",
      "Scan or download the rendered QR preview.",
    ],
    faqs: [
      {
        question: "How much text can a QR code hold?",
        answer:
          "A QR code can technically hold thousands of characters, but longer payloads create denser patterns that phone cameras struggle to read. Keep it under a few hundred characters for reliable scanning.",
      },
      {
        question: "Can I change the text after printing?",
        answer:
          "No. A static QR code contains the payload itself, so changing the message means generating and printing a new code.",
      },
    ],
    related: ["url-qr-generator", "wifi-qr-generator", "vcard-qr-generator"],
    useCases: [
      "Labels on equipment with setup instructions",
      "Table cards with a short message or serial number",
      "Offline notes that need to move to a phone quickly",
    ],
    limitations: [
      "Static payload with no tracking, expiry or editability",
      "Longer text produces denser, harder-to-scan codes",
      "Not a URL shortener; links are encoded exactly as entered",
    ],
    example: {
      steps: ["Enter 'Reception: dial 0 for assistance'.", "Generate the code and scan it with a phone."],
      result: "A QR code that displays the exact text when scanned, with no network request needed.",
    },
  },
  "youtube-thumbnail-downloader": {
    intro:
      "YouTube Thumbnail Downloader builds the direct addresses for a video's public thumbnail images from a YouTube URL or 11-character video ID. No API key is needed because thumbnails are served as ordinary public files.",
    benefits: [
      "Returns every standard thumbnail size from one video",
      "Accepts watch, share and short URLs as well as bare IDs",
      "Builds the file addresses without an API key",
    ],
    howTo: [
      "Paste a YouTube URL or the 11-character video ID.",
      "Press Execute to generate the thumbnail addresses.",
      "Open or save the resolution you need, such as maxresdefault for 1280×720.",
    ],
    faqs: [
      {
        question: "Why is the maximum-resolution image missing?",
        answer:
          "Not every video has a maxresdefault thumbnail. When it is absent, use the next size down, such as sddefault or hqdefault.",
      },
      {
        question: "Can I reuse thumbnails anywhere?",
        answer:
          "Thumbnails are the creator's copyrighted work. Use them for previews, commentary or other fair uses, and check YouTube's terms and the creator's wishes before republishing.",
      },
    ],
    related: ["image-resizer", "image-compressor", "image-converter"],
    useCases: [
      "Grabbing a reference image for a video preview card",
      "Resizing a thumbnail for a newsletter or social post",
      "Checking which resolutions a video publishes",
    ],
    limitations: [
      "Requires a network connection to open the image files",
      "Only public thumbnails are available; private videos have none",
      "Highest resolution varies by video, and tool does not download the video itself",
    ],
    example: {
      steps: ["Paste a watch URL such as https://www.youtube.com/watch?v=dQw4w9WgXcQ.", "Run the generator."],
      result:
        "A list of thumbnail addresses for maxres, SD, HQ, MQ and default sizes, each openable or saveable in the browser.",
    },
  },
  "color-picker-from-image": {
    intro:
      "Color Picker from Image samples the exact HEX value of any pixel in an image you choose, and also surfaces the colours that dominate the picture. It runs on the browser canvas, so the image is never uploaded.",
    benefits: [
      "Reads the precise HEX value of a clicked pixel",
      "Suggests the dominant colours for a quick palette",
      "Processes the image locally on your device",
    ],
    howTo: [
      "Choose an image from your device.",
      "Click the area whose colour you want to sample.",
      "Copy the HEX value, or use the dominant-colour list for a palette.",
    ],
    faqs: [
      {
        question: "Is my image uploaded to a server?",
        answer:
          "No. The image is decoded and sampled in the browser using the canvas API, so it stays on your device.",
      },
      {
        question: "Why does a sampled colour differ from the original file?",
        answer:
          "Canvas rendering applies the browser's colour handling, and JPEG compression shifts nearby pixels. Sample a flat area rather than an edge for the most accurate value.",
      },
    ],
    related: ["color-converter", "css-gradient-generator", "image-compressor"],
    useCases: [
      "Matching a brand colour from a logo or screenshot",
      "Building a palette from a photograph",
      "Finding the exact background colour of a UI mockup",
    ],
    limitations: [
      "Runs only in the browser, not in the CLI or API layer",
      "Samples rendered sRGB values, not CMYK or wide-gamut originals",
      "Compression and anti-aliasing can shift colours near edges",
    ],
    example: {
      steps: ["Upload a logo, then click a flat part of the mark.", "Read the sampled HEX value."],
      result: "The exact HEX code for that pixel plus a short list of the image's dominant colours.",
    },
  },
};

// Depth additions for tools that already have a hand-written deck. Keeping
// them here avoids editing the large deck literal and lets us add worked
// examples to the highest-demand tools first.
export const TOOL_DEPTH: Record<string, ToolDepth> = {
  "merge-pdf": {
    example: {
      steps: [
        "Upload two or three PDFs and arrange them in the order you want.",
        "Run the merge and download the combined file.",
      ],
      result:
        "One PDF containing every page in the order shown, with the original page quality unchanged.",
    },
    useCases: [
      "Combining a cover letter, CV and portfolio into one file",
      "Joining scanned chapters into a single document",
      "Assembling invoices or reports for a client",
    ],
    limitations: [
      "Encrypted or password-protected PDFs usually need unlocking first",
      "Very large files are limited by browser memory",
      "Bookmarks and interactive form fields may not merge perfectly",
    ],
  },
  "split-pdf": {
    example: {
      steps: [
        "Upload a 20-page PDF.",
        "Enter ranges such as 1-10 and 11-20.",
        "Run the split and download each part.",
      ],
      result: "Two PDFs, one per range, with the selected pages in order.",
    },
    useCases: [
      "Separating chapters or sections for sharing",
      "Extracting a single page to sign or email",
      "Breaking a scan into individual documents",
    ],
    limitations: [
      "Password-protected files may need unlocking first",
      "The range syntax must be valid or the split is rejected",
      "Large documents depend on available memory",
    ],
  },
  "compress-pdf": {
    example: {
      steps: [
        "Upload a PDF and choose a compression level.",
        "Run it and compare the output size.",
      ],
      result:
        "A smaller PDF, with the before and after size shown so you can judge the quality trade-off.",
    },
    useCases: [
      "Getting a PDF under an upload limit",
      "Emailing a document that contains large images",
      "Preparing scans for a web portal",
    ],
    limitations: [
      "Heavy compression can soften scanned text and images",
      "Already-optimised PDFs may shrink very little",
      "Some embedded fonts and attachments do not compress",
    ],
  },
  "jpg-to-pdf": {
    example: {
      steps: [
        "Upload two JPGs and order them.",
        "Choose the page size and margins.",
        "Convert and download.",
      ],
      result: "A PDF with one image per page, scaled to the chosen page size.",
    },
    useCases: [
      "Turning phone photos into a single document",
      "Submitting scanned pages as a PDF",
      "Creating a simple image portfolio",
    ],
    limitations: [
      "Output quality is limited by the source photos",
      "Very high-resolution images increase the file size",
      "Mixed orientations may letterbox depending on settings",
    ],
  },
  "pdf-to-jpg": {
    example: {
      steps: [
        "Upload a PDF and choose a page or range.",
        "Set the image quality and convert.",
      ],
      result: "One JPG per selected page at the chosen quality.",
    },
    useCases: [
      "Extracting a chart or photo from a PDF",
      "Making a PDF page easy to post on the web",
      "Previewing a page as an image",
    ],
    limitations: [
      "Text becomes a raster image and is no longer selectable",
      "Higher quality means larger files",
      "Very large pages are downscaled to fit browser limits",
    ],
  },
  "image-compressor": {
    example: {
      steps: [
        "Upload a photo and choose a quality level.",
        "Compress and compare the output size.",
      ],
      result: "A smaller image at the quality you chose, with the reduction shown.",
    },
    useCases: [
      "Speeding up a website by shrinking images",
      "Fitting under an upload limit",
      "Reducing storage for a photo library",
    ],
    limitations: [
      "Aggressive compression introduces visible artefacts",
      "It cannot recover detail that the source lost",
      "Animated formats may be flattened depending on settings",
    ],
  },
  "image-converter": {
    example: {
      steps: ["Upload a PNG.", "Choose WebP output and convert."],
      result:
        "A WebP file, usually smaller than the PNG, ready to download and use on the web.",
    },
    useCases: [
      "Converting PNGs to WebP for faster pages",
      "Changing HEIC or other formats to a widely supported one",
      "Preparing images for a specific platform",
    ],
    limitations: [
      "Some conversions drop transparency or animation",
      "Output quality depends on the source",
      "Conversion does not improve a low-quality original",
    ],
  },
  "image-resizer": {
    example: {
      steps: [
        "Upload an image and set the width to 1200 px with the aspect ratio locked.",
        "Resize and download.",
      ],
      result: "The image scaled to 1200 px wide with the height adjusted proportionally.",
    },
    useCases: [
      "Shrinking oversized photos before upload",
      "Producing consistent thumbnails",
      "Meeting a site's maximum dimensions",
    ],
    limitations: [
      "Enlarging beyond the source resolution looks soft",
      "It does not crop; use the cropper for exact framing",
      "Metadata may be stripped",
    ],
  },
  "word-counter": {
    example: {
      steps: ["Paste your text.", "Read the word, character and sentence counts."],
      result:
        "Counts update for the pasted text, including characters with and without spaces.",
    },
    useCases: [
      "Checking an essay or article against a word limit",
      "Estimating reading time",
      "Trimming a bio or meta description",
    ],
    limitations: [
      "Hyphenated words and numbers follow the tool's counting rules, which may differ from an exam or publisher",
      "It counts text only, not images or formatting",
      "Word rules vary by language",
    ],
  },
  "json-formatter": {
    example: {
      steps: ["Paste minified JSON.", "Format it with two-space indentation."],
      result:
        "The same data, pretty-printed with one key per line so it is easy to read and diff.",
    },
    useCases: [
      "Making an API response readable",
      "Preparing JSON for code review",
      "Spotting a missing comma or bracket",
    ],
    limitations: [
      "Invalid JSON is rejected with an error rather than guessed",
      "Very large documents may be slow in the browser",
      "It changes whitespace, not the data",
    ],
  },
  "json-validator": {
    example: {
      steps: ["Paste a JSON document.", "Validate it."],
      result:
        "A valid or invalid result, with an error position and message when the document is malformed.",
    },
    useCases: [
      "Checking a config file before deploying",
      "Confirming an API payload is valid",
      "Understanding why a trailing comma breaks JSON",
    ],
    limitations: [
      "It checks syntax, not schema or business rules",
      "Duplicate keys are not flagged by all parsers",
      "Large files depend on browser memory",
    ],
  },
  "base64-encoder": {
    example: {
      steps: ["Paste UTF-8 text.", "Encode it to Base64."],
      result: "A Base64 string that decodes back to the same text.",
    },
    useCases: [
      "Embedding small data in a data URL",
      "Encoding text for a system that expects Base64",
      "Making a payload safe to copy through a text-only channel",
    ],
    limitations: [
      "Base64 is encoding, not encryption — anyone can decode it",
      "It increases size by about a third",
      "Binary handling may differ for very large inputs",
    ],
  },
  "jwt-decoder": {
    example: {
      steps: ["Paste a JWT.", "Decode it to see the header and payload."],
      result:
        "The decoded JSON header and payload. The signature is not verified, so treat the contents as unverified.",
    },
    useCases: [
      "Inspecting claims such as exp and iss while debugging",
      "Checking a token's algorithm and scopes",
      "Confirming which user a token represents",
    ],
    limitations: [
      "It does not verify signatures — never trust decoded claims for security decisions",
      "It does not fetch keys or validate expiry for you",
      "Malformed tokens are rejected",
    ],
  },
  "password-generator": {
    example: {
      steps: ["Choose length 20 and include symbols.", "Generate and copy."],
      result: "A random password of the chosen length using the selected character sets.",
    },
    useCases: [
      "Creating a unique password for a new account",
      "Generating temporary credentials for a team",
      "Replacing a reused password",
    ],
    limitations: [
      "Store the result in a password manager; the page does not save it",
      "Strength depends on length and randomness, not complexity theatre",
      "Avoid pasting real production passwords into any untrusted page",
    ],
  },
  "uuid-generator": {
    example: {
      steps: ["Choose UUID v4 and how many you need.", "Generate."],
      result:
        "Random version-4 UUIDs in the standard 8-4-4-4-12 format.",
    },
    useCases: [
      "Creating primary keys for records",
      "Naming files uniquely",
      "Seeding test data",
    ],
    limitations: [
      "UUIDs are random, not sequential, so do not use them for ordering",
      "They are identifiers, not secrets",
      "The page must stay open; values are not stored",
    ],
  },
  "url-encoder": {
    example: {
      steps: ["Paste 'hello world & more'.", "Encode it."],
      result:
        "hello%20world%20%26%20more — spaces and reserved characters escaped for use in a URL.",
    },
    useCases: [
      "Building a query string with user text",
      "Encoding a value inside a path segment",
      "Escaping data for a link",
    ],
    limitations: [
      "Encoding a whole URL can break its structure; encode individual values",
      "It does not decode; use the decoder for that",
      "Double-encoding produces %25 sequences",
    ],
  },
  "bmi-calculator": {
    example: {
      steps: ["Enter 70 kg and 175 cm.", "Calculate."],
      result: "BMI of about 22.9, in the healthy adult range, with the category shown.",
    },
    useCases: [
      "A quick screening check before a GP visit",
      "Tracking a trend over months",
      "Understanding what the BMI number means",
    ],
    limitations: [
      "It cannot distinguish muscle from fat",
      "Cut-offs differ for some ethnic groups and for children",
      "It is a screening signal, not a diagnosis",
    ],
  },
  "loan-calculator": {
    example: {
      steps: ["Enter a 20,000 loan at 6% over 5 years.", "Calculate."],
      result:
        "The monthly payment, total interest and total repayment, so you can compare offers.",
    },
    useCases: [
      "Comparing loan or car-finance offers",
      "Checking whether a repayment fits your budget",
      "Seeing how the term changes total interest",
    ],
    limitations: [
      "It assumes a fixed rate and regular payments",
      "Fees, insurance and variable rates are not included",
      "It is an estimate, not a lender quote",
    ],
  },
  "percentage-calculator": {
    example: {
      steps: ["Find 15% of 240.", "Calculate."],
      result: "36 — the tool shows the working so you can check it.",
    },
    useCases: [
      "Working out a discount or tip",
      "Finding a percentage change between two values",
      "Scaling a recipe or budget",
    ],
    limitations: [
      "It answers the specific percentage question you choose, so read which mode you are in",
      "Results are rounded to a sensible precision",
      "It is arithmetic, not a financial recommendation",
    ],
  },
  "age-calculator": {
    example: {
      steps: ["Enter a birth date and today's date.", "Calculate."],
      result:
        "The exact age in years, months and days, plus the next birthday countdown.",
    },
    useCases: [
      "Filling forms that ask for exact age",
      "Planning a birthday or eligibility date",
      "Working out age at a past or future date",
    ],
    limitations: [
      "Results depend on the dates entered",
      "Leap days are handled by calendar date, not time of day",
      "It is not a legal age-verification service",
    ],
  },
  "tip-calculator": {
    example: {
      steps: ["Enter a 48.00 bill, a 15% tip and 3 people.", "Calculate."],
      result: "A 7.20 tip, a 55.20 total and 18.40 per person.",
    },
    useCases: [
      "Splitting a restaurant bill",
      "Adding a service tip before paying",
      "Checking a suggested tip amount",
    ],
    limitations: [
      "It does not include tax rules or local tipping norms",
      "Rounding to whole currency units may shift a cent",
      "It is a convenience, not payment processing",
    ],
  },
  "discount-calculator": {
    example: {
      steps: ["Enter a 120 price and a 25% discount.", "Calculate."],
      result: "A 90 sale price and 30 saved, so you can compare deals.",
    },
    useCases: [
      "Checking a sale price before checkout",
      "Comparing percentage-off offers",
      "Working backwards from a sale price to the discount",
    ],
    limitations: [
      "It does not account for tax, shipping or stacked coupons",
      "Percentage and fixed discounts are handled separately",
      "Retailer rounding may differ by a cent",
    ],
  },
  "unit-converter": {
    example: {
      steps: ["Convert 10 km to miles.", "Calculate."],
      result: "6.21 miles, using the standard conversion factor.",
    },
    useCases: [
      "Converting units for travel, cooking or study",
      "Checking a measurement before a purchase",
      "Sanity-checking a calculation",
    ],
    limitations: [
      "It uses standard factors; local or historical units may differ",
      "Precision is rounded for readability",
      "Compound units such as speed may need a separate step",
    ],
  },
  "timestamp-converter": {
    example: {
      steps: ["Paste 1700000000 and choose seconds.", "Convert."],
      result:
        "The corresponding UTC and local date-time, plus the ISO string, so you can confirm the moment.",
    },
    useCases: [
      "Reading a Unix timestamp from a log",
      "Converting a date to epoch seconds for an API",
      "Checking time zones around a deadline",
    ],
    limitations: [
      "It assumes the input is seconds or milliseconds as selected",
      "Local output depends on your device's time zone",
      "It does not handle leap-second corrections",
    ],
  },
};

// Accurate, category-level fallbacks so every tool page explains when to use
// the tool and what to watch out for, without per-tool filler.
export const CATEGORY_USE_CASES: Record<string, ReadonlyArray<string>> = {
  pdf: [
    "Preparing documents for email or an upload portal",
    "Combining or splitting scanned pages",
    "Reducing file size for a size-limited form",
  ],
  image: [
    "Optimising photos for faster web pages",
    "Converting formats for a specific platform",
    "Resizing images for consistent layouts",
  ],
  developer: [
    "Cleaning up payloads and config while debugging",
    "Encoding or decoding data for an API",
    "Inspecting tokens and structured text",
  ],
  text: [
    "Cleaning and reformatting copied text",
    "Checking length against a limit",
    "Preparing content for publishing",
  ],
  security: [
    "Checking hashes, tokens and local secrets",
    "Inspecting credentials during development",
    "Learning how common encodings work",
  ],
  design: [
    "Prototyping CSS effects and components",
    "Generating snippets without memorising syntax",
    "Matching a visual style from a reference",
  ],
  color: [
    "Choosing accessible colour combinations",
    "Converting between colour formats",
    "Building a palette for a project",
  ],
  qr: [
    "Sharing links, text or network details by scanning",
    "Printing scannable codes for signage",
    "Generating test QR payloads",
  ],
  calculator: [
    "Working out everyday figures quickly",
    "Checking a result by hand",
    "Comparing scenarios",
  ],
  finance: [
    "Estimating costs, interest and returns",
    "Comparing offers before committing",
    "Planning a budget",
  ],
  seo: [
    "Checking metadata and crawl rules",
    "Preparing pages before publishing",
    "Auditing a site's search signals",
  ],
  validator: [
    "Checking input before storing or sending it",
    "Catching malformed data early",
    "Explaining why a value is rejected",
  ],
  formatter: [
    "Standardising data for display or export",
    "Converting between common formats",
    "Making values easier to read",
  ],
};

export const CATEGORY_LIMITATIONS: Record<string, ReadonlyArray<string>> = {
  pdf: [
    "Password-protected PDFs may need unlocking first",
    "Very large files are limited by browser memory",
    "Complex layouts, forms and bookmarks may not survive every operation",
  ],
  image: [
    "Output quality is limited by the source image",
    "Aggressive compression can introduce visible artefacts",
    "Some conversions drop transparency or animation",
  ],
  developer: [
    "Tools check syntax and structure, not the correctness of your data",
    "Very large inputs are limited by browser memory",
    "Behaviour may differ from a specific language runtime or linter",
  ],
  text: [
    "Word and line rules follow the tool's own logic, which may differ from a publisher's",
    "It processes plain text, not formatting or images",
    "Very large documents depend on browser memory",
  ],
  security: [
    "Encodings and hashes are not encryption",
    "Do not paste real production secrets into any web page",
    "Use a dedicated secrets manager for production keys",
  ],
  design: [
    "Generated CSS is a starting point and should be tested in your target browsers",
    "It does not know your design system or constraints",
    "Browser rendering can differ at extreme values",
  ],
  color: [
    "Screens and printers render colour differently",
    "Contrast results depend on the exact colours and text settings used",
    "It does not account for every type of colour-vision deficiency",
  ],
  qr: [
    "Always test a code with a real scanner before printing",
    "Physical size, contrast and print quality affect scannability",
    "A code is only as safe as the content it points to",
  ],
  calculator: [
    "Results are estimates for general information",
    "Input assumptions affect the answer",
    "It is not professional advice",
  ],
  finance: [
    "Estimates assume the inputs and rates you provide",
    "Fees, tax and variable rates may be excluded",
    "It is not financial advice or a lender quote",
  ],
  seo: [
    "Tools check signals, not rankings",
    "Search engines change their behaviour, so guidance can go stale",
    "A passing check does not guarantee traffic",
  ],
  validator: [
    "Validation checks format, not whether the resource exists or is safe",
    "Rules can differ from a specific service's requirements",
    "It does not fetch or resolve the value",
  ],
  formatter: [
    "Formatting changes presentation, not the underlying data",
    "Some formats lose precision or metadata on conversion",
    "Round-trip conversions may not preserve every detail",
  ],
};
