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
