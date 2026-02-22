"use client";

import { useEffect, useState } from "react";

import { adminMe, ApiError } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // Just check if user is authenticated - adminStatus check is redundant
        // If admin not initialized, adminMe will return 403 and we redirect
        await adminMe();
        if (alive) {
          setLoading(false);
          setChecked(true);
        }
      } catch (error) {
        if (!alive) return;

        const apiError = error as ApiError;
        // 403 could mean admin not initialized OR not authenticated
        // Either way, redirect to login
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
          <p className="muted">Loading…</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
