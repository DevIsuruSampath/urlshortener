"use client";

import { FormEvent, useEffect, useState } from "react";

import { adminSetup, adminStatus, ApiError } from "@/lib/api";

function friendlySetupError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again.";
  }

  if (error instanceof ApiError) {
    if (error.status === 429) return "Too many attempts. Please wait a minute and retry.";
    return error.message || "Setup failed.";
  }

  return "Setup failed.";
}

export default function AdminSetupPage() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("admin@urlshortener.local");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let alive = true;

    adminStatus()
      .then((res) => {
        if (!alive) return;
        if (res.initialized) {
          window.location.href = "/admin/login";
          return;
        }
        setLoadingStatus(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoadingStatus(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function onInitialize(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setRunning(true);
    setError("");
    try {
      const res = await adminSetup({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      if (res.initialized) {
        window.location.href = "/admin/login";
        return;
      }
      setError("Setup did not complete. Try again.");
    } catch (err) {
      setError(friendlySetupError(err));
    } finally {
      setRunning(false);
    }
  }

  if (loadingStatus) {
    return (
      <main className="container auth-shell">
        <section className="card auth-card">
          <h1>Admin setup</h1>
          <p className="muted">Checking bootstrap status…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container auth-shell">
      <section className="card auth-card">
        <h1>Admin setup</h1>
        <p className="muted">First run detected. Create the only admin account.</p>

        <form className="auth-form" onSubmit={onInitialize}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn" disabled={running} type="submit">
            {running ? "Initializing..." : "Initialize admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
