import { StatCard } from "@/components/ui/StatCard";

const overviewCards = [
  { label: "Today clicks", value: "2,184" },
  { label: "Valid completions", value: "1,602" },
  { label: "Invalid rate", value: "26.6%" },
  { label: "Earnings today", value: "$18.42" },
  { label: "Balance", value: "$143.00" },
];

const chartRows = [
  { day: "Sat", clicks: 55, completions: 39 },
  { day: "Sun", clicks: 40, completions: 28 },
  { day: "Mon", clicks: 70, completions: 49 },
  { day: "Tue", clicks: 60, completions: 42 },
  { day: "Wed", clicks: 75, completions: 55 },
  { day: "Thu", clicks: 82, completions: 59 },
  { day: "Fri", clicks: 67, completions: 47 },
];

const topLinks = [
  { code: "a9x3k", clicks: 640, valid: 486, earnings: "$5.21" },
  { code: "pro77", clicks: 401, valid: 289, earnings: "$3.60" },
  { code: "mobi2", clicks: 311, valid: 245, earnings: "$2.94" },
  { code: "dlp20", clicks: 268, valid: 198, earnings: "$2.41" },
];

const activity = [
  { time: "16:02", event: "Flow complete", detail: "a9x3k · valid completion" },
  { time: "15:58", event: "Invalid", detail: "captcha failed · pro77" },
  { time: "15:56", event: "Invalid", detail: "duplicate within 24h · mobi2" },
  { time: "15:52", event: "Flow started", detail: "new session · dlp20" },
];

export default function DashboardHome() {
  const threshold = 250;
  const balance = 143;
  const progress = Math.min(100, Math.round((balance / threshold) * 100));

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Overview</h1>
        <p className="muted">Monitor click quality, conversion health, and payout readiness.</p>
      </header>

      <section className="dash-cards-grid">
        {overviewCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}

        <StatCard label="Next payout threshold" value={`$${threshold.toFixed(0)}`} hint={`$${balance.toFixed(2)} / $${threshold.toFixed(0)}`}>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </StatCard>
      </section>

      <section className="card section">
        <h2>Last 7 days: clicks vs completions</h2>
        <div className="mini-chart">
          {chartRows.map((row) => (
            <div className="mini-chart-row" key={row.day}>
              <span className="mini-chart-day">{row.day}</span>
              <div className="mini-bar-wrap">
                <span className="mini-bar clicks" style={{ width: `${row.clicks}%` }} title={`Clicks: ${row.clicks}`} />
                <span
                  className="mini-bar completions"
                  style={{ width: `${row.completions}%` }}
                  title={`Completions: ${row.completions}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dash-two-col">
        <article className="card section">
          <h2>Top links</h2>
          <div className="table-wrap">
            <table className="tier-table dash-responsive-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Clicks</th>
                  <th>Valid</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((row) => (
                  <tr key={row.code}>
                    <td data-label="Code">{row.code}</td>
                    <td data-label="Clicks">{row.clicks}</td>
                    <td data-label="Valid">{row.valid}</td>
                    <td data-label="Earnings">{row.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card section">
          <h2>Recent activity</h2>
          <ul className="activity-list">
            {activity.map((item, index) => (
              <li key={`${item.time}-${index}`}>
                <p>
                  <strong>{item.time}</strong> · {item.event}
                </p>
                <p className="muted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
