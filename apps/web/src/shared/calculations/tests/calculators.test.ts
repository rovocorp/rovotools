import { describe, it, expect } from "vitest";

import { add, subtract, multiply, divide, average, sum, clamp, round } from "../calculators";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });
});

describe("subtract", () => {
  it("should subtract two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
    expect(subtract(0, 5)).toBe(-5);
  });
});

describe("multiply", () => {
  it("should multiply two numbers", () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(0, 100)).toBe(0);
  });
});

describe("divide", () => {
  it("should divide two numbers", () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });
  it("should throw on division by zero", () => {
    expect(() => divide(10, 0)).toThrow(RangeError);
  });
});

describe("average", () => {
  it("should calculate average", () => {
    expect(average([1, 2, 3])).toBe(2);
    expect(average([])).toBe(0);
  });
});

describe("sum", () => {
  it("should sum array", () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
    expect(sum([])).toBe(0);
  });
});

describe("clamp", () => {
  it("should clamp value", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe("round", () => {
  it("should round to decimals", () => {
    expect(round(3.14159, 2)).toBe(3.14);
    expect(round(3.5)).toBe(4);
  });
});
