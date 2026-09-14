import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { darkTheme, getTheme, lightTheme, resolveThemeMode } from "./themes";
import { ELEVATION, RADIUS, SPACING } from "./tokens";
import { cssVariablesForTheme } from "./web";

const cssPath = join(dirname(fileURLToPath(import.meta.url)), "..", "css", "tokens.css");

function cssBlock(mode: "light" | "dark"): string {
  const css = readFileSync(cssPath, "utf8");
  const darkIndex = css.indexOf(".dark {");
  if (mode === "light") {
    return css.slice(0, darkIndex);
  }
  return css.slice(darkIndex);
}

describe("theme integrity", () => {
  it("exposes identical token keys in light and dark themes", () => {
    expect(Object.keys(lightTheme.colors).sort()).toEqual(Object.keys(darkTheme.colors).sort());
    expect(getTheme("light")).toBe(lightTheme);
    expect(getTheme("dark")).toBe(darkTheme);
  });

  it("resolves system preference deterministically", () => {
    expect(resolveThemeMode("light", true)).toBe("light");
    expect(resolveThemeMode("system", true)).toBe("dark");
    expect(resolveThemeMode("system", false)).toBe("light");
  });

  it("uses a 4pt spacing grid and five elevation levels", () => {
    for (const value of Object.values(SPACING)) {
      expect(value % 4).toBe(0);
    }
    expect(Object.keys(ELEVATION)).toEqual(["0", "1", "2", "3", "4"]);
    expect(RADIUS.full).toBeGreaterThan(RADIUS.xxl);
  });
});

describe("css parity", () => {
  it("mirrors every token value in tokens.css per theme", () => {
    for (const theme of [lightTheme, darkTheme]) {
      const block = cssBlock(theme.mode);
      for (const [name, value] of Object.entries(cssVariablesForTheme(theme))) {
        expect(block, `${theme.mode} ${name}`).toContain(`${name}: ${value};`);
      }
    }
  });
});
