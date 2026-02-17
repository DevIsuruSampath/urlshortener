import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export const metadata: Metadata = {
  title: {
    default: `${PROJECT_NAME} | Secure Paid-Link Shortener`,
    template: `%s | ${PROJECT_NAME}`,
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
