"use client";

import { useState } from "react";

import { adminLogin, ApiError } from "@/lib/api";

function friendlyAuthError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again in a minute.";
  }

  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";

  if (error.status === 401) return "Invalid admin credentials.";
  if (error.status === 403) return "Admin setup is required before login.";
  if (error.status === 429) return "Too many attempts. Please wait one minute and try again.";
  if (error.status === 400) return error.message;

  return error.message || "Request failed. Please try again.";
}

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.localhost:3000";

export function AuthForm() {
  const [mode, setMode] = useState<"password" | "recovery">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (mode === "password" && !password.trim()) {
      setError("Password is required.");
      return;
    }

    if (mode === "recovery" && !recoveryCode.trim()) {
      setError("Recovery code is required.");
      return;
    }

    setLoading(true);
    try {
      await adminLogin({
        email,
        password: mode === "password" ? password : undefined,
        recovery_code: mode === "recovery" ? recoveryCode : undefined,
      });
      // Redirect to Admin Dashboard (Absolute URL)
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${ADMIN_DOMAIN}`;
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1 style={{ marginBottom: 8 }}>Admin Login</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Single-user admin access.</p>

      <div className="auth-mode-toggle">
        <button
          type="button"
          className={`btn btn-ghost ${mode === "password" ? "is-active" : ""}`}
          onClick={() => {
            setMode("password");
            setError("");
          }}
        >
          Password
        </button>
        <button
          type="button"
          className={`btn btn-ghost ${mode === "recovery" ? "is-active" : ""}`}
          onClick={() => {
            setMode("recovery");
            setError("");
          }}
        >
          Recovery code
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="admin@example.com"
            required
          />
        </label>

        {mode === "password" ? (
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>
        ) : (
          <label>
            <span>Recovery code</span>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              autoComplete="off"
              placeholder="ABCD-EFGH-IJKL"
              required
            />
          </label>
        )}

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "password" ? "Login" : "Login with recovery code"}
        </button>
      </form>

      <div className="auth-help muted">
        <p><strong>Lost your password?</strong></p>
        <p>Use a saved recovery code above, or reset via server terminal.</p>
        <p>Find container id:</p>
        <code>docker ps</code>
        <p>Run reset command:</p>
        <code>docker exec -it &lt;container-id&gt; bash -c "./start.sh reset-admin-password"</code>
      </div>
    </section>
  );
}
