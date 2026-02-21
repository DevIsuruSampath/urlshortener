"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { adminLogout } from "@/lib/api";

interface UserMenuProps {
  email: string;
}

export function UserMenu({ email }: UserMenuProps) {
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

  async function handleLogout() {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    window.location.href = "/login";
  }

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <div className="user-avatar">
          <span aria-hidden>👤</span>
        </div>
        <div className="user-info">
          <span className="user-email">{email}</span>
          <span className="user-role">Admin</span>
        </div>
        <span className="user-menu-chevron" aria-hidden>
          {isOpen ? "▴" : "▾"}
        </span>
      </button>

      {isOpen && (
        <div className="user-menu-popover">
          <div className="user-menu-header">
            <div className="user-avatar">
              <span aria-hidden>👤</span>
            </div>
            <div>
              <p className="user-email">{email}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>

          <div className="user-menu-divider" />

          <Link href="/admin/profile" className="user-menu-item" onClick={() => setIsOpen(false)}>
            <span aria-hidden>👤</span>
            <span>Profile</span>
          </Link>

          <button className="user-menu-item logout-item" onClick={handleLogout}>
            <span aria-hidden>↩</span>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}