"use client";

import { useEffect, useMemo } from "react";

import { safeLoadAdScript } from "@/lib/ads";

import { AdSlot } from "./AdSlot";

const templates = [
  {
    id: "template-a",
    scriptId: "ad-template-a",
    scriptSrc: "https://www.profitableratecpm.com/placeholder-a.js",
    text: "Ad slot A (non-interactive)",
  },
  {
    id: "template-b",
    scriptId: "ad-template-b",
    scriptSrc: "https://monetag.com/placeholder-b.js",
    text: "Ad slot B (non-interactive)",
  },
] as const;

export function AdTemplateSwitcher({ variantSeed = 0 }: { variantSeed?: number }) {
  const template = useMemo(() => templates[Math.abs(variantSeed) % templates.length], [variantSeed]);

  useEffect(() => {
    safeLoadAdScript(template.scriptSrc, template.scriptId);
  }, [template.scriptId, template.scriptSrc]);

  return (
    <AdSlot>
      <div className="ad-slot" data-template={template.id}>
        {template.text}
      </div>
    </AdSlot>
  );
}
