"use client";

import { useEffect } from "react";

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: { query: string }) => unknown | Promise<unknown>;
}

interface ModelContextLike {
  registerTool?: (tool: WebMcpTool) => void | Promise<void>;
}

const TOOL_CATEGORIES = [
  "PDF",
  "Image",
  "Developer",
  "Calculator",
  "Finance",
  "Text",
  "Security",
  "SEO",
];

// Registers a WebMCP tool with in-browser agents on page load. The API is
// experimental, so registration is best-effort and never throws.
export default function WebMcpTools(): null {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      return;
    }

    try {
      void modelContext.registerTool({
        name: "search_rovotools",
        description:
          "Search RovoTools' free online tools by keyword and return a deep link to the matching results plus the available tool categories.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "What the user wants to do, for example 'merge PDFs' or 'generate a QR code'.",
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
        execute: ({ query }) => {
          const trimmed = typeof query === "string" ? query.trim() : "";
          const searchUrl = `${window.location.origin}/tools/?q=${encodeURIComponent(trimmed)}`;
          return {
            query: trimmed,
            searchUrl,
            categories: TOOL_CATEGORIES,
          };
        },
      });
    } catch {
      // Ignore: WebMCP is not available or rejected the registration.
    }
  }, []);

  return null;
}
