"use client";

import { useEffect, useState } from "react";

import { adminMe, adminStatus, ApiError } from "@/lib/api";

const AUTH_DOMAIN = process.env.AUTH_DOMAIN || "auth.localhost:3000";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const protocol = window.location.protocol;

    async function run() {
      try {
        const status = await adminStatus();
        if (!alive) return;

        if (!status.initialized) {
          window.location.href = `${protocol}//${AUTH_DOMAIN}/login`;
          return;
        }

        await adminMe();
        if (alive) setLoading(false);
      } catch (error) {
        if (!alive) return;

        if (error instanceof ApiError && error.status === 403) {
          window.location.href = `${protocol}//${AUTH_DOMAIN}/login`;
          return;
        }

        window.location.href = `${protocol}//${AUTH_DOMAIN}/login`;
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
