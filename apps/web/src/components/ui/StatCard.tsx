"use client";

import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  children,
  index = 0,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  index?: number;
}) {
  return (
    <article className="card dash-stat-card">
      <p className="muted">{label}</p>
      <h2>{value}</h2>
      {hint ? <p className="muted">{hint}</p> : null}
      {children}
    </article>
  );
}
