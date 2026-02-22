"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useLogout } from "@/lib/api-hooks";

interface UserMenuProps {
  email: string;
  isCollapsed?: boolean;
  onMobileClose?: () => void;
}

export function UserMenu({ email, isCollapsed = false, onMobileClose }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutMutation = useLogout();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // In collapsed mode, show just avatar button with tooltip
  if (isCollapsed) {
    return (
      <div className="user-menu-wrapper" ref={menuRef}>
        <button
          className="user-menu-trigger user-menu-trigger-collapsed"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="User menu"
          title={email}
        >
          <div className="user-avatar">
            <User size={18} strokeWidth={1.5} />
          </div>
        </button>

        {isOpen && (
          <div className="user-menu-popover user-menu-popover-collapsed">
            <div className="user-menu-header">
              <div className="user-avatar">
                <User size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="user-email">{email}</p>
                <p className="user-role">Administrator</p>
              </div>
            </div>

            <div className="user-menu-divider" />

            <Link href="/admin/profile" className="user-menu-item" onClick={() => setIsOpen(false)}>
              <User size={18} strokeWidth={1.5} />
              <span>Profile</span>
            </Link>

            <button className="user-menu-item logout-item" onClick={handleLogout}>
              <LogOut size={18} strokeWidth={1.5} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full user menu (normal or mobile)
  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <div className="user-avatar">
          <User size={18} strokeWidth={1.5} />
        </div>
        <div className="user-info">
          <span className="user-email">{email}</span>
          <span className="user-role">Admin</span>
        </div>
        <span className="user-menu-chevron" aria-hidden>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {isOpen && (
        <div className="user-menu-popover">
          <div className="user-menu-header">
            <div className="user-avatar">
              <User size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="user-email">{email}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>

          <div className="user-menu-divider" />

          <Link href="/admin/profile" className="user-menu-item" onClick={() => {
            setIsOpen(false);
            onMobileClose?.();
          }}>
            <User size={18} strokeWidth={1.5} />
            <span>Profile</span>
          </Link>

          <button className="user-menu-item logout-item" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.5} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}