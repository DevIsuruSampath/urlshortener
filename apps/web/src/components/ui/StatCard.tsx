"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="card dash-stat-card"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={reduce ? undefined : { duration: 0.26, ease: "easeOut", delay: Math.min(index * 0.04, 0.2) }}
    >
      <p className="muted">{label}</p>
      <h2>{value}</h2>
      {hint ? <p className="muted">{hint}</p> : null}
      {children}
    </motion.article>
  );
}
