"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminListLinks, adminCreateLink, AdminLinkResponse, ApiError } from "@/lib/api";

type LinkStatus = "active" | "paused" | "blocked";

interface LinkItem {
  id: string;
  code: string;
  shortUrl: string;
  destination: string;
  status: LinkStatus;
  clicks: number;
  valid: number;
  invalid: number;
  conversion: string;
  createdAt: string;
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🔗</div>
      <h3>No links yet</h3>
      <p className="muted">Create a link to start getting clicks and view analytics.</p>
      <Link href="/links/new" className="btn btn-primary">
        + Create Link
      </Link>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button className="btn btn-sm btn-ghost" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LinkStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiError, setApiError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const data = await adminListLinks();
      console.log("Loaded links from API:", data); // Debug log
      
      // Transform API data to our format
      const transformed = data.map((link: AdminLinkResponse) => ({
        id: link.id,
        code: link.code,
        shortUrl: link.short_url,
        destination: link.destination_url,
        status: link.is_active ? "active" : "paused",
        clicks: 0, // TODO: Get from stats API when available
        valid: 0, // TODO: Get from stats API when available
        invalid: 0, // TODO: Get from stats API when available
        conversion: "0%",
        createdAt: link.created_at || new Date().toISOString(),
      }));
      setLinks(transformed);
    } catch (error: any) {
      console.error("Failed to load links:", error);
      setApiError(error?.message || "Failed to load links. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // Filter and search
  const filteredLinks = links.filter(link => {
    const matchesSearch = 
      link.code.toLowerCase().includes(search.toLowerCase()) ||
      link.destination.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || link.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLinks = filteredLinks.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <main className="dash-page">
        <header className="dash-page-head">
          <h1>Links</h1>
          <p className="muted">Manage your short links</p>
        </header>
        <div className="card">
          <p className="muted">Loading links...</p>
        </div>
      </main>
    );
  }

  if (apiError) {
    return (
      <main className="dash-page">
        <header className="dash-page-head">
          <h1>Links</h1>
          <p className="muted">Manage your short links</p>
        </header>
        <div className="card error-card">
          <h3>⚠️ Error Loading Links</h3>
          <p>{apiError}</p>
          <button 
            className="btn btn-primary" 
            onClick={loadLinks}
            style={{ marginTop: "var(--space-4)" }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Links</h1>
        <p className="muted">Manage your short links</p>
      </header>

      {/* Debug info - remove in production */}
      {links.length > 0 && (
        <div className="card info-card" style={{ marginBottom: "var(--space-4)" }}>
          <p className="text-sm muted">
            <strong>Note:</strong> Stats (clicks, conversion) are not implemented yet. 
            Short URLs come from backend API. If they show wrong domain, check backend SHORT_DOMAIN configuration.
          </p>
        </div>
      )}

      {links.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Controls */}
          <div className="links-controls card">
            <div className="controls-grid">
              <div className="search-control">
                <input
                  type="text"
                  placeholder="Search by code or destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-control">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LinkStatus | "all")}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="create-control">
                <Link href="/links/new" className="btn btn-primary">
                  + Create Link
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="table-wrap">
              <table className="tier-table dash-responsive-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Clicks</th>
                    <th>Valid</th>
                    <th>Conversion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLinks.map((link) => (
                    <tr key={link.id}>
                      <td data-label="Code">
                        <div className="code-cell">
                          <span className="mono">{link.code}</span>
                          <span className="muted text-sm">{link.shortUrl}</span>
                        </div>
                      </td>
                      <td data-label="Destination">
                        <div className="truncate-url" title={link.destination}>
                          {link.destination}
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge ${link.status}`}>
                          {link.status}
                        </span>
                      </td>
                      <td data-label="Clicks">{link.clicks}</td>
                      <td data-label="Valid">{link.valid}</td>
                      <td data-label="Conversion">{link.conversion}</td>
                      <td data-label="Actions">
                        <CopyButton text={link.shortUrl} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  className="btn btn-ghost"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}