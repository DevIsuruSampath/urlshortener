import { StatCard } from "@/components/ui/StatCard";

const summary = {
  today: "$18.42",
  sevenDays: "$108.19",
  thirtyDays: "$432.87",
};

const rows = [
  { date: "2026-02-13", valid: 242, invalid: 69, earnings: "$18.42" },
  { date: "2026-02-12", valid: 236, invalid: 71, earnings: "$19.44" },
  { date: "2026-02-11", valid: 220, invalid: 64, earnings: "$16.37" },
  { date: "2026-02-10", valid: 213, invalid: 59, earnings: "$14.22" },
  { date: "2026-02-09", valid: 226, invalid: 63, earnings: "$17.58" },
  { date: "2026-02-08", valid: 187, invalid: 52, earnings: "$10.02" },
  { date: "2026-02-07", valid: 198, invalid: 55, earnings: "$12.14" },
];

export default function EarningsPage() {
  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Earnings</h1>
        <p className="muted">Mock analytics view until API metrics are wired.</p>
      </header>

      <section className="dash-cards-grid payouts-grid">
        <StatCard label="Today" value={summary.today} hint="Estimated" index={0} />
        <StatCard label="Last 7 days" value={summary.sevenDays} hint="Estimated" index={1} />
        <StatCard label="Last 30 days" value={summary.thirtyDays} hint="Estimated" index={2} />
      </section>

      <section className="card section">
        <h2>Earnings breakdown</h2>
        <div className="table-wrap">
          <table className="tier-table dash-responsive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td data-label="Date">{row.date}</td>
                  <td data-label="Valid">{row.valid}</td>
                  <td data-label="Invalid">{row.invalid}</td>
                  <td data-label="Earnings">{row.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
