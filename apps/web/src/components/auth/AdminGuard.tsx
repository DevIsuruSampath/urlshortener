"use client";

import { useEffect, useState } from "react";

import { adminMe, adminStatus, ApiError } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const status = await adminStatus();
        if (!alive) return;

        if (!status.initialized) {
          window.location.href = "/register";
          return;
        }

        await adminMe();
        if (alive) setLoading(false);
      } catch (error) {
        if (!alive) return;

        if (error instanceof ApiError && error.status === 403) {
          window.location.href = "/register";
          return;
        }

        window.location.href = "/login";
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="dash-page">
        <section className="card">
          <p className="muted">Checking admin setup and session…</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
