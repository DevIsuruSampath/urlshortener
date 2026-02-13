"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function StepProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.min(Math.max(step, 1), safeTotal);
  const percent = Math.min(100, Math.round((safeStep / safeTotal) * 100));
  const reduce = useReducedMotion();

  return (
    <section className="interstitial-progress card" aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={`step-${safeStep}`}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={reduce ? undefined : { duration: 0.18 }}
        >
          Step {safeStep}/{safeTotal}
        </motion.p>
      </AnimatePresence>

      <div className="progress-track" role="progressbar" aria-valuenow={safeStep} aria-valuemin={1} aria-valuemax={safeTotal}>
        <motion.span
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={reduce ? undefined : { duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </section>
  );
}
