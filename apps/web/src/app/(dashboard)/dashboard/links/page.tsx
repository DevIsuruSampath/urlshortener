"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { DashboardLink, getStoredLinks } from "@/lib/links-store";

const defaultRows: DashboardLink[] = [
  {
    id: "seed-a9x3k",
    title: "Main Offer - Global",
    code: "a9x3k",
    shortUrl: "https://urlshortener.devisuru.ggff.net/a9x3k",
    destination: "https://partner.example.com/offer/main",
    status: "active",
    webSteps: 3,
    appSteps: 5,
    clicks: null,
    valid: null,
    invalid: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-pro77",
    title: "App Install Campaign",
    code: "pro77",
    shortUrl: "https://urlshortener.devisuru.ggff.net/pro77",
    destination: "https://m.example.com/install",
    status: "paused",
    webSteps: 2,
    appSteps: 3,
    clicks: null,
    valid: null,
    invalid: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-mobi2",
    title: "Utility Download",
    code: "mobi2",
    shortUrl: "https://urlshortener.devisuru.ggff.net/mobi2",
    destination: "https://downloads.example.com/tool",
    status: "blocked",
    webSteps: 1,
    appSteps: 2,
    clicks: null,
    valid: null,
    invalid: null,
    createdAt: new Date().toISOString(),
  },
];

function statusBadge(status: DashboardLink["status"]) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

function statValue(value: number | null) {
  return value === null ? "—" : String(value);
}

function destinationPreview(url: string) {
  try {
    const parsed = new URL(url);
    const text = `${parsed.hostname}${parsed.pathname}`;
    return text.length > 34 ? `${text.slice(0, 34)}…` : text;
  } catch {
    return url.length > 34 ? `${url.slice(0, 34)}…` : url;
  }
}

export default function LinksPage() {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [storedRows, setStoredRows] = useState<DashboardLink[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<DashboardLink | null>(null);

  useEffect(() => {
    setStoredRows(getStoredLinks());
  }, []);

  const allRows = useMemo(() => [...storedRows, ...defaultRows], [storedRows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((row) => row.title.toLowerCase().includes(q) || row.code.toLowerCase().includes(q));
  }, [allRows, query]);

  const columns = useMemo<DataTableColumn<DashboardLink>[]>(
    () => [
      { key: "title", header: "Name", render: (row) => row.title || "Untitled" },
      {
        key: "shortUrl",
        header: "Short URL",
        render: (row) => (
          <div className="inline-actions">
            <a href={row.shortUrl} target="_blank" rel="noreferrer" className="mono-link">
              {row.shortUrl}
            </a>
            <CopyButton value={row.shortUrl} />
          </div>
        ),
      },
      {
        key: "destination",
        header: "Destination",
        render: (row) => (
          <p className="truncate-cell" title={row.destination}>
            {destinationPreview(row.destination)}
          </p>
        ),
      },
      { key: "status", header: "Status", render: (row) => statusBadge(row.status) },
      {
        key: "steps",
        header: "Steps (web/app)",
        render: (row) => `Web ${row.webSteps} / App ${row.appSteps}`,
      },
      {
        key: "stats",
        header: "Clicks / Valid / Invalid",
        render: (row) => `${statValue(row.clicks)} / ${statValue(row.valid)} / ${statValue(row.invalid)}`,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <details className="actions-menu">
            <summary className="btn btn-ghost btn-small">Actions</summary>
            <div className="actions-menu-list">
              <button type="button" className="btn btn-ghost btn-small" onClick={() => push(row.status === "paused" ? "Link resumed" : "Link paused", "info")}>
                {row.status === "paused" ? "Resume" : "Pause"}
              </button>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => push("Edit drawer coming soon", "info")}>
                Edit destination
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-small danger"
                onClick={() => {
                  setSelected(row);
                  setConfirmOpen(true);
                }}
              >
                Soft delete
              </button>
            </div>
          </details>
        ),
      },
    ],
    [push]
  );

  return (
    <main className="dash-page">
      <header className="dash-page-head dash-page-head-actions">
        <div>
          <h1>Links</h1>
          <p className="muted">Create links and manage status, safety, and traffic quality.</p>
        </div>

        <div className="links-toolbar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code"
            aria-label="Search links"
          />
          <Link href="/dashboard/links/new" className="btn">
            Create Link
          </Link>
        </div>
      </header>

      <section className="card section">
        <DataTable columns={columns} rows={filteredRows} rowKey={(row) => row.id} emptyText="No links found" />
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Soft delete link"
        message={selected ? `Move ${selected.title} to deleted state?` : "Move this link to deleted state?"}
        confirmLabel="Soft delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (selected) {
            push(`Soft-deleted ${selected.title}`, "success");
          }
        }}
      />
    </main>
  );
}
