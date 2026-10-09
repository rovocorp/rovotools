// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { registerCoreTools, toolRegistry } from "@rovotools/tools";
import { TOOL_SAMPLES as SAMPLES } from "../../../e2e/tool-samples";
import ToolRunner from "../tools/ToolRunner";

afterEach(() => {
  cleanup();
});

function wrap(element: ReactElement): ReactElement {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{element}</QueryClientProvider>;
}

describe("ToolRunner table outputs", () => {
  it("renders multi-line word results as a numbered table", async () => {
    registerCoreTools(toolRegistry);
    const slug = "random-word-generator";
    const sample = SAMPLES[slug] as Record<string, string>;
    const { container, unmount } = render(wrap(<ToolRunner slug={slug} />));
    try {
      for (const [id, value] of Object.entries(sample)) {
        const el = container.querySelector(`[id="${id}"]`);
        expect(el, `missing control for input "${id}"`).not.toBeNull();
        fireEvent.change(el!, { target: { value } });
      }
      fireEvent.click(container.querySelector('button[type="submit"]')!);
      const table = await waitFor(() => {
        const found = container.querySelector("dl table");
        expect(found, "multi-line output did not render a table").not.toBeNull();
        return found!;
      }, { timeout: 5000 });
      // Seeded sample draws 8 words: one numbered row per word.
      expect(table.querySelectorAll("tbody tr").length).toBe(8);
      expect(table.querySelector("tbody tr th")?.textContent).toBe("1");
    } finally {
      unmount();
    }
  });

  it("keeps single-value outputs as plain text", async () => {
    registerCoreTools(toolRegistry);
    const slug = "word-counter";
    const sample = SAMPLES[slug] as Record<string, string>;
    const { container, unmount } = render(wrap(<ToolRunner slug={slug} />));
    try {
      for (const [id, value] of Object.entries(sample)) {
        fireEvent.change(container.querySelector(`[id="${id}"]`)!, { target: { value } });
      }
      fireEvent.click(container.querySelector('button[type="submit"]')!);
      await waitFor(() => {
        expect(container.querySelector("dl"), "no result rendered").not.toBeNull();
      }, { timeout: 5000 });
      expect(container.querySelector("dl table"), "plain output must not render a table").toBeNull();
    } finally {
      unmount();
    }
  });
});
