"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { AdTemplateSwitcher } from "@/components/flow/AdTemplateSwitcher";
import { CaptchaGate } from "@/components/flow/CaptchaGate";
import { ContinueButton } from "@/components/flow/ContinueButton";
import { ScrollGate } from "@/components/flow/ScrollGate";
import { StepProgress } from "@/components/flow/StepProgress";
import { StepTimer } from "@/components/flow/StepTimer";
import { ApiError, postStepComplete } from "@/lib/api";

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

  if (error.status === 403 || detail.includes("blocked") || detail.includes("unavailable")) {
    return { message: "This link is unavailable.", terminal: "unavailable" };
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
  const isDemo = params.get("demo") === "1";

  const sessionId = params.get("vid") || "";
  const token = params.get("st") || "";
  const code = decodeBase64Text(params.get("lid"));

  const initialStep = Number(params.get("step") || 1);
  const totalSteps = decodeBase64Int(params.get("pages"), isDemo ? 3 : 1);

  const [activeStep, setActiveStep] = useState(Number.isFinite(initialStep) && initialStep > 0 ? initialStep : 1);
  const [timerDone, setTimerDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [forceCaptcha, setForceCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [terminal, setTerminal] = useState<TerminalState>("none");
  const [demoDone, setDemoDone] = useState(false);
  const reduce = useReducedMotion();

  const requiresCaptcha = useMemo(() => forceCaptcha || activeStep >= totalSteps, [forceCaptcha, activeStep, totalSteps]);
  const waitSeconds = activeStep <= 1 ? 8 : 3;
  const canContinue = timerDone && scrolled && (!requiresCaptcha || !!captchaToken) && terminal === "none";

  const restartHref = code ? `/${code}` : isDemo ? "/l?demo=1" : "/";

  function resetGatesForNextStep(nextStep: number) {
    setActiveStep(nextStep);
    setTimerDone(false);
    setScrolled(false);
    setCaptchaToken("");
    setForceCaptcha(false);
    setLoading(false);
    setError("");
    setTerminal("none");
  }

  async function onContinue() {
    setError("");

    if (isDemo) {
      if (activeStep < totalSteps) {
        resetGatesForNextStep(activeStep + 1);
        return;
      }
      setDemoDone(true);
      return;
    }

    setLoading(true);

    try {
      const res = await postStepComplete({
        session_id: sessionId,
        step: activeStep,
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

  if ((!sessionId || !token || !Number.isFinite(initialStep) || initialStep < 1) && !isDemo) {
    return (
      <main className="container interstitial-shell">
        <section className="interstitial-card card">
          <h1>Link expired, restart.</h1>
          <p className="muted">Your session is invalid or expired.</p>
          <div className="inline-actions">
            <Link href={restartHref} className="btn">
              Try again
            </Link>
            <Link href="/l?demo=1" className="btn btn-ghost">
              Open demo flow
            </Link>
          </div>
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

      {isDemo ? <p className="interstitial-demo-chip">Demo mode</p> : null}

      <StepProgress step={activeStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={`flow-step-${activeStep}`}
          className="interstitial-card card"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={reduce ? undefined : { duration: 0.2, ease: "easeOut" }}
        >
          <h1>{activeStep <= 1 ? "Please wait 8 seconds…" : "Please wait 3 seconds…"}</h1>
          <p className="muted">Quick safety check.</p>

          <StepTimer key={`timer-${activeStep}`} seconds={waitSeconds} resetKey={`${activeStep}-${waitSeconds}`} onDone={() => setTimerDone(true)} />
          <ScrollGate key={`scroll-${activeStep}`} onPass={() => setScrolled(true)} />
          <CaptchaGate key={`captcha-${activeStep}`} required={requiresCaptcha} onToken={setCaptchaToken} />

          <AnimatePresence mode="wait" initial={false}>
            {terminal === "expired" ? (
              <motion.div
                key="expired"
                className="interstitial-terminal"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={reduce ? undefined : { duration: 0.18 }}
              >
                <p className="auth-error">Link expired, restart.</p>
                <Link href={restartHref} className="btn btn-ghost">
                  Try again
                </Link>
              </motion.div>
            ) : null}

            {terminal === "unavailable" ? (
              <motion.div
                key="unavailable"
                className="interstitial-terminal"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={reduce ? undefined : { duration: 0.18 }}
              >
                <p className="auth-error">This link is unavailable.</p>
                <Link href="/" className="btn btn-ghost">
                  Go home
                </Link>
              </motion.div>
            ) : null}

            {error && terminal === "none" ? (
              <motion.p
                key="error"
                className="auth-error"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -3 }}
                transition={reduce ? undefined : { duration: 0.16 }}
              >
                {error}
              </motion.p>
            ) : null}

            {demoDone ? (
              <motion.p
                key="demo-done"
                className="auth-success"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -3 }}
                transition={reduce ? undefined : { duration: 0.16 }}
              >
                Demo complete. In production, step 3 redirects to destination.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="interstitial-bottom">
            <ContinueButton disabled={!canContinue || demoDone} loading={loading} onClick={onContinue} />
            <p className="muted">You will be redirected to your destination.</p>
          </div>
        </motion.section>
      </AnimatePresence>

      <AdTemplateSwitcher variantSeed={activeStep} />
      <AdTemplateSwitcher variantSeed={activeStep + 1} />

      <div className="scroll-spacer" aria-hidden />
    </main>
  );
}
