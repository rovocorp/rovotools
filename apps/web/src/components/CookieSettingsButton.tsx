"use client";

import { resetConsent } from "@/lib/analytics";

export default function CookieSettingsButton(): React.ReactElement {
  return (
    <button
      type="button"
      onClick={() => resetConsent()}
      className="text-sm font-medium text-[#5B6B82] hover:text-[#0066FF] dark:text-[#A7A7B3] dark:hover:text-[#5C9CFF] relative inline-block w-fit after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,#0066FF_0%,#00D2FF_28%,#00E676_48%,#FFB300_74%,#F44336_100%)] after:transition-transform after:duration-300 motion-safe:after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm"
    >
      Cookie Settings
    </button>
  );
}
