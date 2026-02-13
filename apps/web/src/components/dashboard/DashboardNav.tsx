"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/links", label: "Links", icon: "🔗" },
  { href: "/dashboard/earnings", label: "Earnings", icon: "💰" },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: "🏦" },
  { href: "/dashboard/tools", label: "Tools", icon: "🧰" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="dash-sidebar card" aria-label="Dashboard navigation">
        <p className="dash-sidebar-title">Dashboard</p>
        <nav className="dash-nav-list">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`dash-nav-item ${isActive(pathname, item.href) ? "active" : ""}`}>
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="dash-bottom-nav" aria-label="Dashboard mobile navigation">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={`dash-bottom-item ${isActive(pathname, item.href) ? "active" : ""}`}>
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
