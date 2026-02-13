const history = [
  { date: "2026-02-01", method: "USDT (TRC20)", amount: "$120.00", status: "paid", note: "Txn confirmed" },
  { date: "2026-01-17", method: "PayPal", amount: "$95.00", status: "paid", note: "Processed" },
  { date: "2026-01-03", method: "USDT (TRC20)", amount: "$80.00", status: "rejected", note: "Payment details mismatch" },
  { date: "2025-12-20", method: "PayPal", amount: "$102.00", status: "pending", note: "Under review" },
];

export default function WithdrawalsPage() {
  const balance = 143;
  const threshold = 250;
  const progress = Math.min(100, Math.round((balance / threshold) * 100));

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Withdrawals</h1>
        <p className="muted">Review payout eligibility and your withdrawal history.</p>
      </header>

      <section className="dash-cards-grid payouts-grid">
        <article className="card dash-stat-card">
          <p className="muted">Current balance</p>
          <h2>${balance.toFixed(2)}</h2>
        </article>

        <article className="card dash-stat-card">
          <p className="muted">Threshold</p>
          <h2>${threshold.toFixed(2)}</h2>
        </article>

        <article className="card dash-stat-card">
          <p className="muted">Progress</p>
          <h2>{progress}%</h2>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </article>

        <article className="card dash-stat-card">
          <p className="muted">Request payout</p>
          <button className="btn" disabled={balance < threshold} type="button">
            Request payout
          </button>
          <p className="muted">Enabled once your balance crosses threshold.</p>
        </article>
      </section>

      <section className="card section">
        <h2>Withdrawal history</h2>
        <div className="table-wrap">
          <table className="tier-table dash-responsive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={`${row.date}-${row.amount}`}>
                  <td data-label="Date">{row.date}</td>
                  <td data-label="Method">{row.method}</td>
                  <td data-label="Amount">{row.amount}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${row.status}`}>{row.status}</span>
                  </td>
                  <td data-label="Note">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
