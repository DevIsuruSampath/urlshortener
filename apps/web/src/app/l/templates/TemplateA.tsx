"use client";

import { useEffect } from "react";
import { safeLoadAdScript } from "@/lib/ads";

export function TemplateA() {
  useEffect(() => {
    safeLoadAdScript("https://example-ad-network.invalid/ad.js", "adsterra-slot-a");
  }, []);

  return <div className="ad-slot">Ad Placeholder A (safe slot)</div>;
}
