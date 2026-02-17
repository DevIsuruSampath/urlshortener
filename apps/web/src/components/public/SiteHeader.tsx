import Link from "next/link";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" aria-label={`${PROJECT_NAME} home`}>
          {PROJECT_NAME}
        </Link>

        {/* Navigation disabled for maintenance */}
        <nav className="main-nav" aria-label="Primary">
          {/* <Link href="/pricing">Pricing</Link> */}
          {/* <Link href="/faq">FAQ</Link> */}
        </nav>

        <div className="auth-actions">
          <Link href="/login" className="btn">
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}
