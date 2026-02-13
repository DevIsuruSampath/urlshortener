"use client";

import { useEffect, useRef, useState } from "react";

export function StepTimer({ seconds, resetKey, onDone }: { seconds: number; resetKey: string; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const fired = useRef(false);

  useEffect(() => {
    setLeft(seconds);
    fired.current = false;
  }, [seconds, resetKey]);

  useEffect(() => {
    if (left <= 0) {
      if (!fired.current) {
        fired.current = true;
        onDone();
      }
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onDone]);

  return <p className="muted">Timer: {left}s</p>;
}
