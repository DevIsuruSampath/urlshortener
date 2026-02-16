"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import ScrollWall from "@/components/ads/ScrollWall";
import { env } from "@/lib/env";

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra augue nec augue.

Nam dui ligula, fringilla a, euismod sodales, sollicitudin vel, wisi. Morbi auctor lorem non justo. Nam lacus libero, pretium at, lobortis vitae, ultricies et, tellus. Donec aliquet, tortor sed accumsan bibendum, erat ligula aliquet magna, vitae ornare odio metus a mi. Morbi ac orci et nisl hendrerit mollis. Suspendisse ut massa. Cras nec ante. Pellentesque a nulla. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam tincidunt urna.

Pellentesque cursus luctus mauris. Nulla malesuada porttitor diam. Donec felis erat, congue non, volutpat at, tincidunt tristique, libero. Vivamus viverra fermentum felis. Donec nonummy pellentesque ante. Phasellus adipiscing semper elit. Proin fermentum massa ac quam. Sed diam turpis, molestie vitae, placerat a, molestie nec, leo. Maecenas lacinia. Nam ipsum ligula, eleifend at, accumsan nec, suscipit a, ipsum. Morbi blandit ligula feugiat magna.

Suspendisse potenti. Sed sollicitudin massa at felis. Nulla quis diam. Sed tempus. Vestibulum tempor nulla sed urna. Praesent id eros. Nunc ac augue. Fusce pede erat, ultrices non, consequat et, semper sit amet, urna. Cras venenatis augue vitae nulla. Curabitur ligula sapien, pulvinar a vestibulum quis, facilisis vel sapien.

Aenean sagittis. Praesent id justo in neque elementum ultrices. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Etiam dictum tincidunt diam. Donec ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Suspendisse nisl. Sed vitae arcu. Aliquam varius adipiscing enim. Aliquam erat volutpat. Ut quis sapien vel diam faucibus viverra.

Nulla facilisi. Sed pulvinar, felis id consequat commodo, nibh augue pretium tellus, sed varius turpis turpis sit amet elit. Donec at pede. Etiam vel neque nec dui dignissim bibendum. Vivamus id enim. Phasellus neque orci, porta a, aliquet quis, semper a, massa. Phasellus purus. Pellentesque tristique imperdiet tortor. Nam euismod tellus id erat.`;

const TOTAL_STEPS = 3;

export default function StepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const step = Number(params.step) || 1;
  const sessionId = searchParams.get("session_id") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = useCallback(async () => {
    if (!sessionId) {
      setError("No session ID found. Please start from a valid short link.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${env.apiBase}/visitor/step-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          step_number: step,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Step verification failed.");
        return;
      }

      if (step < TOTAL_STEPS) {
        router.push(`/step/${step + 1}?session_id=${sessionId}`);
      } else {
        // All steps done — redirect to verification page (on short domain)
        const shortDomain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "exa.com";
        const verifyBase = `https://${shortDomain}`;
        window.location.href = `${verifyBase}/verify?session_id=${sessionId}`;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, step, router]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <p style={styles.brand}>PaidLink</p>
        <p style={styles.stepIndicator}>
          Step {step} of {TOTAL_STEPS}
        </p>
      </header>

      {/* Step Progress Bar */}
      <div style={styles.progressContainer}>
        <div
          style={{
            ...styles.progressBar,
            width: `${(step / TOTAL_STEPS) * 100}%`,
          }}
        />
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header Ad Placeholder */}
        <div style={styles.adHeader}>
          <p style={styles.adLabel}>Advertisement</p>
          <div style={styles.adHeaderSlot}>
            <span style={styles.adPlaceholder}>Ad Slot — 728×90</span>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* Article Content */}
          <article style={styles.article}>
            <h1 style={styles.title}>
              {step === 1 && "🔒 Secure Link Verification — Step 1"}
              {step === 2 && "🛡️ Identity Confirmation — Step 2"}
              {step === 3 && "✅ Final Verification — Step 3"}
            </h1>
            <p style={styles.subtitle}>
              Please scroll to the bottom to continue to{" "}
              {step < TOTAL_STEPS ? `step ${step + 1}` : "your destination"}.
            </p>

            {LOREM.split("\n\n").map((paragraph, i) => (
              <p key={i} style={styles.paragraph}>
                {paragraph}
              </p>
            ))}

            <div style={styles.divider} />
            <h2 style={styles.sectionTitle}>Additional Information</h2>
            {LOREM.split("\n\n")
              .slice(0, 4)
              .map((paragraph, i) => (
                <p key={`extra-${i}`} style={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
          </article>

          {/* Sidebar Ad */}
          <aside style={styles.sidebar}>
            <div style={styles.adSidebar}>
              <p style={styles.adLabel}>Advertisement</p>
              <div style={styles.adSidebarSlot}>
                <span style={styles.adPlaceholder}>Ad Slot — 160×600</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBar}>
          <p>{error}</p>
        </div>
      )}

      {/* ScrollWall */}
      <ScrollWall onComplete={handleComplete} loading={loading} />

      {/* Bottom spacer for ScrollWall */}
      <div style={{ height: 160 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #1a1a1a",
  },
  brand: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#00e676",
  },
  stepIndicator: {
    fontSize: "14px",
    color: "#888",
  },
  progressContainer: {
    height: 4,
    background: "#1a1a1a",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #00c853, #00e676)",
    transition: "width 0.5s ease",
    borderRadius: "0 2px 2px 0",
  },
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px",
  },
  adHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  adLabel: {
    fontSize: "10px",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: 4,
  },
  adHeaderSlot: {
    width: 728,
    height: 90,
    margin: "0 auto",
    background: "#111",
    border: "1px dashed #333",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
  },
  adPlaceholder: {
    color: "#444",
    fontSize: "13px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 180px",
    gap: 32,
  },
  article: {
    minWidth: 0,
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: "16px",
    color: "#888",
    marginBottom: 32,
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: 1.8,
    color: "#bbb",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    background: "#222",
    margin: "40px 0",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#ddd",
    marginBottom: 16,
  },
  sidebar: {
    position: "sticky" as const,
    top: 24,
    alignSelf: "start",
  },
  adSidebar: {
    textAlign: "center",
  },
  adSidebarSlot: {
    width: 160,
    height: 600,
    background: "#111",
    border: "1px dashed #333",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#ff1744",
    color: "#fff",
    padding: "12px 24px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 600,
    zIndex: 2000,
  },
};
