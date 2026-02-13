"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { postStepComplete } from "@/lib/api";
import { StepTimer } from "./components/StepTimer";
import { ScrollGate } from "./components/ScrollGate";
import { CaptchaGate } from "./components/CaptchaGate";
import { ContinueButton } from "./components/ContinueButton";
import { TemplateA } from "./templates/TemplateA";
import { TemplateB } from "./templates/TemplateB";

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

export default function InterstitialPage() {
  const params = useSearchParams();
  const sessionId = params.get("vid") || "";
  const token = params.get("st") || "";
  const totalSteps = decodeBase64Int(params.get("pages"), 1);
  const step = Number(params.get("step") || 1);

  const [timerDone, setTimerDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requiresCaptcha = useMemo(() => step >= totalSteps, [step, totalSteps]);
  const waitSeconds = step <= 1 ? 8 : 3;

  const canContinue = timerDone && scrolled && (!requiresCaptcha || !!captchaToken);

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

      if (res.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }
      if (res.next_step_url) {
        window.location.href = res.next_step_url;
        return;
      }
      setError("Unexpected server response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Security Check – Step {step}/{totalSteps}</h1>
      <p className="muted">Complete all steps to continue to your destination.</p>

      <div className="card" style={{ marginTop: 12 }}>
        <TemplateA />
        <div style={{ height: 12 }} />
        <TemplateB />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <StepTimer seconds={waitSeconds} resetKey={`${step}-${waitSeconds}`} onDone={() => setTimerDone(true)} />
        <ScrollGate onPass={() => setScrolled(true)} />
        <CaptchaGate required={requiresCaptcha} onToken={setCaptchaToken} />

        <div style={{ marginTop: 12 }}>
          <ContinueButton disabled={!canContinue} loading={loading} onClick={onContinue} />
        </div>

        {error ? <p style={{ color: "#ff6b6b" }}>{error}</p> : null}
      </div>
    </main>
  );
}
