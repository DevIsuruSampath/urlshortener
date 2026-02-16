"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { env } from "@/lib/env";

type LogEntry = {
  id: number;
  prefix: string;
  text: string;
  status: string;
  statusClass: "ok" | "loading" | "error" | "";
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";

  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [originalUrl, setOriginalUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const logId = useRef(0);
  const hasRun = useRef(false);

  function addLog(prefix: string, text: string, status = "", statusClass: LogEntry["statusClass"] = "") {
    const id = ++logId.current;
    setLogs((prev) => [...prev, { id, prefix, text, status, statusClass }]);
    return id;
  }

  function updateLog(id: number, text: string, status: string, statusClass: LogEntry["statusClass"]) {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, prefix: "›", text, status, statusClass } : l))
    );
  }

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function run() {
      if (!sessionId) {
        addLog("✗", "No session ID provided", "FAIL", "error");
        setProgress(100);
        setResult("error");
        setErrorMsg("No session ID provided");
        return;
      }

      // Step 1
      setProgress(10);
      const s1 = addLog("›", "Checking Browser...");
      await sleep(1000);
      setProgress(30);
      updateLog(s1, "Checking Browser...", "OK", "ok");
      await sleep(300);

      // Step 2
      setProgress(40);
      const s2 = addLog("›", "Validating Ad Views...");
      await sleep(1200);
      setProgress(65);
      updateLog(s2, "Validating Ad Views...", "OK", "ok");
      await sleep(300);

      // Step 3
      setProgress(70);
      const s3 = addLog("›", "Generating Secure Token...");
      await sleep(800);
      setProgress(85);

      // Call API
      try {
        const res = await fetch(`${env.apiBase}/visitor/verify/${sessionId}`);
        const data = await res.json();

        if (res.ok && data.original_url) {
          setProgress(100);
          updateLog(s3, "Generating Secure Token...", "OK", "ok");
          await sleep(400);
          addLog("✓", "Verification complete", "PASS", "ok");
          await sleep(300);
          setResult("success");
          setOriginalUrl(data.original_url);
        } else {
          throw new Error(data.detail || "Verification failed");
        }
      } catch (err: unknown) {
        setProgress(100);
        const msg = err instanceof Error ? err.message : "Session expired";
        updateLog(s3, "Generating Secure Token...", "FAIL", "error");
        await sleep(300);
        addLog("✗", msg, "FAIL", "error");
        await sleep(300);
        setResult("error");
        setErrorMsg(msg);
      }
    }

    run();
  }, [sessionId]);

  // Countdown + redirect
  useEffect(() => {
    if (result !== "success" || !originalUrl) return;
    if (countdown <= 0) {
      window.location.href = originalUrl;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [result, originalUrl, countdown]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.shieldIcon}>🛡️</span>
            <h1 style={styles.h1}>Secure Link Generator</h1>
            <p style={styles.headerSub}>Verifying your session...</p>
          </div>

          {/* Progress Bar */}
          <div style={styles.progressWrapper}>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                }}
              />
            </div>
            <p style={styles.progressLabel}>{progress}%</p>
          </div>

          {/* Terminal */}
          <div style={styles.terminal}>
            <div style={styles.terminalHeader}>
              <div style={{ ...styles.dot, background: "#ff5f57" }} />
              <div style={{ ...styles.dot, background: "#febc2e" }} />
              <div style={{ ...styles.dot, background: "#28c840" }} />
            </div>
            <div>
              {logs.map((log) => (
                <div key={log.id} style={styles.logEntry}>
                  <span style={styles.logPrefix}>{log.prefix}</span>
                  <span style={styles.logText}>{log.text}</span>
                  {log.status ? (
                    <span
                      style={{
                        ...styles.logStatus,
                        color:
                          log.statusClass === "ok"
                            ? "#00e676"
                            : log.statusClass === "error"
                            ? "#ff1744"
                            : "#ffd600",
                      }}
                    >
                      {log.status}
                    </span>
                  ) : (
                    <span style={styles.cursor} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success */}
          {result === "success" && (
            <div style={styles.resultBlock}>
              <h2 style={{ fontSize: 18, color: "#00e676", marginBottom: 8 }}>
                ✅ Verification Complete
              </h2>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                Secure token generated successfully.
              </p>
              <p style={styles.redirectNote}>
                {countdown > 0
                  ? `Redirecting in ${countdown} second${countdown !== 1 ? "s" : ""}...`
                  : "Redirecting now..."}
              </p>
            </div>
          )}

          {/* Error */}
          {result === "error" && (
            <div style={styles.resultBlock}>
              <h2 style={{ fontSize: 18, color: "#ff1744", marginBottom: 12 }}>
                ⚠️ Session Expired
              </h2>
              <p style={{ color: "#888", marginBottom: 16 }}>
                {errorMsg || "Your verification session has expired or is invalid."}
              </p>
              <a href="/" style={styles.retryBtn}>
                Try Again
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
    fontFamily: "'Inter', -apple-system, sans-serif",
    color: "#e0e0e0",
    overflow: "hidden",
  },
  container: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 520,
    padding: 20,
  },
  card: {
    background: "rgba(17, 17, 17, 0.9)",
    border: "1px solid #1a1a1a",
    borderRadius: 16,
    padding: "40px 36px",
    boxShadow: "0 0 80px rgba(0, 230, 118, 0.06), 0 20px 60px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(20px)",
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  shieldIcon: {
    fontSize: 48,
    marginBottom: 12,
    display: "block",
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: "#666",
  },
  progressWrapper: {
    marginBottom: 28,
  },
  progressTrack: {
    height: 6,
    background: "#1a1a1a",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00c853, #00e676, #69f0ae)",
    borderRadius: 3,
    transition: "width 0.4s ease",
    boxShadow: "0 0 12px rgba(0, 230, 118, 0.4)",
  },
  progressLabel: {
    textAlign: "right",
    fontSize: 11,
    color: "#555",
    marginTop: 6,
    fontFamily: "'JetBrains Mono', monospace",
  },
  terminal: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: 10,
    padding: 20,
    marginBottom: 28,
    minHeight: 140,
  },
  terminalHeader: {
    display: "flex",
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  logEntry: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: "1.8",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logPrefix: {
    color: "#00e676",
  },
  logText: {
    color: "#888",
  },
  logStatus: {
    marginLeft: "auto",
    fontWeight: 700,
  },
  cursor: {
    display: "inline-block",
    width: 8,
    height: 16,
    background: "#00e676",
    verticalAlign: "middle",
    marginLeft: 4,
  },
  resultBlock: {
    textAlign: "center",
  },
  redirectNote: {
    fontSize: 12,
    color: "#444",
    marginTop: 16,
    fontFamily: "'JetBrains Mono', monospace",
  },
  retryBtn: {
    display: "inline-block",
    padding: "14px 36px",
    background: "transparent",
    color: "#ff1744",
    border: "1px solid #ff1744",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    marginTop: 8,
  },
};
