"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar card" aria-label="Admin navigation">
      <p className="dash-sidebar-title">Admin</p>
      <nav className="dash-nav-list">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
