"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-items";
import { isActivePath } from "./nav-utils";
import { UserMenu } from "./UserMenu";
import { useAuthMe } from "@/lib/api-hooks";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

interface SidebarProps {
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isOpen = true, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: user, isLoading, error } = useAuthMe();
  const navRef = useRef<HTMLElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onMobileClose?.();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`dash-sidebar card ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`} 
        aria-label="Admin navigation"
      >
        {/* Top: Brand Header */}
        <div className="dash-sidebar-header">
          <p className="dash-sidebar-brand">{PROJECT_NAME}</p>
          <p className={`dash-sidebar-title ${!isOpen ? 'collapsed-title' : ''}`}>Admin Dashboard</p>
        </div>
        
        {/* Middle: Navigation Links */}
        <nav className="dash-nav-list" ref={navRef} role="navigation">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon; // Capitalize to indicate React component
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""} ${!isOpen ? 'collapsed' : ''}`}
                title={!isOpen ? item.label : undefined}
                tabIndex={0}
              >
                <span aria-hidden><Icon size={20} strokeWidth={1.5} /></span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
          
          <div className="dash-nav-spacer" />
          
          {/* Bottom: Account Widget */}
          {!isLoading && user && !error && (
            <UserMenu email={user.email} isCollapsed={!isOpen} />
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside 
        className={`mobile-sidebar-drawer ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sidebar-header">
          <button 
            className="mobile-close-btn"
            onClick={onMobileClose}
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
          <p className="dash-sidebar-brand">{PROJECT_NAME}</p>
        </div>
        
        <nav className="dash-nav-list" role="navigation">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`dash-nav-item ${isActivePath(pathname, item.href) ? "active" : ""}`}
                onClick={onMobileClose}
                tabIndex={0}
              >
                <span aria-hidden><Icon size={20} strokeWidth={1.5} /></span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <div className="dash-nav-spacer" />
          
          {!isLoading && user && !error && (
            <UserMenu email={user.email} onMobileClose={onMobileClose} />
          )}
        </nav>
      </aside>
    </>
  );
}
