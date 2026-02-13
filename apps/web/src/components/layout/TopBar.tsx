"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BarMeta = {
  title: string;
  action?: { href: string; label: string };
};

function getBarMeta(pathname: string): BarMeta {
  if (pathname.startsWith("/dashboard/links/new")) {
    return { title: "Create Link", action: { href: "/dashboard/links", label: "Back to Links" } };
  }
  if (pathname.startsWith("/dashboard/links")) {
    return { title: "Links", action: { href: "/dashboard/links/new", label: "Create Link" } };
  }
  if (pathname.startsWith("/dashboard/earnings")) return { title: "Earnings" };
  if (pathname.startsWith("/dashboard/withdrawals")) return { title: "Withdrawals" };
  if (pathname.startsWith("/dashboard/settings")) return { title: "Settings" };
  if (pathname.startsWith("/dashboard/tools")) return { title: "Tools" };
  return { title: "Overview" };
}

export function TopBar() {
  const pathname = usePathname();
  const meta = getBarMeta(pathname);

  return (
    <header className="dash-topbar card" aria-label="Dashboard page header">
      <p className="dash-topbar-title">{meta.title}</p>
      {meta.action ? (
        <div className="dash-topbar-actions">
          <Link href={meta.action.href} className="btn">
            {meta.action.label}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
