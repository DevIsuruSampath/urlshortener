"use client";

export function ContinueButton({ disabled, loading, onClick }: { disabled: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button className="btn interstitial-continue" disabled={disabled || loading} onClick={onClick} type="button">
      {loading ? "Checking…" : "Continue"}
    </button>
  );
}
