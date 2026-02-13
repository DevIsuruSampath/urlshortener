"use client";

import { useState } from "react";

import { useToast } from "./Toast";

export function CopyButton({ value, label = "Copy", className = "btn btn-ghost btn-small" }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { push } = useToast();

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      push("Copied to clipboard", "success");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      push("Copy failed", "error");
    }
  }

  return (
    <button type="button" className={className} onClick={onCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}
