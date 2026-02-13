"use client";

import { useState } from "react";

export function CaptchaGate({ required, onToken }: { required: boolean; onToken: (token: string) => void }) {
  const [done, setDone] = useState(false);

  if (!required) return null;

  return (
    <div className="captcha-gate card">
      <p>
        <strong>Verify</strong>
      </p>
      <p className="muted">Turnstile widget placeholder (swap with real widget in production).</p>
      <button
        className="btn"
        onClick={() => {
          const token = `cf_stub_${Date.now()}`;
          onToken(token);
          setDone(true);
        }}
        type="button"
      >
        {done ? "Verified" : "I'm human"}
      </button>
    </div>
  );
}
