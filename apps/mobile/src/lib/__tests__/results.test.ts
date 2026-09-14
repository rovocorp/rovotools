import { formatResultsText, resultsToCsv } from "@/lib/results";

const OUTPUTS = [
  { id: "bmi", type: "number", labelKey: "tools.bmi-calculator.bmi" },
  { id: "category", type: "string", labelKey: "tools.bmi-calculator.category" },
] as const;

describe("results helpers", () => {
  it("formats human-readable result text", () => {
    expect(formatResultsText("BMI Calculator", [...OUTPUTS], { bmi: 22.86, category: "normal" })).toBe(
      "BMI Calculator\nBMI: 22.86\nCategory: normal",
    );
  });

  it("renders missing values as placeholders", () => {
    expect(formatResultsText("T", [...OUTPUTS], {})).toBe("T\nBMI: —\nCategory: —");
  });

  it("exports valid CSV with quoting", () => {
    expect(resultsToCsv([...OUTPUTS], { bmi: 22.86, category: 'a, "b"' })).toBe(
      'BMI,Category\n22.86,"a, ""b"""\n',
    );
  });
});
