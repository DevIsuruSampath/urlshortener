export default function SettingsPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Settings</h1>
        <p className="muted">Manage admin identity, flow defaults, and security.</p>
      </header>

      <section className="dash-two-col">
        <article className="card section">
          <h2>Admin identity</h2>
          <p className="muted">Role: Admin</p>
          <p className="muted">Access mode: Single-user</p>
        </article>

        <article className="card section">
          <h2>Payout destination</h2>
          <p className="muted">Primary: USDT (TRC20)</p>
          <p className="muted">Address: T******1234</p>
        </article>
      </section>

      <section className="dash-two-col">
        <article className="card section">
          <h2>Security</h2>
          <p className="muted">Admin password was changed 19 days ago.</p>
          <button type="button" className="btn btn-ghost">
            Change password
          </button>
        </article>

        <article className="card section">
          <h2>Flow settings (read-only)</h2>
          <p className="muted">Default tier: Standard</p>
          <p className="muted">Web steps: 3</p>
          <p className="muted">App steps: 5</p>
        </article>
      </section>
    </main>
  );
}
