"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ApiError, postStepComplete } from "@/lib/api";

import { CaptchaGate } from "./components/CaptchaGate";
import { ContinueButton } from "./components/ContinueButton";
import { ScrollGate } from "./components/ScrollGate";
import { StepTimer } from "./components/StepTimer";
import { TemplateA } from "./templates/TemplateA";
import { TemplateB } from "./templates/TemplateB";

type TerminalState = "none" | "expired" | "unavailable";

function decodeBase64Int(v: string | null, fallback: number) {
  if (!v) return fallback;
  try {
    const normalized = v.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLen);
    const raw = atob(padded);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

function decodeBase64Text(v: string | null) {
  if (!v) return "";
  try {
    const normalized = v.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLen);
    return atob(padded);
  } catch {
    return "";
  }
}

function mapStepError(error: unknown): { message: string; terminal: TerminalState } {
  if (!(error instanceof ApiError)) {
    return { message: "Something went wrong. Please try again.", terminal: "none" };
  }

  const detail = (error.message || "").toLowerCase();

  if (error.status === 401) {
    return { message: "Link expired, restart.", terminal: "expired" };
  }

  if (error.status === 404 && detail.includes("link")) {
    return { message: "This link is unavailable.", terminal: "unavailable" };
  }

  if (error.status === 404 || error.status === 409) {
    return { message: "Link expired, restart.", terminal: "expired" };
  }

  if (error.status === 429) {
    return { message: "Too many requests. Please wait and try again.", terminal: "none" };
  }

  if (error.status === 400 && detail.includes("minimum wait")) {
    return { message: "Please wait for the timer to finish before continuing.", terminal: "none" };
  }

  return { message: error.message || "Request failed", terminal: "none" };
}

export function InterstitialClient() {
  const params = useSearchParams();
  const sessionId = params.get("vid") || "";
  const token = params.get("st") || "";
  const step = Number(params.get("step") || 1);
  const totalSteps = decodeBase64Int(params.get("pages"), 1);
  const code = decodeBase64Text(params.get("lid"));

  const [timerDone, setTimerDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [forceCaptcha, setForceCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [terminal, setTerminal] = useState<TerminalState>("none");

  const requiresCaptcha = useMemo(() => forceCaptcha || step >= totalSteps, [forceCaptcha, step, totalSteps]);
  const waitSeconds = step <= 1 ? 8 : 3;
  const canContinue = timerDone && scrolled && (!requiresCaptcha || !!captchaToken) && terminal === "none";

  const restartHref = code ? `/${code}` : "/";

  async function onContinue() {
    setError("");
    setLoading(true);

    try {
      const res = await postStepComplete({
        session_id: sessionId,
        step,
        token,
        captcha_token: captchaToken || undefined,
      });

      if (res.requires_captcha) {
        setForceCaptcha(true);
        setError(res.message || "Verification required before continuing.");
        return;
      }

      if (res.next_step_url) {
        window.location.href = res.next_step_url;
        return;
      }

      if (res.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }

      setError("Unexpected server response.");
    } catch (e) {
      const mapped = mapStepError(e);
      setError(mapped.message);
      setTerminal(mapped.terminal);
    } finally {
      setLoading(false);
    }
  }

  if (!sessionId || !token || !Number.isFinite(step) || step < 1) {
    return (
      <main className="container interstitial-shell">
        <section className="interstitial-card card">
          <h1>Link expired, restart.</h1>
          <p className="muted">Your session is invalid or expired.</p>
          <Link href={restartHref} className="btn">
            Try again
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container interstitial-shell">
      <header className="interstitial-topbar">
        <p className="brand">PaidLink</p>
        <p className="muted">Safe redirect</p>
      </header>

      <section className="interstitial-progress card" aria-live="polite">
        <p>
          Step {Math.min(step, totalSteps)}/{totalSteps}
        </p>
        <div className="progress-track" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
          <span style={{ width: `${Math.min(100, Math.round((step / totalSteps) * 100))}%` }} />
        </div>
      </section>

      <section className="interstitial-card card">
        <h1>{step <= 1 ? "Please wait 8 seconds…" : "Please wait 3 seconds…"}</h1>
        <p className="muted">Complete this quick safety check to continue.</p>

        <StepTimer seconds={waitSeconds} resetKey={`${step}-${waitSeconds}`} onDone={() => setTimerDone(true)} />
        <ScrollGate onPass={() => setScrolled(true)} />
        <CaptchaGate required={requiresCaptcha} onToken={setCaptchaToken} />

        {terminal === "expired" ? (
          <div className="interstitial-terminal">
            <p className="auth-error">Link expired, restart.</p>
            <Link href={restartHref} className="btn btn-ghost">
              Try again
            </Link>
          </div>
        ) : null}

        {terminal === "unavailable" ? (
          <div className="interstitial-terminal">
            <p className="auth-error">This link is unavailable.</p>
            <Link href="/" className="btn btn-ghost">
              Go home
            </Link>
          </div>
        ) : null}

        {error && terminal === "none" ? <p className="auth-error">{error}</p> : null}

        <div className="interstitial-bottom">
          <ContinueButton disabled={!canContinue} loading={loading} onClick={onContinue} />
          <p className="muted">You will be redirected to your destination.</p>
        </div>
      </section>

      <section className="interstitial-ads card" aria-label="Advertisements">
        <p className="ad-label">Advertisement</p>
        <TemplateA />
      </section>

      <section className="interstitial-ads card" aria-label="Advertisements">
        <p className="ad-label">Advertisement</p>
        <TemplateB />
      </section>

      <div className="scroll-spacer" aria-hidden />
    </main>
  );
}
