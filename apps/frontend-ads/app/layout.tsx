import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PaidLink — Secure Redirect",
  description: "Complete verification steps to access your link.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a0a",
          color: "#e0e0e0",
        }}
      >
        {children}
      </body>
    </html>
  );
}
