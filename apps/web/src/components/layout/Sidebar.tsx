"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";
import { adminLogout } from "@/lib/api";

const APP_DOMAIN = process.env.APP_DOMAIN || "localhost:3000";

export function Sidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {}
    const protocol = window.location.protocol;
    window.location.href = `${protocol}//${APP_DOMAIN}`;
  }

  return (
    <aside className="dash-sidebar card" aria-label="Admin navigation">
      <div className="dash-sidebar-header">
        <p className="dash-sidebar-title">Admin</p>
      </div>
      
      <nav className="dash-nav-list">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <button onClick={handleLogout} className="dash-nav-item logout-btn" type="button">
          <span aria-hidden>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
