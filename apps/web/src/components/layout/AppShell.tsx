"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="container dash-shell">
      <Sidebar />
      <div className="dash-content">
        <TopBar />
        <div key={pathname} className="page-content">
          {children}
        </div>
      </div>
      <MobileNav />
    </section>
  );
}
