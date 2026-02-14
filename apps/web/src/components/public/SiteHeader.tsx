import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" aria-label="PaidLink home">
          PaidLink
        </Link>

        <nav className="main-nav" aria-label="Primary">
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <div className="auth-actions">
          <Link href="/admin/login" className="btn">
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}
