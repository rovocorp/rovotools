"use client";

import React from "react";
import Image from "next/image";

export function RovoToolsImageLogo({
  height = 36,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}): React.ReactElement {
  // Original raster lockups (previous logo design): light is the navy-ink
  // lockup, dark is the white-ink lockup. Both PNGs are transparent, so
  // no background fill or bg-white wrapper — the logo blends into the
  // header/footer in both themes with no box edge.
  const lockupWidth = Math.round(height * (560 / 132));
  return (
    <>
      <Image
        src="/logo.png"
        alt="RovoTools — Free Online Tools for Everyday Work"
        width={lockupWidth}
        height={height}
        priority={priority}
        className={`h-auto w-auto object-contain dark:hidden ${className}`}
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
