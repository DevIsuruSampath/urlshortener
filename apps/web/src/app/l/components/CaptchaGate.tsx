"use client";

import { useState } from "react";

export function CaptchaGate({ required, onToken }: { required: boolean; onToken: (token: string) => void }) {
  const [done, setDone] = useState(false);

  if (!required) return null;

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <p><strong>Cloudflare Turnstile (stub)</strong></p>
      <p className="muted">Demo only. Replace with real Turnstile widget in production.</p>
      <button
        className="btn"
        onClick={() => {
          const token = `cf_stub_${Date.now()}`;
          onToken(token);
          setDone(true);
        }}
      >
        {done ? "Verified" : "I'm human"}
      </button>
    </div>
  );
}
