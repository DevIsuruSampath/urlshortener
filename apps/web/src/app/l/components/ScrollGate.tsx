"use client";

import { useEffect, useState } from "react";

export function ScrollGate({ onPass }: { onPass: () => void }) {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const ratio = window.scrollY / total;
      if (ratio >= 0.3 && !passed) {
        setPassed(true);
        onPass();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onPass, passed]);

  return <p className="muted">{passed ? "✅ Scroll check complete" : "Scroll down to continue"}</p>;
}
