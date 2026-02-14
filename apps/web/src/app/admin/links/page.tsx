"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { Drawer } from "@/components/ui/Drawer";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stack } from "@/components/ui/Stack";
import { useToast } from "@/components/ui/Toast";
import { adminCreateLink, adminListLinks, AdminLinkResponse, ApiError } from "@/lib/api";

type LinkRow = {
  id: string;
  title: string;
  code: string;
  shortUrl: string;
  destination: string;
  status: "active" | "paused" | "blocked";
  webSteps: number;
  appSteps: number;
  clicks: number | null;
  valid: number | null;
  invalid: number | null;
  campaignTag?: string;
  createdAt: string;
};

function mapApiRow(row: AdminLinkResponse): LinkRow {
  return {
    id: row.id,
    title: `Link ${row.code}`,
    code: row.code,
    shortUrl: row.short_url,
    destination: row.destination_url,
    status: row.is_active ? "active" : "paused",
    webSteps: row.web_steps,
    appSteps: row.app_steps,
    clicks: null,
    valid: null,
    invalid: null,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function statusBadge(status: LinkRow["status"]) {
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

function friendlyLinkError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Request failed. Please try again.";

  if (error.status === 401) return "Admin session expired. Please login again.";
  if (error.status === 400) return error.message;
  if (error.status === 429) return "Too many requests. Please wait and retry.";

  return error.message || "Request failed. Please try again.";
}

export default function LinksPage() {
  const { push } = useToast();

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<LinkRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [campaignTag, setCampaignTag] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingRows(true);
      try {
        const data = await adminListLinks();
        if (!alive) return;
        setRows(data.map(mapApiRow));
      } catch (error) {
        if (!alive) return;
        push(friendlyLinkError(error), "error");
      } finally {
        if (alive) setLoadingRows(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [push]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.title.toLowerCase().includes(q) || row.code.toLowerCase().includes(q));
  }, [rows, query]);

  async function onCreateFromDrawer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!destinationUrl.trim()) return;

    setCreating(true);
    try {
      const created = await adminCreateLink({ destination_url: destinationUrl.trim(), tier: "standard" });
      const mapped = mapApiRow(created);
      mapped.title = title.trim() || mapped.title;
      mapped.campaignTag = campaignTag.trim() || undefined;

      setRows((prev) => [mapped, ...prev]);

      setDrawerOpen(false);
      setDestinationUrl("");
      setTitle("");
      setCampaignTag("");

      push("Link created", "success");
    } catch (error) {
      push(friendlyLinkError(error), "error");
    } finally {
      setCreating(false);
    }
  }

  const columns = useMemo<DataTableColumn<LinkRow>[]>(
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
          <DropdownMenu
            items={[
              { label: "View", onSelect: () => push("View page coming soon", "info") },
              { label: "Edit", onSelect: () => push("Edit drawer coming soon", "info") },
              {
                label: row.status === "paused" ? "Resume" : "Pause",
                onSelect: () => push(row.status === "paused" ? "Link resumed" : "Link paused", "info"),
              },
              {
                label: "Delete",
                tone: "danger",
                onSelect: () => {
                  setSelected(row);
                  setConfirmOpen(true);
                },
              },
            ]}
          />
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
        {loadingRows ? (
          <Stack gap={2}>
            <Skeleton className="ui-skeleton-line" />
            <Skeleton className="ui-skeleton-line" />
            <Skeleton className="ui-skeleton-line" />
            <Skeleton className="ui-skeleton-line" />
          </Stack>
        ) : (
          <DataTable columns={columns} rows={filteredRows} rowKey={(row) => row.id} emptyText="No links found" />
        )}
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

            <Button type="submit" loading={creating}>
              Create link
            </Button>
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
