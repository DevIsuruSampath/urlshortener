import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="brand">PaidLink</p>
          <p className="muted">Secure paid-link shortener for admin-managed campaigns and performance traffic.</p>
        </div>

        <nav className="footer-links" aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
          <Link href="/support">Support</Link>
        </nav>
      </div>

      <div className="container footer-bottom muted">© {new Date().getFullYear()} PaidLink. All rights reserved.</div>
    </footer>
  );
}
