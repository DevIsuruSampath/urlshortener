import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "PaidLink | Secure Paid-Link Shortener",
    template: "%s | PaidLink",
  },
  description: "Monetized URL shortener with server-validated steps, anti-bypass controls, and payout-safe tracking.",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
