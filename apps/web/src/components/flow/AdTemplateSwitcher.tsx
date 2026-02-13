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

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function AdTemplateSwitcher({ variantSeed = 0 }: { variantSeed?: number }) {
  const template = useMemo(() => templates[Math.abs(variantSeed) % templates.length], [variantSeed]);

  useEffect(() => {
    const w = window as IdleWindow;

    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => {
        safeLoadAdScript(template.scriptSrc, template.scriptId);
      }, { timeout: 1800 });

      return () => {
        if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      };
    }

    const timeout = window.setTimeout(() => {
      safeLoadAdScript(template.scriptSrc, template.scriptId);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [template.scriptId, template.scriptSrc]);

  return (
    <AdSlot>
      <div className="ad-slot" data-template={template.id}>
        {template.text}
      </div>
    </AdSlot>
  );
}
