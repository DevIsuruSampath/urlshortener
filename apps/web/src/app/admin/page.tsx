import Link from "next/link";

import { StatCard } from "@/components/ui/StatCard";

const overviewCards = [
  { label: "Today clicks", value: "2,184" },
  { label: "Valid completions", value: "1,602" },
  { label: "Estimated revenue (today)", value: "$18.42" },
  { label: "Estimated balance", value: "$143.00" },
];

const invalidBreakdown = [
  { key: "duplicate", label: "Duplicate", value: "12%" },
  { key: "too_fast", label: "Too fast", value: "7%" },
  { key: "rate_limited", label: "Rate limited", value: "4%" },
  { key: "captcha_failed", label: "Captcha failed", value: "3%" },
] as const;

const qualitySignals = [
  { label: "Captcha required (today)", value: "38.4%", hint: "Higher can mean bot pressure" },
  { label: "Duplicate blocked (today)", value: "187", hint: "24h dedupe hits" },
  { label: "Median completion time", value: "46s", hint: "Flow start → success" },
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
  { code: "a9x3k", title: "Summer promo", clicks: 640, valid: 486, invalid: 96, estimatedRevenue: "$5.21", status: "active" },
  { code: "pro77", title: "Product launch", clicks: 401, valid: 289, invalid: 78, estimatedRevenue: "$3.60", status: "active" },
  { code: "mobi2", title: "Mobile burst", clicks: 311, valid: 245, invalid: 51, estimatedRevenue: "$2.94", status: "paused" },
  { code: "dlp20", title: "Download gate", clicks: 268, valid: 198, invalid: 49, estimatedRevenue: "$2.41", status: "blocked" },
] as const;

type LinkCode = (typeof topLinks)[number]["code"];
type ActivityType = "Started" | "StepComplete" | "Invalid" | "Redirect";
type ActivityFilter = "all" | "invalid" | "completions";

const activityFilterOptions: Array<{ key: ActivityFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "invalid", label: "Invalid only" },
  { key: "completions", label: "Completions only" },
];

const activityEvents: Array<{
  time: string;
  type: ActivityType;
  code: LinkCode;
  title: string;
  reason?: string;
  country?: string;
  device?: string;
}> = [
  { time: "16:12", type: "Started", code: "a9x3k", title: "Summer promo", country: "LK", device: "Android" },
  {
    time: "16:10",
    type: "StepComplete",
    code: "a9x3k",
    title: "Summer promo",
    country: "LK",
    device: "Android",
  },
  {
    time: "16:08",
    type: "Invalid",
    code: "pro77",
    title: "Product launch",
    reason: "Captcha failed",
    country: "IN",
    device: "Desktop",
  },
  {
    time: "16:07",
    type: "Invalid",
    code: "mobi2",
    title: "Mobile burst",
    reason: "Duplicate",
    country: "BD",
    device: "Android",
  },
  { time: "16:04", type: "Redirect", code: "a9x3k", title: "Summer promo", country: "LK", device: "Android" },
  {
    time: "16:01",
    type: "Invalid",
    code: "dlp20",
    title: "Download gate",
    reason: "Rate limited",
    country: "PK",
    device: "Desktop",
  },
  {
    time: "15:59",
    type: "StepComplete",
    code: "pro77",
    title: "Product launch",
    country: "IN",
    device: "Desktop",
  },
];

type DashboardHomeProps = {
  searchParams?: {
    filter?: string | string[];
    code?: string | string[];
  };
};

