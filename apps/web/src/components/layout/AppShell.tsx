import type { ReactNode } from "react";

import { DashboardTopBar } from "./DashboardTopBar";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <section className="container dash-shell">
      <Sidebar />
      <div className="dash-content">
        <DashboardTopBar />
        {children}
      </div>
      <MobileNav />
    </section>
  );
}
