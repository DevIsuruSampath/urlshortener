import type { ReactNode } from "react";

import { AdminGuard } from "@/components/auth/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AppShell>{children}</AppShell>
    </AdminGuard>
  );
}
