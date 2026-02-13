"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { CopyButton } from "@/components/ui/CopyButton";
import { DashboardLink, appendStoredLink, makeCode } from "@/lib/links-store";

const WEB_BASE = "https://urlshortener.devisuru.ggff.net";

export default function NewLinkPage() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [campaignTag, setCampaignTag] = useState("");
  const [created, setCreated] = useState<DashboardLink | null>(null);

  const qrUrl = useMemo(
    () =>
      created?.shortUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(created.shortUrl)}`
        : "",
    [created]
  );

  function onCreate(e: FormEvent<HTMLFormElement>) {
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
    setCreated(link);
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
            <a href={created.shortUrl} target="_blank" rel="noreferrer" className="mono-link">
              {created.shortUrl}
            </a>
          </div>

          <CopyButton value={created.shortUrl} label="Copy short link" className="btn btn-big" />

          <div className="result-meta muted">
            <p>Destination: {created.destination}</p>
            {created.campaignTag ? <p>Campaign: {created.campaignTag}</p> : null}
            <p>Steps: Web {created.webSteps} / App {created.appSteps}</p>
          </div>

          <div className="qr-box">
            <img src={qrUrl} alt="QR code for created short URL" width={180} height={180} loading="lazy" />
            <p className="muted">QR (optional)</p>
          </div>

          <div className="inline-actions">
            <Link href="/dashboard/links" className="btn btn-ghost">
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

          <button className="btn" type="submit">
            Create link
          </button>
        </form>
      </section>
    </main>
  );
}
