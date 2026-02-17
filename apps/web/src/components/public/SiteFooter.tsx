import Link from "next/link";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="brand">{PROJECT_NAME}</p>
          <p className="muted">Secure paid-link shortener for admin-managed campaigns and performance traffic.</p>
        </div>

        <nav className="footer-links" aria-label="Legal">
          {/* Links kept for footer but content might not be accessible if blocked */}
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
          <Link href="/support">Support</Link>
        </nav>
      </div>

      <div className="container footer-bottom muted">© {new Date().getFullYear()} {PROJECT_NAME}. All rights reserved.</div>
    </footer>
  );
}
