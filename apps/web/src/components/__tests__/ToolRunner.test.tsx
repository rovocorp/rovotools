// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { BROWSER_ONLY_TOOL_IDS, registerCoreTools, toolRegistry } from "@rovotools/tools";
import type { ToolInputField } from "@rovotools/types";
import { EXPECTED_SUBSTRINGS, TOOL_SAMPLES as SAMPLES } from "../../../e2e/tool-samples";
import ToolRunner from "../tools/ToolRunner";

afterEach(() => {
  cleanup();
});

function wrap(element: ReactElement): ReactElement {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{element}</QueryClientProvider>;
}

function fillInput(container: HTMLElement, field: ToolInputField, value: string): void {
  const el = container.querySelector(`[id="${field.id}"]`);
  expect(el, `missing control for input "${field.id}"`).not.toBeNull();
  if (field.type === "boolean") {
    const box = el as HTMLInputElement;
    if ((box.checked ? "true" : "false") !== value) {
      fireEvent.click(box);
    }
    return;
  }
  fireEvent.change(el!, { target: { value } });
}

describe("ToolRunner", () => {
  it("renders inputs, accepts typing, executes and shows a result for every generic tool", async () => {
    registerCoreTools(toolRegistry);
    const entries = toolRegistry
      .query({})
      .filter((entry) => !BROWSER_ONLY_TOOL_IDS.has(entry.definition.id));

    expect(entries.length).toBeGreaterThanOrEqual(60);

    for (const entry of entries) {
      const slug = entry.definition.slug;
      const sample = SAMPLES[slug];
      if (sample === undefined) {
        throw new Error(`missing UI sample for ${slug}`);
      }

      const { container, unmount } = render(wrap(<ToolRunner slug={slug} />));
      try {
        // Every declared input must render an editable control.
        for (const field of entry.definition.inputs) {
          const sampleValue = sample[field.id] ?? "";
          fillInput(container, field, sampleValue);
          const el = container.querySelector(`[id="${field.id}"]`) as HTMLInputElement;
          if (field.type === "boolean") {
            expect(el.checked ? "true" : "false", `${slug}.${field.id} did not accept input`).toBe(sampleValue);
          } else if (field.type !== "select") {
            expect(el.value, `${slug}.${field.id} did not accept typing`).toBe(sampleValue);
          }
        }

        const submit = container.querySelector('button[type="submit"]');
        expect(submit, `${slug} is missing its submit button`).not.toBeNull();
        fireEvent.click(submit!);

        // A result list must appear with one value per declared output.
        const dl = await waitFor(() => {
          const found = container.querySelector("dl");
          expect(found, `${slug} produced no result`).not.toBeNull();
          return found!;
        }, { timeout: 5000 });
        expect(
          dl.querySelectorAll("dd").length,
          `${slug} result is missing outputs`,
        ).toBe(entry.definition.outputs.length);

        for (const expected of EXPECTED_SUBSTRINGS[slug] ?? []) {
          expect(dl.textContent ?? "", `${slug} result mismatch`).toContain(expected);
        }
      } finally {
        unmount();
      }
    }
  }, 180000);
});
