"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";
import { UserMenu } from "./UserMenu";
import { useAuthMe } from "@/lib/api-hooks";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export function Sidebar() {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useAuthMe();

  return (
    <aside className="dash-sidebar card" aria-label="Admin navigation">
      {/* Top: Brand Header */}
      <div className="dash-sidebar-header">
        <p className="dash-sidebar-brand">{PROJECT_NAME}</p>
        <p className="dash-sidebar-title">Admin Dashboard</p>
      </div>
      
      {/* Middle: Navigation Links */}
      <nav className="dash-nav-list">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const Icon = item.icon; // Capitalize to indicate React component
          return (
            <Link key={item.href} href={item.href} className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
              <span aria-hidden><Icon size={20} strokeWidth={1.5} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <div className="dash-nav-spacer" />
        
        {/* Bottom: Account Widget */}
        {!isLoading && user && !error && (
          <UserMenu email={user.email} />
        )}
      </nav>
    </aside>
  );
}
