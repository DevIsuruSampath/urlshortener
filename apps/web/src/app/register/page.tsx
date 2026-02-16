"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { adminSetup, adminStatus, ApiError } from "@/lib/api";

function friendlySetupError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again.";
  }

  if (error instanceof ApiError) {
    if (error.status === 403) return "Invalid or missing setup token.";
    if (error.status === 429) return "Too many attempts. Please wait a minute and retry.";
    return error.message || "Setup failed.";
  }

  return "Setup failed.";
}

export default function AdminSetupPage() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState("admin@urlshortener.local");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const setupToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") || "";
  }, []);

  useEffect(() => {
    let alive = true;

    adminStatus()
      .then((res) => {
        if (!alive) return;
        if (res.initialized) {
          window.location.href = "/login";
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
        setup_token: setupToken || undefined,
      });

      if (!res.initialized) {
        setError("Setup did not complete. Try again.");
        return;
      }

      setRecoveryCodes(res.recovery_codes || []);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(friendlySetupError(err));
    } finally {
      setRunning(false);
    }
  }

  async function copyCodes() {
    if (!recoveryCodes.length) return;
    const content = recoveryCodes.join("\n");
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard errors silently.
    }
  }

  function downloadCodes() {
    if (!recoveryCodes.length) return;
    const content = recoveryCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

  if (recoveryCodes.length) {
    return (
      <main className="container auth-shell">
        <section className="card auth-card">
          <h1>Save recovery codes</h1>
          <p className="muted">
            Setup completed. These 10 recovery codes are shown once. Store them safely.
          </p>

          <div className="auth-help">
            {recoveryCodes.map((code) => (
              <code key={code}>{code}</code>
            ))}
          </div>

          <div className="auth-links">
            <button className="btn btn-ghost" type="button" onClick={copyCodes}>
              {copied ? "Copied" : "Copy codes"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={downloadCodes}>
              Download .txt
            </button>
            <button className="btn" type="button" onClick={() => (window.location.href = "/login")}>
              I saved them, continue
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container auth-shell">
      <section className="card auth-card">
        <h1>Admin setup</h1>
        <p className="muted">First run detected. Create the only admin account.</p>

        {!setupToken ? (
          <p className="muted">If setup token is enabled, open this page with <code>?token=YOUR_TOKEN</code>.</p>
        ) : null}

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
