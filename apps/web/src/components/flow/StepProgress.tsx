export function StepProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.min(Math.max(step, 1), safeTotal);
  const percent = Math.min(100, Math.round((safeStep / safeTotal) * 100));

  return (
    <section className="interstitial-progress card" aria-live="polite">
      <p>
        Step {safeStep}/{safeTotal}
      </p>
      <div className="progress-track" role="progressbar" aria-valuenow={safeStep} aria-valuemin={1} aria-valuemax={safeTotal}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
