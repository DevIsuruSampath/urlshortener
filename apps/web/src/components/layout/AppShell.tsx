import type { ReactNode } from "react";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <section className="container dash-shell">
      <Sidebar />
      <div className="dash-content">{children}</div>
      <MobileNav />
    </section>
  );
}
