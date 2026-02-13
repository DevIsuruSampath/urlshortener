"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(true);
  }

  return (
    <section className="card auth-card">
      <h1>Forgot password</h1>
      <p className="muted">Enter your account email. We will send reset instructions if the account exists.</p>

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
        <button className="btn" type="submit">Send reset link</button>
      </form>

      {done ? <p className="auth-success">If your email exists, a reset link will be sent shortly.</p> : null}
    </section>
  );
}
