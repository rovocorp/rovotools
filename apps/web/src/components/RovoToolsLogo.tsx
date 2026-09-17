"use client";

import React from "react";
import Image from "next/image";

interface RovoToolsLogoProps {
  className?: string;
  showTagline?: boolean;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function RovoToolsMark({ size = 36, className = "" }: { size?: number; className?: string }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Top Loop Gradient: Cobalt Blue -> Electric Cyan -> Emerald Green */}
        <linearGradient id="rovo-loop-grad" x1="15" y1="10" x2="85" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="45%" stopColor="#00D2FF" />
          <stop offset="100%" stopColor="#00E676" />
        </linearGradient>

        {/* Lower Leg Gradient: Amber Gold -> Coral Orange -> Crimson Red */}
        <linearGradient id="rovo-leg-grad" x1="45" y1="40" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="50%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#F44336" />
        </linearGradient>

        {/* Center Wing / Arrow Negative Space Gradient */}
        <linearGradient id="rovo-arrow-grad" x1="30" y1="35" x2="60" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0043CC" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
      </defs>

      {/* Digital Pixel Matrix Blocks (Left side) */}
      <rect x="5" y="42" width="7" height="7" rx="1.5" fill="#00D2FF" />
      <rect x="14" y="34" width="7" height="7" rx="1.5" fill="#0066FF" />
      <rect x="5" y="52" width="7" height="7" rx="1.5" fill="#00A3FF" />
      <rect x="14" y="44" width="7" height="7" rx="1.5" fill="#00E676" />
      <rect x="14" y="54" width="7" height="7" rx="1.5" fill="#FFB300" />
      <rect x="23" y="48" width="7" height="7" rx="1.5" fill="#FF5722" />
      <rect x="14" y="64" width="7" height="7" rx="1.5" fill="#F44336" />

      {/* Main Stylized 'R' - Top Loop */}
      <path
        d="M26 24C26 17.3726 31.3726 12 38 12H68C77.9411 12 86 20.0589 86 30C86 39.9411 77.9411 48 68 48H50L34.5 48.5C29.8056 48.5 26 44.6944 26 40V24Z"
        fill="url(#rovo-loop-grad)"
      />

      {/* Main Stylized 'R' - Lower Leg */}
      <path
        d="M48 44L76 82C78.5 85.5 83.5 86 87.5 83C90.5 80.5 90 76 86.5 72.5L62 42H48Z"
        fill="url(#rovo-leg-grad)"
      />

      {/* Forward Arrow Silhouette in negative space */}
      <path
        d="M38 28L58 35L38 42L44 35L38 28Z"
        fill="url(#rovo-arrow-grad)"
      />
    </svg>
  );
}

export function RovoToolsImageLogo({
  height = 36,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}): React.ReactElement {
  // Raster lockups: light is the navy-ink lockup on white, dark is rebuilt
  // from it with a transparent background and white "Rovo" ink so it blends
  // into the dark header with no box edge. Both are 1624x383.
  const lockupWidth = Math.round(height * (1624 / 383));
  return (
    <>
      <Image
        src="/logo.png"
        alt="RovoTools — Free Online Tools for Everyday Work"
        width={lockupWidth}
        height={height}
        priority={priority}
        className={`h-auto w-auto rounded-md bg-white object-contain px-1 py-0.5 dark:hidden ${className}`}
        style={{ height, width: "auto" }}
      />
      <Image
        src="/logo-dark.png"
        alt="RovoTools — Free Online Tools for Everyday Work"
        width={lockupWidth}
        height={height}
        priority={priority}
        className={`hidden h-auto w-auto object-contain dark:block ${className}`}
        style={{ height, width: "auto" }}
      />
    </>
  );
}

export default function RovoToolsLogo({
  className = "",
  showTagline = false,
  iconOnly = false,
  size = "md",
}: RovoToolsLogoProps): React.ReactElement {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 60,
  };

  const currentSize = pixelSizes[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5">
        <RovoToolsMark size={currentSize} />
        {!iconOnly && (
          <div className="flex flex-col leading-none">
            <div className="flex items-center font-extrabold tracking-tight text-zinc-900 dark:text-white" style={{ fontSize: `${currentSize * 0.72}px` }}>
              <span>Rovo</span>
              <span className="bg-gradient-to-r from-[#0066FF] via-[#00E676] via-[#FFB300] via-[#FF5722] to-[#F44336] bg-clip-text text-transparent">
                Tools
              </span>
            </div>
            {showTagline && (
              <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Free Online Tools for Everyday Work
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
