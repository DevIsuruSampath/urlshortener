"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BarMeta = {
  title: string;
  action?: { href: string; label: string };
};

function getBarMeta(pathname: string): BarMeta {
  if (pathname.startsWith("/admin/links/new")) {
    return { title: "Create Link", action: { href: "/admin/links", label: "Back to Links" } };
  }
  if (pathname.startsWith("/admin/links")) {
    return { title: "Links", action: { href: "/admin/links/new", label: "Create Link" } };
  }
  if (pathname.startsWith("/admin/stats")) return { title: "Quality" };
  if (pathname.startsWith("/admin/settings")) return { title: "Settings" };
  return { title: "Overview" };
}

export function TopBar() {
  const pathname = usePathname();
  const meta = getBarMeta(pathname);

  return (
    <header className="dash-topbar card" aria-label="Admin page header">
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
