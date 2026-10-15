// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CategoryIntro from "../tools/CategoryIntro";

afterEach(() => {
  cleanup();
});

const PARAGRAPHS = [
  "Images dominate page weight and message size. This hub covers the practical image jobs you hit when publishing, emailing or preparing assets: compress for faster pages, resize to display dimensions, convert between formats.",
  "A reliable order of operations is resize first, then convert or compress. A 4000 px photo shown at 800 px wastes bytes no quality setting can recover.",
  "All processing is designed to stay on your device whenever the browser supports it.",
];

const SHORT_PARAGRAPHS = ["Just one short hub line."];

describe("CategoryIntro", () => {
  it("renders short intros without a toggle", () => {
    render(<CategoryIntro paragraphs={SHORT_PARAGRAPHS} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Just one short hub line.")).toBeDefined();
  });

  it("collapses to the first sentence, expands all paragraphs with Less at the end", () => {
    render(<CategoryIntro paragraphs={PARAGRAPHS} />);
    const more = screen.getByRole("button", { name: /More/ });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    const restId = more.getAttribute("aria-controls") ?? "";
    const restCollapsed = document.getElementById(restId);
    expect(restCollapsed).not.toBeNull();
    expect(restCollapsed?.hasAttribute("hidden")).toBe(true);

    fireEvent.click(more);
    const less = screen.getByRole("button", { name: /Less/ });
    expect(less.getAttribute("aria-expanded")).toBe("true");
    expect(less.parentElement?.lastElementChild).toBe(less);
    const rest = less.getAttribute("aria-controls") ? document.getElementById(less.getAttribute("aria-controls") ?? "") : null;
    expect(rest?.hasAttribute("hidden")).toBe(false);
    expect(rest?.textContent).toContain("A reliable order of operations");
    expect(rest?.textContent).toContain("All processing is designed");
    expect(rest?.querySelectorAll("p").length).toBe(3);

    fireEvent.click(less);
    expect(screen.getByRole("button", { name: /More/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps the full text in the DOM when collapsed for SEO", () => {
    render(<CategoryIntro paragraphs={PARAGRAPHS} />);
    const container = screen.getByText(/Images dominate/).closest("div");
    expect(container?.textContent).toContain("A reliable order of operations");
    expect(container?.textContent).toContain("All processing is designed");
  });
});
