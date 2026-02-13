"use client";

import { FormEvent, useMemo, useState } from "react";

const WEB_BASE = "https://urlshortener.devisuru.ggff.net";

function randomCode() {
  return Math.random().toString(36).slice(2, 7);
}

export default function NewLinkPage() {
  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [campaignTag, setCampaignTag] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const shortUrl = useMemo(() => (generatedCode ? `${WEB_BASE}/${generatedCode}` : ""), [generatedCode]);

  function onGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!destinationUrl.trim()) return;
    setGeneratedCode(randomCode());
  }

  async function copyShortUrl() {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
  }

  const qrUrl = shortUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shortUrl)}`
    : "";

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Create link</h1>
        <p className="muted">Add destination and generate short code. Backend save hook can be wired next.</p>
      </header>

      <section className="card section">
        <form className="auth-form" onSubmit={onGenerate}>
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
            <span>Optional title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Main campaign" />
          </label>

          <label>
            <span>Optional campaign tag</span>
            <input value={campaignTag} onChange={(e) => setCampaignTag(e.target.value)} placeholder="fb-cpc" />
          </label>

          <button className="btn" type="submit">
            Generate code
          </button>
        </form>
      </section>

      {shortUrl ? (
        <section className="card section generated-result">
          <h2>Result</h2>
          <p className="muted">{title || "Untitled link"}</p>
          <div className="inline-actions">
            <a href={shortUrl} target="_blank" rel="noreferrer" className="mono-link">
              {shortUrl}
            </a>
            <button className="btn btn-ghost btn-small" onClick={copyShortUrl} type="button">
              Copy
            </button>
          </div>

          <div className="result-meta muted">
            <p>Destination: {destinationUrl}</p>
            {campaignTag ? <p>Campaign: {campaignTag}</p> : null}
          </div>

          <div className="qr-box">
            <img src={qrUrl} alt="QR code for generated short URL" width={180} height={180} loading="lazy" />
            <p className="muted">QR (optional)</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
