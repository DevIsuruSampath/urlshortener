"use client";

import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  children,
  index = 0,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  index?: number;
  icon?: ReactNode;
}) {
  return (
    <article className="card dash-stat-card">
      <div className="stat-card-header">
        {icon && <div className="stat-card-icon">{icon}</div>}
        <p className="muted">{label}</p>
      </div>
      <h2>{value}</h2>
      {hint ? <p className="muted">{hint}</p> : null}
      {children}
    </article>
  );
}
