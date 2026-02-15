"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/data/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stack } from "@/components/ui/Stack";
import { useToast } from "@/components/ui/Toast";
import { adminCreateLink, adminListLinks, adminEditLink, adminDeleteLink, adminToggleLink, adminBlockLink, AdminLinkResponse, ApiError } from "@/lib/api";

type BlockedReason = "url safety" | "manual" | "abuse report";

type LinkRow = {
  id: string;
  title: string;
  code: string;
  shortUrl: string;
  destination: string;
  status: "active" | "paused" | "blocked";
  blockedReason?: BlockedReason;
  webSteps: number;
  appSteps: number;
  clicks: number | null;
  valid: number | null;
  invalid: number | null;
  createdAt: string;
};

function mapApiRow(row: AdminLinkResponse): LinkRow {
  return {
    id: row.id,
    title: `Untitled link`,
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

function statusBadge(row: LinkRow) {
  const tone = row.status === "active" ? "success" : row.status === "paused" ? "warning" : "danger";
  const tooltip =
    row.status === "blocked"
      ? `Blocked (reason: ${row.blockedReason || "manual"})`
      : row.status === "paused"
        ? "Paused by admin"
        : "Active";

  return (
    <div className="status-cell">
      <Badge tone={tone} className={`status-badge ${row.status}`} title={tooltip}>
        {row.status}
      </Badge>
      {row.status === "blocked" ? <p className="muted">reason: {row.blockedReason || "manual"}</p> : null}
    </div>
  );
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

function validateDestinationInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Destination URL is required.";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Destination URL must use http:// or https:// only.";
    }
  } catch {
    return "Enter a valid destination URL (http/https only).";
  }

  return "";
}

async function copyText(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard not available");
  }
  await navigator.clipboard.writeText(text);
}

function friendlyLinkError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Network error contacting API. Please try again in a minute.";
  }

  if (!(error instanceof ApiError)) return "Request failed. Please try again.";

  if (error.status === 401) return "Admin session expired. Please login again.";
  if (error.status === 400) return error.message;
  if (error.status === 409) return error.message || "Alias already exists.";
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
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [destinationError, setDestinationError] = useState("");

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
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function onCreateInline(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validation = validateDestinationInput(destinationUrl);
    setDestinationError(validation);
    if (validation) return;

    setCreating(true);
    try {
      const created = await adminCreateLink({ destination_url: destinationUrl.trim(), tier: "standard" });
      const mapped = mapApiRow(created);
      mapped.title = title.trim() || "Untitled link";

      setRows((prev) => [mapped, ...prev]);
      setDestinationUrl("");
      setTitle("");
      setDestinationError("");

      push("Link created successfully", "success");
    } catch (error) {
      push(friendlyLinkError(error), "error");
    } finally {
      setCreating(false);
    }
  }

  const columns = useMemo<DataTableColumn<LinkRow>[]>(
    () => [
      { key: "title", header: "Title", render: (row) => row.title || "Untitled link" },
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
      { key: "status", header: "Status", render: (row) => statusBadge(row) },
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
              {
                label: "Edit destination",
                onSelect: () => {
                  const newUrl = prompt("Enter new destination URL:", row.destination);
                  if (newUrl === null || newUrl.trim() === "") return;
                  adminEditLink(row.id, { destination_url: newUrl.trim() })
                    .then((updated) => {
                      const mapped = mapApiRow(updated);
                      setRows((prev) => prev.map((r) => (r.id === row.id ? mapped : r)));
                      push("Destination updated", "success");
                    })
                    .catch((error) => push(friendlyLinkError(error), "error"));
                },
              },
              {
                label: row.status === "active" ? "Pause" : "Resume",
                onSelect: () => {
                  adminToggleLink(row.id)
                    .then((updated) => {
                      const mapped = mapApiRow(updated);
                      setRows((prev) => prev.map((r) => (r.id === row.id ? mapped : r)));
                      push(updated.is_active ? "Link resumed" : "Link paused", "success");
                    })
                    .catch((error) => push(friendlyLinkError(error), "error"));
                },
              },
              {
                label: row.status === "blocked" ? "Unblock" : "Block",
                onSelect: () => {
                  const shouldBlock = row.status !== "blocked";
                  adminBlockLink(row.id, shouldBlock)
                    .then((updated) => {
                      const mapped = mapApiRow(updated);
                      if (shouldBlock) {
                        mapped.status = "blocked";
                        mapped.blockedReason = "manual";
                      }
                      setRows((prev) => prev.map((r) => (r.id === row.id ? mapped : r)));
                      push(shouldBlock ? "Link blocked" : "Link unblocked", "success");
                    })
                    .catch((error) => push(friendlyLinkError(error), "error"));
                },
              },
              {
                label: "Copy short link",
                onSelect: () => {
                  copyText(row.shortUrl)
                    .then(() => push("Short link copied", "success"))
                    .catch(() => push("Could not copy short link", "error"));
                },
              },
              {
                label: "Copy destination",
                onSelect: () => {
                  copyText(row.destination)
                    .then(() => push("Destination copied", "success"))
                    .catch(() => push("Could not copy destination", "error"));
                },
              },
              {
                label: "View quality",
                onSelect: () => {
                  window.location.href = `/admin/stats?code=${encodeURIComponent(row.code)}`;
                },
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
          <p className="muted">Admin control panel for link safety, quality, and status.</p>
        </div>

        <div className="links-toolbar">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, code, or destination"
            aria-label="Search links"
          />
        </div>
      </header>

      <Card className="section">
        <form className="quick-create-row" onSubmit={onCreateInline}>
          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled link"
          />

          <Input
            label="Destination URL *"
            value={destinationUrl}
            onChange={(e) => {
              const next = e.target.value;
              setDestinationUrl(next);
              setDestinationError(next.trim() ? validateDestinationInput(next) : "");
            }}
            placeholder="https://example.com/landing"
            type="url"
            required
          />

          <div className="quick-create-actions">
            <Button type="submit" loading={creating}>
              Quick create
            </Button>
            {destinationError ? <p className="auth-error">{destinationError}</p> : <p className="muted">http/https only</p>}
          </div>
        </form>

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

      <ConfirmDialog
        open={confirmOpen}
        title="Delete link"
        message={selected ? `Delete ${selected.title}?` : "Delete this link?"}
        confirmLabel="OK"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!selected) return;
          const linkId = selected.id;
          setConfirmOpen(false);
          adminDeleteLink(linkId)
            .then(() => {
              setRows((prev) => prev.filter((r) => r.id !== linkId));
              push("Link deleted", "success");
            })
            .catch((error) => push(friendlyLinkError(error), "error"));
        }}
      />
    </main>
  );
}
