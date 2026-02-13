"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";

type LinkRow = {
  title: string;
  shortUrl: string;
  destination: string;
  status: "active" | "paused" | "blocked";
  tier: string;
  steps: string;
  clicks: number;
  valid: number;
  invalid: number;
};

const rows: LinkRow[] = [
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

function statusBadge(status: LinkRow["status"]) {
  return <span className={`status-badge ${status}`}>{status}</span>;
}

export default function LinksPage() {
  const { push } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<LinkRow | null>(null);

  const columns = useMemo<DataTableColumn<LinkRow>[]>(
    () => [
      { key: "title", header: "Link name", render: (row) => row.title },
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
        header: "Destination URL",
        render: (row) => (
          <p className="truncate-cell" title={row.destination}>
            {row.destination}
          </p>
        ),
      },
      { key: "status", header: "Status", render: (row) => statusBadge(row.status) },
      {
        key: "tier",
        header: "Tier / required steps",
        render: (row) => (
          <>
            <p>{row.tier}</p>
            <p className="muted">{row.steps}</p>
          </>
        ),
      },
      {
        key: "stats",
        header: "Clicks / Valid / Invalid",
        render: (row) => `${row.clicks} / ${row.valid} / ${row.invalid}`,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="table-actions">
            <button type="button" className="btn btn-ghost btn-small" onClick={() => push(row.status === "paused" ? "Link resumed" : "Link paused", "info")}>
              {row.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => push("Edit drawer coming soon", "info")}>
              Edit
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
          <p className="muted">Manage short links, destination URLs, and traffic quality.</p>
        </div>
        <Link href="/dashboard/links/new" className="btn">
          Create Link
        </Link>
      </header>

      <section className="card section">
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.shortUrl} />
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
