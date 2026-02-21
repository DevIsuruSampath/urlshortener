"use client";

import { useEffect, useState } from "react";

import { adminMe, adminStatus, ApiError } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // Check if admin is initialized
        const status = await adminStatus();
        if (!alive) return;

        if (!status.initialized) {
          // Admin not setup yet, redirect to setup or show message
          // For now, redirect to login (setup happens via API)
          window.location.href = '/login';
          return;
        }

        // Check if user is authenticated (cookie check)
        await adminMe();
        if (alive) setLoading(false);
      } catch (error) {
        if (!alive) return;

        // Any error (401, 403, network) → redirect to login
        window.location.href = '/login';
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
