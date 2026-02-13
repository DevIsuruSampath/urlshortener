import type { ReactNode } from "react";

import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="container dash-shell">
      <DashboardNav />
      <div className="dash-content">{children}</div>
    </section>
  );
}
