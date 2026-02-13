import type { ReactNode } from "react";

export function AdSlot({ children, label = "Advertisement" }: { children: ReactNode; label?: string }) {
  return (
    <section className="interstitial-ads card" aria-label="Advertisements">
      <p className="ad-label">{label}</p>
      {children}
    </section>
  );
}
