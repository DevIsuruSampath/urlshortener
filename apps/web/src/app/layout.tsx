import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";
import { QueryProvider } from "@/components/QueryProvider";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
