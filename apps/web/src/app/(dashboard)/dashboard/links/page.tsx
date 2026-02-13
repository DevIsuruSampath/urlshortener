import Link from "next/link";

const rows = [
  {
    title: "Main Offer - Global",
    shortUrl: "https://urlshortener.devisuru.ggff.net/a9x3k",
    destination: "https://partner.example.com/offer/main",
    status: "active",
    tier: "Standard",
    steps: "Web 3 / App 5",
    clicks: 640,
    valid: 486,
    invalid: 154,
  },
  {
    title: "App Install Campaign",
    shortUrl: "https://urlshortener.devisuru.ggff.net/pro77",
    destination: "https://m.example.com/install",
    status: "paused",
    tier: "Professional",
    steps: "Web 2 / App 3",
    clicks: 401,
    valid: 289,
    invalid: 112,
  },
  {
    title: "Utility Download",
    shortUrl: "https://urlshortener.devisuru.ggff.net/mobi2",
    destination: "https://downloads.example.com/tool",
    status: "blocked",
    tier: "Advanced",
    steps: "Web 1 / App 2",
    clicks: 311,
    valid: 245,
    invalid: 66,
  },
];

function statusBadge(status: string) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

export default function LinksPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head dash-page-head-actions">
        <div>
          <h1>Links</h1>
          <p className="muted">Manage short links, destination URLs, and traffic quality.</p>
        </div>
        <Link href="/dashboard/links/new" className="btn">
          Create Link
        </Link>
      </header>

      <section className="card section">
        <div className="table-wrap">
          <table className="tier-table">
            <thead>
              <tr>
                <th>Link name</th>
                <th>Short URL</th>
                <th>Destination URL</th>
                <th>Status</th>
                <th>Tier / steps</th>
                <th>Clicks / Valid / Invalid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.shortUrl}>
                  <td>{row.title}</td>
                  <td>
                    <div className="inline-actions">
                      <a href={row.shortUrl} target="_blank" rel="noreferrer" className="mono-link">
                        {row.shortUrl}
                      </a>
                      <button type="button" className="btn btn-ghost btn-small">
                        Copy
                      </button>
                    </div>
                  </td>
                  <td className="truncate-cell" title={row.destination}>
                    {row.destination}
                  </td>
                  <td>{statusBadge(row.status)}</td>
                  <td>
                    <p>{row.tier}</p>
                    <p className="muted">{row.steps}</p>
                  </td>
                  <td>
                    {row.clicks} / {row.valid} / {row.invalid}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-ghost btn-small">
                        {row.status === "paused" ? "Resume" : "Pause"}
                      </button>
                      <button type="button" className="btn btn-ghost btn-small">
                        Edit
                      </button>
                      <button type="button" className="btn btn-ghost btn-small danger">
                        Soft delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
