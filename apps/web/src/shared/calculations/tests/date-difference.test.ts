import { describe, expect, it } from "vitest";

import {
  calculateDateDifference,
  formatDDMMYYYY,
  parseFlexibleDate,
  toIsoDate,
} from "../date-difference";

describe("parseFlexibleDate", () => {
  it("accepts DD-MM-YYYY, DD/MM/YYYY and YYYY-MM-DD", () => {
    expect(parseFlexibleDate("12-09-2026", "from")).toMatchObject({ year: 2026, month: 9, day: 12 });
    expect(parseFlexibleDate("12/09/2026", "from")).toMatchObject({ year: 2026, month: 9, day: 12 });
    expect(parseFlexibleDate("2026-09-12", "from")).toMatchObject({ year: 2026, month: 9, day: 12 });
  });

  it("treats the first part as day (DD first, not MM first)", () => {
    expect(parseFlexibleDate("05-03-2026", "from")).toMatchObject({ month: 3, day: 5 });
    expect(parseFlexibleDate("05/03/2026", "from")).toMatchObject({ month: 3, day: 5 });
  });

  it("normalizes display and ISO forms", () => {
    const parsed = parseFlexibleDate("5-3-2026", "from");
    expect(formatDDMMYYYY(parsed)).toBe("05-03-2026");
    expect(toIsoDate(parsed)).toBe("2026-03-05");
  });

  it("accepts leap day and rejects impossible dates", () => {
    expect(parseFlexibleDate("29-02-2024", "from").day).toBe(29);
    expect(() => parseFlexibleDate("29-02-2025", "from")).toThrow(RangeError);
    expect(() => parseFlexibleDate("31-02-2026", "from")).toThrow(RangeError);
    expect(() => parseFlexibleDate("12-13-2026", "from")).toThrow(RangeError);
    expect(() => parseFlexibleDate("not-a-date", "from")).toThrow(RangeError);
    expect(() => parseFlexibleDate("", "from")).toThrow(RangeError);
  });
});

describe("calculateDateDifference", () => {
  it("computes age-like years plus totals across formats", () => {
    const result = calculateDateDifference({ from: "01-01-2020", to: "2026-09-12" });
    expect(result.years).toBe(6);
    expect(result.totalDays).toBe(2446);
    expect(result.weeks).toBe(Math.floor(2446 / 7));
    expect(result.breakdown).toBe("6 years, 8 months, 11 days");
  });

  it("handles same-day and leap spans", () => {
    expect(calculateDateDifference({ from: "12/09/2026", to: "12-09-2026" })).toMatchObject({
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    });
    const leap = calculateDateDifference({ from: "28-02-2024", to: "01-03-2024" });
    expect(leap.totalDays).toBe(2);
  });

  it("rejects reversed and invalid dates with wrong-date messages", () => {
    expect(() => calculateDateDifference({ from: "12-09-2026", to: "01-01-2026" })).toThrow(
      "To date must be on or after From date.",
    );
    expect(() => calculateDateDifference({ from: "31-02-2026", to: "12-09-2026" })).toThrow(
      RangeError,
    );
  });
});
