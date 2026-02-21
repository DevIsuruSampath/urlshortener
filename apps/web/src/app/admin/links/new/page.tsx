"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { CopyButton } from "@/components/ui/CopyButton";
import { adminCreateLink, AdminLinkResponse, ApiError } from "@/lib/api";

type CreatedLinkView = {
  title: string;
  campaignTag?: string;
  row: AdminLinkResponse;
};

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

export default function NewLinkPage() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [campaignTag, setCampaignTag] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedLinkView | null>(null);

  const qrUrl = useMemo(
    () =>
      created?.row.short_url
        ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(created.row.short_url)}`
        : "",
    [created]
  );

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!destinationUrl.trim()) return;

    setCreating(true);
    setError("");

    try {
      const row = await adminCreateLink({ 
        destination_url: destinationUrl.trim(), 
        tier: "standard",
        created_via: "dashboard"
      });
      setCreated({
        title: title.trim() || `Link ${row.code}`,
        campaignTag: campaignTag.trim() || undefined,
        row,
      });
    } catch (err) {
      setError(friendlyLinkError(err));
    } finally {
      setCreating(false);
    }
  }

  if (created) {
    return (
      <main className="dash-page">
        <header className="dash-page-head">
          <h1>Link created</h1>
          <p className="muted">Your short link is ready.</p>
        </header>

        <section className="card section generated-result">
          <h2>{created.title}</h2>
          <div className="inline-actions">
            <a href={created.row.short_url} target="_blank" rel="noreferrer" className="mono-link">
              {created.row.short_url}
            </a>
          </div>

          <CopyButton value={created.row.short_url} label="Copy short link" className="btn btn-big" />

          <div className="result-meta muted">
            <p>Destination: {created.row.destination_url}</p>
            {created.campaignTag ? <p>Campaign: {created.campaignTag}</p> : null}
            <p>Steps: Web {created.row.web_steps} / App {created.row.app_steps}</p>
          </div>

          <div className="qr-box">
            <img src={qrUrl} alt="QR code for created short URL" width={180} height={180} loading="lazy" />
            <p className="muted">QR (optional)</p>
          </div>

          <div className="inline-actions">
            <Link href="/admin/links" className="btn btn-ghost">
              Back to links table
            </Link>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCreated(null);
                setDestinationUrl("");
                setTitle("");
                setCampaignTag("");
              }}
            >
              Create another
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Create link</h1>
        <p className="muted">Destination required. Title and campaign are optional.</p>
      </header>

      <section className="card section">
        <form className="auth-form" onSubmit={onCreate}>
          <label>
            <span>Destination URL *</span>
            <input
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com/landing"
              type="url"
              required
            />
          </label>

          <label>
            <span>Title (optional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Main campaign" />
          </label>

          <label>
            <span>Campaign tag (optional)</span>
            <input value={campaignTag} onChange={(e) => setCampaignTag(e.target.value)} placeholder="fb-cpc" />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="btn" type="submit" disabled={creating}>
            {creating ? "Please wait..." : "Create link"}
          </button>
        </form>
      </section>
    </main>
  );
}
