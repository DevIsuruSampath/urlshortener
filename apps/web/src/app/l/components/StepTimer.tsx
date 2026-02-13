"use client";

import { useEffect, useState } from "react";

export function StepTimer({ seconds, resetKey, onDone }: { seconds: number; resetKey: string; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onDone]);

  return <p className="muted">Please wait {left}s…</p>;
}
