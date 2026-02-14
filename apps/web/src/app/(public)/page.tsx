import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container landing">
      <section className="hero card">
        <p className="eyebrow">Monetized Link Platform</p>
        <h1>Short links, safer flow, real payout tracking.</h1>
        <p className="muted">
          PaidLink gives admins tighter control over monetized traffic with anti-bypass controls, server-verified steps,
          and transparent stats.
        </p>
        <div className="hero-actions">
          <Link href="/admin/login" className="btn">
            Admin Login
          </Link>
          <Link href="/admin" className="btn btn-ghost">
            Open Admin
          </Link>
        </div>
      </section>

      <section className="section card">
        <h2>How it works (3 steps)</h2>
        <div className="steps-grid">
          <article>
            <h3>1) Create short link</h3>
            <p className="muted">Generate a short code and select your tier logic.</p>
          </article>
          <article>
            <h3>2) User completes flow</h3>
            <p className="muted">Timer + scroll + captcha are verified server-side to prevent bypass.</p>
          </article>
          <article>
            <h3>3) Redirect and earn</h3>
            <p className="muted">Valid completions are counted, deduped, and tracked in your dashboard.</p>
          </article>
        </div>
      </section>

      <section className="section card">
        <h2>Payout highlights</h2>
        <ul className="highlights">
          <li>24h duplicate protection by code + IP hash + UA hash</li>
          <li>Redis abuse protection for flow start and step-complete endpoints</li>
          <li>Configurable steps by tier for web and app traffic</li>
          <li>Server-signed session/redirect tokens for flow integrity</li>
        </ul>
      </section>

      <section className="section card cta-strip">
        <h2>Ready to manage links in admin mode?</h2>
        <p className="muted">Sign in and control links, flow rules, and analytics from one dashboard.</p>
        <Link href="/admin/login" className="btn">
          Go to Admin Login
        </Link>
      </section>
    </div>
  );
}