function percent(part: number, total: number): string {
  if (total <= 0) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFilter(value?: string): ActivityFilter {
  if (value === "invalid" || value === "completions") return value;
  return "all";
}

function isLinkCode(value: string): value is LinkCode {
  return topLinks.some((row) => row.code === value);
}

function buildActivityHref(filter: ActivityFilter, code: "all" | LinkCode): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (code !== "all") params.set("code", code);
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default function DashboardHome({ searchParams }: DashboardHomeProps) {
  const threshold = 250;
  const balance = 143;
  const progress = Math.min(100, Math.round((balance / threshold) * 100));

  const selectedFilter = normalizeFilter(getSingleParam(searchParams?.filter));
  const rawCode = getSingleParam(searchParams?.code);
  const selectedCode: "all" | LinkCode = rawCode && isLinkCode(rawCode) ? rawCode : "all";

  const visibleEvents = activityEvents.filter((event) => {
    if (selectedFilter === "invalid" && event.type !== "Invalid") return false;
    if (selectedFilter === "completions" && event.type !== "StepComplete" && event.type !== "Redirect") return false;
    if (selectedCode !== "all" && event.code !== selectedCode) return false;
    return true;
  });

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Overview</h1>
        <p className="muted">Monitor traffic quality, conversion health, and withdrawal readiness.</p>
      </header>

      <section className="dash-cards-grid">
        {overviewCards.map((card, index) => (
          <StatCard key={card.label} label={card.label} value={card.value} index={index} />
        ))}

        <StatCard label="Invalid rate" value="26.6%" hint="Tap a reason to diagnose in Stats" index={overviewCards.length}>
          <ul className="signal-breakdown">
            {invalidBreakdown.map((item) => (
              <li key={item.key}>
                <Link href={`/admin/stats?reason=${item.key}`}>
                  {item.label}: {item.value}
                </Link>
              </li>
            ))}
          </ul>
        </StatCard>

        <StatCard
          label="Next payout threshold"
          value={`$${threshold.toFixed(0)}`}
          hint={`$${balance.toFixed(2)} / $${threshold.toFixed(0)}`}
          index={overviewCards.length + 1}
        >
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </StatCard>
      </section>
      <p className="muted revenue-note">
        Estimated revenue is based on configured RPM rates; actual ad network payout may differ.
      </p>

      <section className="card section">
        <h2>Quality signals</h2>
        <p className="muted">Use these to quickly spot bot waves or flow UX regressions.</p>
        <div className="dash-cards-grid">
          {qualitySignals.map((card, index) => (
            <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} index={index} />
          ))}
        </div>
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
                  <th>Status</th>
                  <th>Clicks</th>
                  <th>Valid</th>
                  <th>CVR</th>
                  <th>Invalid %</th>
                  <th>Est. revenue</th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map((row) => (
                  <tr key={row.code}>
                    <td data-label="Code">{row.code}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${row.status}`}>{row.status}</span>
                    </td>
                    <td data-label="Clicks">{row.clicks}</td>
                    <td data-label="Valid">{row.valid}</td>
                    <td data-label="CVR">{percent(row.valid, row.clicks)}</td>
                    <td data-label="Invalid %">{percent(row.invalid, row.clicks)}</td>
                    <td data-label="Est. revenue">{row.estimatedRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card section">
          <h2>Recent activity</h2>
          <p className="muted">Audit stream with quick filters.</p>

          <div className="activity-toolbar">
            <div>
              <p className="muted">Event filter</p>
              <div className="signal-filters">
                {activityFilterOptions.map((option) => (
                  <Link
                    key={option.key}
                    href={buildActivityHref(option.key, selectedCode)}
                    className={`signal-filter ${selectedFilter === option.key ? "active" : ""}`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="muted">Link selector</p>
              <div className="signal-filters">
                <Link
                  href={buildActivityHref(selectedFilter, "all")}
                  className={`signal-filter ${selectedCode === "all" ? "active" : ""}`}
                >
                  All links
                </Link>
                {topLinks.map((linkRow) => (
                  <Link
                    key={linkRow.code}
                    href={buildActivityHref(selectedFilter, linkRow.code)}
                    className={`signal-filter ${selectedCode === linkRow.code ? "active" : ""}`}
                    title={linkRow.title}
                  >
                    {linkRow.code}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="tier-table dash-responsive-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event type</th>
                  <th>Link</th>
                  <th>Reason</th>
                  <th>Country / Device</th>
                </tr>
              </thead>
              <tbody>
                {visibleEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      No events for current filters.
                    </td>
                  </tr>
                ) : (
                  visibleEvents.map((event, index) => (
                    <tr key={`${event.time}-${event.type}-${event.code}-${index}`}>
                      <td data-label="Time">{event.time}</td>
                      <td data-label="Event type">
                        <span className={`event-pill ${event.type.toLowerCase()}`}>{event.type}</span>
                      </td>
                      <td data-label="Link">
                        <div className="activity-link-cell">
                          <span className="mono-link">{event.code}</span>
                          <span className="muted">{event.title}</span>
                        </div>
                      </td>
                      <td data-label="Reason">{event.reason || "—"}</td>
                      <td data-label="Country / Device">
                        {event.country || "—"} / {event.device || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
