"use client";

import { useState } from "react";

import { adminLogin, ApiError } from "@/lib/api";

function friendlyAuthError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again in a minute.";
  }

  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";

  if (error.status === 401) return "Invalid admin email or password.";
  if (error.status === 403) return "Admin setup is required before login.";
  if (error.status === 429) return "Too many attempts. Please wait one minute and try again.";
  if (error.status === 400) return error.message;

  return error.message || "Request failed. Please try again.";
}

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem("paidlink_access_token", res.access_token);
      window.location.href = "/admin";
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        window.location.href = "/admin/setup";
        return;
      }
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1>Admin login</h1>
      <p className="muted">Single-user admin access.</p>

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

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
    </section>
  );
}
