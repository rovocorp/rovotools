import { assertFiniteNumber } from "./guards";

export type LengthUnit = "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd" | "mi";
export type WeightUnit = "mg" | "g" | "kg" | "oz" | "lb" | "t";
export type TemperatureUnit = "C" | "F" | "K";

const METERS_PER_UNIT: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const KG_PER_UNIT: Record<WeightUnit, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  oz: 0.028349523125,
  lb: 0.45359237,
  t: 1000,
};

export interface UnitConversionInput<Unit> {
  readonly value: number;
  readonly from: Unit;
  readonly to: Unit;
}

function toCelsius(value: number, from: TemperatureUnit): number {
  if (from === "C") {
    return value;
  }
  if (from === "F") {
    return ((value - 32) * 5) / 9;
  }
  return value - 273.15;
}

function fromCelsius(value: number, to: TemperatureUnit): number {
  if (to === "C") {
    return value;
  }
  if (to === "F") {
    return (value * 9) / 5 + 32;
  }
  return value + 273.15;
}

export function convertLength(input: UnitConversionInput<LengthUnit>): number {
  assertFiniteNumber(input.value, "value");
  const meters = input.value * METERS_PER_UNIT[input.from];
  return meters / METERS_PER_UNIT[input.to];
}

export function convertWeight(input: UnitConversionInput<WeightUnit>): number {
  assertFiniteNumber(input.value, "value");
  const kg = input.value * KG_PER_UNIT[input.from];
  return kg / KG_PER_UNIT[input.to];
}

export function convertTemperature(input: UnitConversionInput<TemperatureUnit>): number {
  assertFiniteNumber(input.value, "value");
  const celsius = toCelsius(input.value, input.from);
  if (celsius < -273.15) {
    throw new RangeError("Temperature cannot fall below absolute zero.");
  }
  return fromCelsius(celsius, input.to);
}
