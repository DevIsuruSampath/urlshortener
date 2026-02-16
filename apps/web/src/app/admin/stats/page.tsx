import Link from "next/link";

import { StatCard } from "@/components/ui/StatCard";

type StatsPageProps = {
  searchParams: Promise<{
    reason?: string | string[];
  }>;
};

// ... consts ...

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = await searchParams;
  const rawReason = Array.isArray(params?.reason) ? params?.reason[0] : params?.reason;
  const selectedReason = rawReason && isInvalidReason(rawReason) ? rawReason : null;
  const selectedLabel = selectedReason ? reasonMeta[selectedReason].label : "All reasons";

  const visibleEvents = selectedReason ? invalidEvents.filter((event) => event.reason === selectedReason) : invalidEvents;

  const startedCount = funnelStages[0].count;
  const maxReasonCount = Math.max(...allReasons.map((reason) => reasonMeta[reason].count), 1);

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Quality</h1>
        <p className="muted">Admin-level traffic quality and estimated revenue snapshot.</p>
      </header>

      <section className="dash-cards-grid payouts-grid">
        <StatCard label="Estimated revenue (today)" value="$18.42" hint="RPM-based estimate" index={0} />
        <StatCard label="Estimated revenue (7d)" value="$108.19" hint="RPM-based estimate" index={1} />
        <StatCard label="Estimated revenue (30d)" value="$432.87" hint="RPM-based estimate" index={2} />
      </section>
      <p className="muted revenue-note">
        Based on configured RPM rates; actual ad network payout may differ.
      </p>

      <section className="card section">
        <h2>Flow funnel (today)</h2>
        <p className="muted">Started → Step1 → Step2 → Step3 → Completed, with drop-off by step.</p>

        <ul className="funnel-list">
          {funnelStages.map((stage, index) => {
            const previousCount = index === 0 ? null : funnelStages[index - 1].count;
            const dropCount = previousCount === null ? 0 : Math.max(previousCount - stage.count, 0);
            const dropPercent = previousCount === null ? "—" : pct(dropCount, previousCount);
            const shareWidth = Math.max((stage.count / startedCount) * 100, 4);

            return (
              <li key={stage.key} className="funnel-item">
                <div className="funnel-head">
                  <p>
                    <strong>{stage.label}</strong>
                  </p>
                  <p>
                    <strong>{stage.count.toLocaleString()}</strong>
                    <span className="muted"> ({pct(stage.count, startedCount)} of started)</span>
                  </p>
                </div>

                <div className="funnel-bar" role="img" aria-label={`${stage.label} share`}>
                  <span style={{ width: `${shareWidth}%` }} />
                </div>

                <p className="muted funnel-drop">
                  {previousCount === null
                    ? "Entry stage"
                    : `Drop-off from previous: ${dropCount.toLocaleString()} (${dropPercent})`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card section">
        <h2>Invalid reasons (today)</h2>
        <p className="muted">Bar list for fast anomaly detection. Click a reason to filter diagnosis events below.</p>

        <div className="signal-filters" role="tablist" aria-label="Invalid reason filters">
          <Link href="/admin/stats" className={`signal-filter ${selectedReason ? "" : "active"}`}>
            All reasons
          </Link>
          {allReasons.map((reason) => (
            <Link key={reason} href={`/admin/stats?reason=${reason}`} className={`signal-filter ${selectedReason === reason ? "active" : ""}`}>
              {reasonMeta[reason].label}
            </Link>
          ))}
        </div>

        <ul className="reason-bars">
          {allReasons.map((reason) => {
            const meta = reasonMeta[reason];
            const width = Math.max((meta.count / maxReasonCount) * 100, 6);
            return (
              <li key={reason}>
                <div className="reason-bars-head">
                  <p>
                    <strong>{meta.label}</strong>
                    <span className="muted"> · {meta.hint}</span>
                  </p>
                  <p>
                    <strong>{meta.percent}%</strong>
                    <span className="muted"> · {meta.count} events</span>
                  </p>
                </div>
                <div className="reason-bar-track" role="img" aria-label={`${meta.label} count bar`}>
                  <span style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card section">
        <h2>Diagnosis events</h2>
        <p className="muted">Showing: {selectedLabel}</p>
        <div className="table-wrap">
          <table className="tier-table dash-responsive-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Code</th>
                <th>Reason</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.map((event, index) => (
                <tr key={`${event.time}-${event.code}-${index}`}>
                  <td data-label="Time">{event.time}</td>
                  <td data-label="Code">{event.code}</td>
                  <td data-label="Reason">{reasonMeta[event.reason].label}</td>
                  <td data-label="Detail">{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card section">
        <h2>Daily summary</h2>
        <div className="table-wrap">
          <table className="tier-table dash-responsive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Est. revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td data-label="Date">{row.date}</td>
                  <td data-label="Valid">{row.valid}</td>
                  <td data-label="Invalid">{row.invalid}</td>
                  <td data-label="Est. revenue">{row.estimatedRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
