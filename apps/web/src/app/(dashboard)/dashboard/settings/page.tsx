export default function SettingsPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Settings</h1>
        <p className="muted">Manage account profile, payout setup, and security.</p>
      </header>

      <section className="dash-two-col">
        <article className="card section">
          <h2>Profile</h2>
          <p className="muted">Email: creator@example.com</p>
          <p className="muted">Display name: PaidLink Publisher</p>
        </article>

        <article className="card section">
          <h2>Payment method</h2>
          <p className="muted">Primary: USDT (TRC20)</p>
          <p className="muted">Address: T******1234</p>
        </article>
      </section>

      <section className="dash-two-col">
        <article className="card section">
          <h2>Security</h2>
          <p className="muted">Password was changed 19 days ago.</p>
          <button type="button" className="btn btn-ghost">
            Change password
          </button>
        </article>

        <article className="card section">
          <h2>Tier info (read-only)</h2>
          <p className="muted">Plan: Standard</p>
          <p className="muted">Web steps: 3</p>
          <p className="muted">App steps: 5</p>
        </article>
      </section>
    </main>
  );
}
