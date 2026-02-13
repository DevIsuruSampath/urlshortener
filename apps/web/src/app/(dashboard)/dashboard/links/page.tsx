"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";
import { useToast } from "@/components/ui/Toast";
import { DashboardLink, appendStoredLink, getStoredLinks, makeCode } from "@/lib/links-store";

const WEB_BASE = "https://urlshortener.devisuru.ggff.net";

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
  const tone = status === "active" ? "success" : status === "paused" ? "warning" : "danger";
  return <Badge tone={tone}>{status}</Badge>;
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [campaignTag, setCampaignTag] = useState("");

  useEffect(() => {
    setStoredRows(getStoredLinks());
  }, []);

  const allRows = useMemo(() => [...storedRows, ...defaultRows], [storedRows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((row) => row.title.toLowerCase().includes(q) || row.code.toLowerCase().includes(q));
  }, [allRows, query]);

  function onCreateFromDrawer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!destinationUrl.trim()) return;

    const code = makeCode();
    const link: DashboardLink = {
      id: `local-${Date.now()}`,
      title: title.trim() || "Untitled link",
      code,
      shortUrl: `${WEB_BASE}/${code}`,
      destination: destinationUrl.trim(),
      status: "active",
      webSteps: 3,
      appSteps: 5,
      clicks: null,
      valid: null,
      invalid: null,
      campaignTag: campaignTag.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    appendStoredLink(link);
    setStoredRows((prev) => [link, ...prev]);

    setDrawerOpen(false);
    setDestinationUrl("");
    setTitle("");
    setCampaignTag("");

    push("Link created", "success");
  }

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
              <Button type="button" variant="secondary" className="btn-small" onClick={() => push("View page coming soon", "info")}>
                View
              </Button>
              <Button type="button" variant="secondary" className="btn-small" onClick={() => push("Edit drawer coming soon", "info")}>
                Edit
              </Button>
              <Button type="button" variant="secondary" className="btn-small" onClick={() => push(row.status === "paused" ? "Link resumed" : "Link paused", "info")}>
                {row.status === "paused" ? "Resume" : "Pause"}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="btn-small danger"
                onClick={() => {
                  setSelected(row);
                  setConfirmOpen(true);
                }}
              >
                Delete
              </Button>
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
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code"
            aria-label="Search links"
          />
          <Button type="button" variant="secondary" onClick={() => setDrawerOpen(true)}>
            Quick create
          </Button>
        </div>
      </header>

      <Card className="section">
        <DataTable columns={columns} rows={filteredRows} rowKey={(row) => row.id} emptyText="No links found" />
      </Card>

      <Drawer open={drawerOpen} title="Create link" onClose={() => setDrawerOpen(false)}>
        <form className="auth-form" onSubmit={onCreateFromDrawer}>
          <Stack gap={3}>
            <Input
              label="Destination URL *"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com/landing"
              type="url"
              required
            />

            <Input
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Main campaign"
            />

            <Input
              label="Campaign tag (optional)"
              value={campaignTag}
              onChange={(e) => setCampaignTag(e.target.value)}
              placeholder="fb-cpc"
            />

            <Button type="submit">Create link</Button>
          </Stack>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete link (placeholder)"
        message={selected ? `Mark ${selected.title} as deleted?` : "Mark this link as deleted?"}
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (selected) {
            push(`Deleted ${selected.title} (placeholder)`, "success");
          }
        }}
      />
    </main>
  );
}
