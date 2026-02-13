import { Suspense } from "react";
import { InterstitialClient } from "./InterstitialClient";

export default function InterstitialPage() {
  return (
    <Suspense fallback={<main className="container"><p className="muted">Loading step…</p></main>}>
      <InterstitialClient />
    </Suspense>
  );
}
