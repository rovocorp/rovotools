// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import DateInput, { maskSlashDate } from "../tools/DateInput";

afterEach(() => {
  cleanup();
});

describe("maskSlashDate", () => {
  it("inserts slashes progressively while typing digits", () => {
    expect(maskSlashDate("")).toBe("");
    expect(maskSlashDate("1")).toBe("1");
    expect(maskSlashDate("15")).toBe("15");
    expect(maskSlashDate("150")).toBe("15/0");
    expect(maskSlashDate("1501")).toBe("15/01");
    expect(maskSlashDate("15011")).toBe("15/01/1");
    expect(maskSlashDate("15011990")).toBe("15/01/1990");
  });

  it("is idempotent on already-formatted input", () => {
    expect(maskSlashDate("15/01/1990")).toBe("15/01/1990");
    expect(maskSlashDate("15-01-1990")).toBe("15/01/1990");
  });

  it("caps at 8 digits and leaves ISO and text alone", () => {
    expect(maskSlashDate("15011990111")).toBe("15/01/1990");
    expect(maskSlashDate("1990-01-15")).toBe("1990-01-15");
    expect(maskSlashDate("next friday")).toBe("next friday");
  });
});

describe("DateInput", () => {
  it("masks typed digits with slashes and shows a calendar picker", () => {
    function Harness(): React.ReactElement {
      const [value, setValue] = useState("");
      return <DateInput id="dob" label="Date of birth" value={value} onChange={setValue} />;
    }
    const { container } = render(<Harness />);
    const box = container.querySelector("#dob") as HTMLInputElement;
    expect(box.placeholder).toBe("DD/MM/YYYY");
    fireEvent.change(box, { target: { value: "1501" } });
    expect(box.value).toBe("15/01");
    const picker = container.querySelector("#dob-picker") as HTMLInputElement;
    expect(picker.type).toBe("date");
    expect(picker.getAttribute("aria-label")).toBe("Pick Date of birth from calendar");
  });

  it("normalizes a typed date to DD/MM/YYYY on blur", () => {
    function Harness(): React.ReactElement {
      const [value, setValue] = useState("");
      return <DateInput id="asof" label="Calculate age at" value={value} onChange={setValue} />;
    }
    const { container } = render(<Harness />);
    const box = container.querySelector("#asof") as HTMLInputElement;
    fireEvent.change(box, { target: { value: "1990-01-15" } });
    fireEvent.blur(box);
    expect(box.value).toBe("15/01/1990");
  });
});
