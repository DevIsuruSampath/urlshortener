"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminGuard } from "@/components/auth/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/setup")) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <AppShell>{children}</AppShell>
    </AdminGuard>
  );
}
