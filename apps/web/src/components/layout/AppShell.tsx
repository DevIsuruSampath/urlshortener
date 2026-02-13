import type { ReactNode } from "react";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <section className="container dash-shell">
      <Sidebar />
      <div className="dash-content">
        <TopBar />
        {children}
      </div>
      <MobileNav />
    </section>
  );
}
