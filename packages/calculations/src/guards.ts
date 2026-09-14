export function assertFiniteNumber(value: number, name: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

export function assertNonNegative(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be greater than or equal to 0.`);
  }
}

export function assertPositive(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than 0.`);
  }
}

export function assertInteger(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer.`);
  }
}

export function assertPercentage(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (value < 0 || value > 100) {
    throw new RangeError(`${name} must be between 0 and 100.`);
  }
}

export function assertNonEmptyString(value: string, name: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface ParsedIsoDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly time: number;
}

export function parseIsoDate(value: string, name: string): ParsedIsoDate {
  assertNonEmptyString(value, name);
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    throw new RangeError(`${name} must use the YYYY-MM-DD format.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError(`${name} must use the YYYY-MM-DD format.`);
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`${name} contains an invalid month.`);
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    throw new RangeError(`${name} contains an invalid day.`);
  }
  return { year, month, day, time: Date.UTC(year, month - 1, day) };
}

export function roundTo(value: number, decimals: number): number {
  assertFiniteNumber(value, "value");
  assertInteger(decimals, "decimals");
  if (decimals < 0 || decimals > 15) {
    throw new RangeError("decimals must be between 0 and 15.");
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
