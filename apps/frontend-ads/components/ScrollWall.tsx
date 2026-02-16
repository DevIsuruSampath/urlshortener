"use client";

import { useEffect, useState, useCallback } from "react";

interface ScrollWallProps {
  onComplete: () => void;
  loading?: boolean;
  threshold?: number;
}

export default function ScrollWall({
  onComplete,
  loading = false,
  threshold = 0.9,
}: ScrollWallProps) {
  const [canContinue, setCanContinue] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Calculate scroll depth (0 to 1)
    const scrollDepth = (scrollTop + clientHeight) / scrollHeight;

    if (scrollDepth >= threshold) {
      setCanContinue(true);
    }
  }, [threshold]);

  useEffect(() => {
    // Check on mount (in case page is short enough)
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <p style={styles.hint}>
          {canContinue
            ? "✅ You can now continue!"
            : "⬇️ Scroll down to continue..."}
        </p>
        <button
          onClick={onComplete}
          disabled={!canContinue || loading}
          style={{
            ...styles.button,
            ...(canContinue && !loading ? styles.buttonEnabled : styles.buttonDisabled),
          }}
        >
          {loading ? "Processing..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "linear-gradient(transparent, rgba(0,0,0,0.95) 30%)",
    padding: "40px 0 0",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px 24px 28px",
    textAlign: "center",
  },
  hint: {
    color: "#aaa",
    fontSize: "14px",
    marginBottom: "12px",
  },
  button: {
    width: "100%",
    padding: "16px 32px",
    fontSize: "18px",
    fontWeight: 700,
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
  },
  buttonEnabled: {
    background: "linear-gradient(135deg, #00c853, #00e676)",
    color: "#000",
    boxShadow: "0 4px 20px rgba(0, 200, 83, 0.4)",
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#333",
    color: "#666",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
