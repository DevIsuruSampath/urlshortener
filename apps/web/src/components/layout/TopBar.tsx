"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

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

interface TopBarProps {
  onSidebarToggle?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function TopBar({ onSidebarToggle, onMobileMenuToggle, isMobileMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const meta = getBarMeta(pathname);

  return (
    <header className="dash-topbar card" aria-label="Admin page header">
      <div className="dash-topbar-left">
        {/* Desktop Sidebar Toggle */}
        <button
          className="sidebar-toggle-btn"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
          type="button"
        >
          {onSidebarToggle ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <p className="dash-topbar-title">{meta.title}</p>
      </div>
      
      <div className="dash-topbar-right">
        {/* Mobile Menu Toggle (Hamburger) */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          type="button"
        >
          <Menu size={24} />
        </button>
        
        {meta.action ? (
          <div className="dash-topbar-actions">
            <Link href={meta.action.href} className="btn">
              {meta.action.label}
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
