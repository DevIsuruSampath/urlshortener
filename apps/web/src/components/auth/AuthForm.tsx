"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError, login, register } from "@/lib/api";

type Mode = "login" | "register";

function friendlyAuthError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again in a minute.";
  }

  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";

  if (error.status === 401) return "Invalid email or password.";
  if (error.status === 409) return "Email already exists. Try logging in.";
  if (error.status === 429) return "Too many attempts. Please wait one minute and try again.";
  if (error.status === 400) return error.message;

  return error.message || "Request failed. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const res = isLogin ? await login({ email, password }) : await register({ email, password });
      localStorage.setItem("paidlink_access_token", res.access_token);
      setSuccess(isLogin ? "Logged in successfully." : "Account created successfully.");
      window.location.href = "/dashboard";
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card auth-card">
      <h1>{isLogin ? "Login" : "Create account"}</h1>
      <p className="muted">{isLogin ? "Access your dashboard securely." : "Start creating protected paid links."}</p>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}
        {success ? <p className="auth-success">{success}</p> : null}

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      <div className="auth-links muted">
        {isLogin ? (
          <>
            <Link href="/forgot-password">Forgot password?</Link>
            <span>·</span>
            <Link href="/register">Create account</Link>
          </>
        ) : (
          <>
            <Link href="/login">Already have an account?</Link>
            <span>·</span>
            <Link href="/verify-email">Verify email</Link>
          </>
        )}
      </div>
    </section>
  );
}
