"use client";

export function ContinueButton({ disabled, loading, onClick }: { disabled: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button className="btn" disabled={disabled || loading} onClick={onClick}>
      {loading ? "Checking…" : "Continue"}
    </button>
  );
}
