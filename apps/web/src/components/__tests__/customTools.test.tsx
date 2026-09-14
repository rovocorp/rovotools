// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getCustomToolComponent } from "../tools/custom/customTools";

describe("customTools", () => {
  it("falls back to the generic runner for engine-driven tools", () => {
    expect(getCustomToolComponent("json-formatter")).toBeUndefined();
    expect(getCustomToolComponent("code-minifier")).toBeUndefined();
    expect(getCustomToolComponent("no-such-tool")).toBeUndefined();
  });
});
