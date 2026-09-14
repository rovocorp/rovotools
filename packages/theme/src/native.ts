import { ELEVATION, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT, RADIUS, SPACING } from "./tokens";

export const nativeSpacing = SPACING;
export const nativeRadius = RADIUS;
export const nativeFontSize = FONT_SIZE;
export const nativeFontWeight = FONT_WEIGHT;
export const nativeLineHeight = LINE_HEIGHT;

export interface NativeElevationStyle {
  readonly elevation: number;
  readonly shadowColor: string;
  readonly shadowOffset: { readonly width: number; readonly height: number };
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
}

export function nativeElevation(level: 0 | 1 | 2 | 3 | 4): NativeElevationStyle {
  const e = ELEVATION[level];
  return {
    elevation: e.android,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: e.iosShadowOffsetY },
    shadowOpacity: e.iosShadowOpacity,
    shadowRadius: e.iosShadowRadius,
  };
}

export interface NativeTextStyle {
  readonly fontSize: number;
  readonly fontWeight: "400" | "500" | "600" | "700";
  readonly lineHeight: number;
}

export function nativeText(
  size: keyof typeof FONT_SIZE,
  weight: keyof typeof FONT_WEIGHT = "regular",
): NativeTextStyle {
  return {
    fontSize: FONT_SIZE[size],
    fontWeight: String(FONT_WEIGHT[weight]) as NativeTextStyle["fontWeight"],
    lineHeight: Math.round(FONT_SIZE[size] * LINE_HEIGHT.normal),
  };
}
