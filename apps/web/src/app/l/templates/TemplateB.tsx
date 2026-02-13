"use client";

import { useEffect } from "react";
import { safeLoadAdScript } from "@/lib/ads";

export function TemplateB() {
  useEffect(() => {
    safeLoadAdScript("https://example-ad-network.invalid/ad2.js", "monetag-slot-b");
  }, []);

  return <div className="ad-slot">Ad Placeholder B (safe slot)</div>;
}
