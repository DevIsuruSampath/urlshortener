"use client";

import { useEffect, useState } from "react";

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

  async function onInitialize() {
    setRunning(true);
    setError("");
    try {
      const res = await adminSetup();
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
        <p className="muted">First run detected. Initialize admin using your configured environment credentials.</p>

        {error ? <p className="auth-error">{error}</p> : null}

        <div className="settings-actions" style={{ marginTop: 12 }}>
          <button className="btn" disabled={running} onClick={onInitialize} type="button">
            {running ? "Initializing..." : "Initialize admin"}
          </button>
        </div>
      </section>
    </main>
  );
}
