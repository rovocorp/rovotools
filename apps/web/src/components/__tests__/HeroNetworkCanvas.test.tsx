// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeroNetworkCanvas from "../hero/HeroNetworkCanvas";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HeroNetworkCanvas", () => {
  it("renders a decorative, non-interactive canvas", () => {
    render(<HeroNetworkCanvas />);
    const canvas = screen.getByTestId("hero-network-canvas");
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.className).toContain("pointer-events-none");
  });

  it("stays inert without a 2d context (e.g. no canvas support)", () => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    expect(typeof getContext).toBe("function");
    // jsdom has no canvas backend: getContext returns null and the effect
    // must bail out instead of throwing.
    render(<HeroNetworkCanvas />);
    expect(screen.getByTestId("hero-network-canvas")).toBeDefined();
  });

  describe("hover-gated animation", () => {
    function mockScene() {
      const gradient = { addColorStop: vi.fn() };
      const context = {
        createRadialGradient: vi.fn(() => gradient),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        setTransform: vi.fn(),
        clearRect: vi.fn(),
      };
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
        context as unknown as CanvasRenderingContext2D,
      );
      // Hover-capable device, no reduced motion.
      vi.spyOn(window, "matchMedia").mockImplementation(
        (query: string) =>
          ({
            matches: query.includes("hover"),
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }) as unknown as MediaQueryList,
      );
      const raf = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation(() => 1);
      const cancel = vi
        .spyOn(window, "cancelAnimationFrame")
        .mockImplementation(() => undefined);
      return { raf, cancel };
    }

    it("stays static until the grid background is hovered", () => {
      const { raf } = mockScene();
      render(<HeroNetworkCanvas />);
      const canvas = screen.getByTestId("hero-network-canvas");
      // Static by default: no animation frames scheduled on mount.
      expect(raf).not.toHaveBeenCalled();

      // Hovering the canvas (empty grid background) starts motion.
      fireEvent.mouseMove(canvas);
      expect(raf).toHaveBeenCalledTimes(1);
    });

    it("ignores hovers over interactive hero content", () => {
      const { raf } = mockScene();
      const { container } = render(
        <div>
          <HeroNetworkCanvas />
          <button type="button">Search</button>
        </div>,
      );
      const button = container.querySelector("button") as HTMLButtonElement;
      fireEvent.mouseMove(button);
      expect(raf).not.toHaveBeenCalled();
    });

    it("stops and parks on a static frame on mouse leave", () => {
      const { raf, cancel } = mockScene();
      render(<HeroNetworkCanvas />);
      const canvas = screen.getByTestId("hero-network-canvas");
      const hoverRoot = canvas.parentElement as HTMLElement;

      fireEvent.mouseMove(canvas);
      expect(raf).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(hoverRoot);
      expect(cancel).toHaveBeenCalled();
      expect(raf).toHaveBeenCalledTimes(1);
    });
  });
});
