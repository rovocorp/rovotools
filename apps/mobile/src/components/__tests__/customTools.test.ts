import { getCustomMobileToolComponent } from "../customTools";

describe("customTools", () => {
  it("falls back to the generic runner for engine-driven tools", () => {
    expect(getCustomMobileToolComponent("json-formatter")).toBeUndefined();
    expect(getCustomMobileToolComponent("code-minifier")).toBeUndefined();
    expect(getCustomMobileToolComponent("no-such-tool")).toBeUndefined();
  });
});
