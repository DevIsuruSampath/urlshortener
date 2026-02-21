"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";

const MOBILE_NAV_ITEMS = DASHBOARD_NAV_ITEMS;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="dash-bottom-nav" aria-label="Admin mobile navigation">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon; // Capitalize to indicate React component
        return (
          <Link key={item.href} href={item.href} className={`dash-bottom-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
            <span aria-hidden><Icon size={20} strokeWidth={1.5} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
