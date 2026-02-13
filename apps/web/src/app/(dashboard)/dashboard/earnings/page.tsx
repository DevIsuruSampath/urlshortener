const byDate = [
  { date: "2026-02-07", earnings: "$12.14" },
  { date: "2026-02-08", earnings: "$10.02" },
  { date: "2026-02-09", earnings: "$17.58" },
  { date: "2026-02-10", earnings: "$14.22" },
  { date: "2026-02-11", earnings: "$16.37" },
  { date: "2026-02-12", earnings: "$19.44" },
  { date: "2026-02-13", earnings: "$18.42" },
];

const byCountry = [
  { country: "US", value: "38%" },
  { country: "IN", value: "17%" },
  { country: "PK", value: "11%" },
  { country: "BR", value: "9%" },
  { country: "Other", value: "25%" },
];

const byDevice = [
  { device: "Android", value: "54%" },
  { device: "Desktop", value: "26%" },
  { device: "iOS", value: "18%" },
  { device: "Other", value: "2%" },
];

const invalidReasons = [
  { reason: "duplicate", count: 182 },
  { reason: "too fast", count: 96 },
  { reason: "rate limit", count: 75 },
  { reason: "captcha failed", count: 54 },
  { reason: "suspicious", count: 39 },
];

export default function EarningsPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Earnings</h1>
        <p className="muted">Performance and quality analytics for valid traffic and payout safety.</p>
      </header>

      <section className="dash-two-col">
        <article className="card section">
          <h2>By date</h2>
          <div className="table-wrap">
            <table className="tier-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {byDate.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card section">
          <h2>By country</h2>
          <ul className="simple-list">
            {byCountry.map((row) => (
              <li key={row.country}>
                <span>{row.country}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>

          <h2 className="section-subhead">By device</h2>
          <ul className="simple-list">
            {byDevice.map((row) => (
              <li key={row.device}>
                <span>{row.device}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card section">
        <h2>Invalid reasons breakdown (important)</h2>
        <div className="table-wrap">
          <table className="tier-table">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {invalidReasons.map((row) => (
                <tr key={row.reason}>
                  <td>{row.reason}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
