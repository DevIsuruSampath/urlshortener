"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="dash-bottom-nav" aria-label="Dashboard mobile navigation">
      {DASHBOARD_NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`dash-bottom-item ${isActivePath(pathname, item.href) ? "active" : ""}`}>
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
