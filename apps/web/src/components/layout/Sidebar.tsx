"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";
import { adminLogout, adminMe } from "@/lib/api";
import { UserMenu } from "./UserMenu";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await adminMe();
        setUserEmail(user.email);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <aside className="dash-sidebar card" aria-label="Admin navigation">
      {/* Top: Brand Header */}
      <div className="dash-sidebar-header">
        <p className="dash-sidebar-brand">{PROJECT_NAME}</p>
        <p className="dash-sidebar-title">Admin Dashboard</p>
      </div>
      
      {/* Middle: Navigation Links */}
      <nav className="dash-nav-list">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <div className="dash-nav-spacer" />
        
        {/* Bottom: Account Widget */}
        {!isLoading && (
          <UserMenu email={userEmail} />
        )}
      </nav>
    </aside>
  );
}
