"use client";

import dynamic from "next/dynamic";

// Client boundary for the ambient hero canvas. ssr:false keeps it out of the
// server HTML/initial bundle; the static CSS grid underneath paints instantly
// and remains the no-JS fallback.
const HeroNetworkCanvas = dynamic(() => import("@/components/hero/HeroNetworkCanvas"), {
  ssr: false,
});

export default function HeroNetwork(): React.ReactElement {
  return <HeroNetworkCanvas />;
}
