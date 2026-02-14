export default function ToolsPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Tools</h1>
        <p className="muted">Developer and integration tools for power users.</p>
      </header>

      <section className="card section">
        <h2>API keys (coming soon)</h2>
        <p className="muted">Programmatic link creation and reporting endpoints will appear here.</p>
      </section>

      <section className="card section">
        <h2>Utilities roadmap</h2>
        <ul className="highlights">
          <li>Bulk link import</li>
          <li>UTM builder</li>
          <li>Webhook delivery for conversion events</li>
        </ul>
      </section>
    </main>
  );
}
