"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminGuard } from "@/components/auth/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a public admin page (login, setup)
  // Note: /login is not under /admin prefix due to middleware rewriting
  const isPublicPage = pathname === '/login' || pathname.startsWith('/admin/setup');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <AppShell>{children}</AppShell>
    </AdminGuard>
  );
}
