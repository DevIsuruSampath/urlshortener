"use client";

import { useEffect, useState } from "react";

import { adminMe } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    adminMe()
      .then(() => {
        if (alive) setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        window.location.href = "/login";
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="dash-page">
        <section className="card">
          <p className="muted">Checking admin session…</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
