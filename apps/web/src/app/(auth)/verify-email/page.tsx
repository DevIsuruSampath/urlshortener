"use client";

import { useState } from "react";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="card auth-card">
      <h1>Verify email</h1>
      <p className="muted">Need a fresh verification email? Request it below.</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <button className="btn" type="submit">Resend verification</button>
      </form>

      {sent ? <p className="auth-success">Verification email sent (if account exists).</p> : null}
    </section>
  );
}
