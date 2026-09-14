export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new RangeError("Division by zero");
  }
  return a / b;
}

export function percentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

export function average(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function sum(values: ReadonlyArray<number>): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function min(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    throw new RangeError("Cannot find minimum of empty array");
  }
  return Math.min(...values);
}

export function max(values: ReadonlyArray<number>): number {
  if (values.length === 0) {
    throw new RangeError("Cannot find maximum of empty array");
  }
  return Math.max(...values);
}

export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function hypotenuse(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
