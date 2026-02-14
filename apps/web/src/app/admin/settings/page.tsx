"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  adminDeveloperTokenInfo,
  adminFinalizeDeveloperTokenRotation,
  adminListSecurityEvents,
  adminRecordSecurityEvent,
  adminRegenerateDeveloperToken,
  ApiError,
  type AdminSecurityEvent,
} from "@/lib/api";
import { env } from "@/lib/env";

function toAbsoluteBaseUrl(base: string): string {
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return base.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return new URL(base, window.location.origin).toString().replace(/\/$/, "");
  }

  return base.replace(/\/$/, "");
}

function formatEventTime(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function eventDetailsText(details: Record<string, unknown> | undefined): string {
  if (!details || Object.keys(details).length === 0) return "—";
  return Object.entries(details)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(" | ");
}

export default function SettingsPage() {
  const { push } = useToast();

  const [adminEmail] = useState("admin@urlshortener.local");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [webSteps, setWebSteps] = useState("3");
  const [appSteps, setAppSteps] = useState("5");
  const [step1Seconds, setStep1Seconds] = useState("8");
  const [stepNSeconds, setStepNSeconds] = useState("3");
  const [captchaMode, setCaptchaMode] = useState("suspicious_only");

  const [dedupeHours, setDedupeHours] = useState("24");
  const [startRatePerMinute, setStartRatePerMinute] = useState("120");
  const [stepRatePerMinute, setStepRatePerMinute] = useState("60");
  const [authRatePerMinute, setAuthRatePerMinute] = useState("20");

  const [payoutThresholdUsd, setPayoutThresholdUsd] = useState("250");
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [primaryAdNetwork, setPrimaryAdNetwork] = useState("monetag");
  const [secondaryAdNetwork, setSecondaryAdNetwork] = useState("adsterra");
  const [globalMobileRpm, setGlobalMobileRpm] = useState("1.20");
  const [globalDesktopRpm, setGlobalDesktopRpm] = useState("1.80");
  const [lkMobileRpm, setLkMobileRpm] = useState("1.55");
  const [inMobileRpm, setInMobileRpm] = useState("0.95");

  const [maskedDevelopersApiToken, setMaskedDevelopersApiToken] = useState("loading...");
  const [maskedDevelopersApiTokens, setMaskedDevelopersApiTokens] = useState<string[]>([]);
  const [latestGeneratedToken, setLatestGeneratedToken] = useState("");
  const [rotatingToken, setRotatingToken] = useState(false);
  const [finalizingToken, setFinalizingToken] = useState(false);
  const [securityEvents, setSecurityEvents] = useState<AdminSecurityEvent[]>([]);
  const [loadingSecurityEvents, setLoadingSecurityEvents] = useState(true);

  const developersApiBase = useMemo(() => `${toAbsoluteBaseUrl(env.apiBase)}/api`, []);
  const sampleDestination = "https://example.com/landing";
  const sampleAlias = "myalias";
  const sampleJsonRequest = `${developersApiBase}?api=YOUR_TOKEN&url=${encodeURIComponent(sampleDestination)}&alias=${encodeURIComponent(sampleAlias)}`;
  const sampleTextRequest = `${sampleJsonRequest}&format=text`;

  useEffect(() => {
    let alive = true;

    adminDeveloperTokenInfo()
      .then((res) => {
        if (!alive) return;
        setMaskedDevelopersApiToken(res.masked_token || "not-configured");
        setMaskedDevelopersApiTokens(res.masked_tokens || []);
      })
      .catch((error) => {
        if (!alive) return;
        if (error instanceof ApiError && error.status === 401) {
          setMaskedDevelopersApiToken("session-required");
          setMaskedDevelopersApiTokens([]);
          return;
        }
        setMaskedDevelopersApiToken("not-configured");
        setMaskedDevelopersApiTokens([]);
      });

    adminListSecurityEvents(50)
      .then((rows) => {
        if (!alive) return;
        setSecurityEvents(rows);
      })
      .catch(() => {
        if (!alive) return;
        setSecurityEvents([]);
      })
      .finally(() => {
        if (alive) setLoadingSecurityEvents(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function trackSecurityEvent(event_type: "settings_changed" | "link_blocked" | "link_unblocked", details: Record<string, unknown>) {
    try {
      const row = await adminRecordSecurityEvent({ event_type, details });
      setSecurityEvents((prev) => [row, ...prev].slice(0, 50));
    } catch {
      // best-effort audit event logging
    }
  }

  async function onRegenerateDeveloperToken() {
    setRotatingToken(true);
    try {
      const res = await adminRegenerateDeveloperToken();
      setLatestGeneratedToken(res.new_token || "");
      setMaskedDevelopersApiTokens(res.masked_tokens || []);
      setMaskedDevelopersApiToken((res.masked_tokens && res.masked_tokens[0]) || "not-configured");
      push("Developer API token rotated. New token added alongside old token.", "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        push("Session expired. Please login again.", "error");
      } else {
        push("Failed to rotate developer API token.", "error");
      }
    } finally {
      setRotatingToken(false);
    }
  }

  async function onFinalizeDeveloperTokenRotation() {
    setFinalizingToken(true);
    try {
      const res = await adminFinalizeDeveloperTokenRotation();
      setMaskedDevelopersApiTokens(res.masked_tokens || []);
      setMaskedDevelopersApiToken((res.masked_tokens && res.masked_tokens[0]) || "not-configured");
      setLatestGeneratedToken("");
      push("Developer API token rotation finalized (old tokens removed).", "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        push("Session expired. Please login again.", "error");
      } else {
        push("Failed to finalize token rotation.", "error");
      }
    } finally {
      setFinalizingToken(false);
    }
  }

  async function onPasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      push("Fill all password fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      push("New password and confirmation do not match.", "error");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    push("Password change saved (UI placeholder).", "success");
    await trackSecurityEvent("settings_changed", { section: "admin_access", action: "change_password_placeholder" });
  }

  async function onFlowDefaultsSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Flow defaults updated.", "success");
    await trackSecurityEvent("settings_changed", { section: "flow_defaults" });
  }

  async function onAntiAbuseSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Anti-abuse rules updated.", "success");
    await trackSecurityEvent("settings_changed", { section: "anti_abuse" });
  }

  async function onMonetizationSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Monetization settings updated.", "success");
    await trackSecurityEvent("settings_changed", { section: "monetization" });
  }

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Settings</h1>
        <p className="muted">System control for admin identity, flow defaults, anti-abuse, and monetization.</p>
      </header>

      <section className="dash-two-col settings-grid">
        <article className="card section">
          <h2>Admin access</h2>
          <p className="muted">Single-admin password mode.</p>

          <div className="settings-form">
            <Input label="Admin email" value={adminEmail} readOnly />
          </div>

          <hr className="settings-sep" />

          <form className="settings-form" onSubmit={onPasswordChange}>
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <div className="settings-actions">
              <Button type="submit">Change password</Button>
            </div>
          </form>
        </article>

        <article className="card section">
          <h2>Flow defaults</h2>
          <p className="muted">Default values for newly created links.</p>

          <form className="settings-form" onSubmit={onFlowDefaultsSave}>
            <div className="settings-inline-grid">
              <Input
                label="Web steps default"
                type="number"
                min={1}
                max={10}
                value={webSteps}
                onChange={(e) => setWebSteps(e.target.value)}
              />
              <Input
                label="App steps default"
                type="number"
                min={1}
                max={12}
                value={appSteps}
                onChange={(e) => setAppSteps(e.target.value)}
              />
            </div>

            <div className="settings-inline-grid">
              <Input
                label="Timer seconds (step 1)"
                type="number"
                min={1}
                value={step1Seconds}
                onChange={(e) => setStep1Seconds(e.target.value)}
              />
              <Input
                label="Timer seconds (step 2+)"
                type="number"
                min={1}
                value={stepNSeconds}
                onChange={(e) => setStepNSeconds(e.target.value)}
              />
            </div>

            <Select label="Captcha mode" value={captchaMode} onChange={(e) => setCaptchaMode(e.target.value)}>
              <option value="last_step_always">Always on last step</option>
              <option value="suspicious_only">Suspicious only</option>
            </Select>

            <div className="settings-actions">
              <Button type="submit">Save flow defaults</Button>
            </div>
          </form>
        </article>
      </section>

      <section className="dash-two-col settings-grid">
        <article className="card section">
          <h2>Anti-abuse controls</h2>
          <p className="muted">Tune dedupe and rate-limit policy.</p>

          <form className="settings-form" onSubmit={onAntiAbuseSave}>
            <Input
              label="Dedupe window (hours)"
              type="number"
              min={1}
              value={dedupeHours}
              onChange={(e) => setDedupeHours(e.target.value)}
            />

            <div className="settings-inline-grid">
              <Input
                label="Start rate limit / minute"
                type="number"
                min={1}
                value={startRatePerMinute}
                onChange={(e) => setStartRatePerMinute(e.target.value)}
              />
              <Input
                label="Step-complete rate limit / minute"
                type="number"
                min={1}
                value={stepRatePerMinute}
                onChange={(e) => setStepRatePerMinute(e.target.value)}
              />
            </div>

            <Input
              label="Auth rate limit / minute"
              type="number"
              min={1}
              value={authRatePerMinute}
              onChange={(e) => setAuthRatePerMinute(e.target.value)}
            />

            <div className="settings-actions">
              <Button type="submit">Save anti-abuse rules</Button>
            </div>
          </form>
        </article>

        <article className="card section">
          <h2>Monetization controls</h2>
          <p className="muted">Payout and ad-template rotation settings.</p>

          <form className="settings-form" onSubmit={onMonetizationSave}>
            <Input
              label="Payout threshold (USD)"
              type="number"
              min={1}
              value={payoutThresholdUsd}
              onChange={(e) => setPayoutThresholdUsd(e.target.value)}
            />

            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={rotationEnabled}
                onChange={(e) => setRotationEnabled(e.target.checked)}
              />
              <span>Ad template rotation enabled (Monetag/Adsterra)</span>
            </label>

            <div className="settings-inline-grid">
              <Select label="Primary ad network" value={primaryAdNetwork} onChange={(e) => setPrimaryAdNetwork(e.target.value)}>
                <option value="monetag">Monetag</option>
                <option value="adsterra">Adsterra</option>
              </Select>

              <Select
                label="Secondary ad network"
                value={secondaryAdNetwork}
                onChange={(e) => setSecondaryAdNetwork(e.target.value)}
              >
                <option value="adsterra">Adsterra</option>
                <option value="monetag">Monetag</option>
              </Select>
            </div>

            <h3 className="section-subhead">RPM assumptions (estimated revenue)</h3>
            <p className="muted">
              Based on configured RPM rates; actual ad network payout may differ.
            </p>

            <div className="settings-inline-grid">
              <Input
                label="Global mobile RPM (USD)"
                type="number"
                min={0}
                step="0.01"
                value={globalMobileRpm}
                onChange={(e) => setGlobalMobileRpm(e.target.value)}
              />
              <Input
                label="Global desktop RPM (USD)"
                type="number"
                min={0}
                step="0.01"
                value={globalDesktopRpm}
                onChange={(e) => setGlobalDesktopRpm(e.target.value)}
              />
            </div>

            <div className="settings-inline-grid">
              <Input
                label="LK mobile RPM (USD)"
                type="number"
                min={0}
                step="0.01"
                value={lkMobileRpm}
                onChange={(e) => setLkMobileRpm(e.target.value)}
              />
              <Input
                label="IN mobile RPM (USD)"
                type="number"
                min={0}
                step="0.01"
                value={inMobileRpm}
                onChange={(e) => setInMobileRpm(e.target.value)}
              />
            </div>

            <p className="muted">Geo/device RPM matrix editor can be expanded later from these base assumptions.</p>

            <div className="settings-actions">
              <Button type="submit">Save monetization settings</Button>
            </div>
          </form>
        </article>
      </section>

      <section className="card section">
        <h2>Developers API</h2>
        <p className="muted">Use this endpoint for GPLinks-style programmatic short-link creation.</p>

        <div className="settings-form">
          <div>
            <p className="muted">Base endpoint</p>
            <div className="settings-copy-row">
              <code className="settings-code">{developersApiBase}</code>
              <CopyButton value={developersApiBase} label="Copy endpoint" />
            </div>
          </div>

          <div>
            <p className="muted">Admin API tokens (masked)</p>
            <div className="settings-form">
              {(maskedDevelopersApiTokens.length ? maskedDevelopersApiTokens : [maskedDevelopersApiToken]).map((token, idx) => (
                <code key={`${token}-${idx}`} className="settings-code">{token}</code>
              ))}
            </div>
            <p className="muted">Default view is masked only. New token is shown once immediately after rotation.</p>

            <div className="settings-actions">
              <Button type="button" onClick={onRegenerateDeveloperToken} disabled={rotatingToken}>
                {rotatingToken ? "Regenerating..." : "Regenerate token"}
              </Button>
              <Button type="button" variant="secondary" onClick={onFinalizeDeveloperTokenRotation} disabled={finalizingToken}>
                {finalizingToken ? "Finalizing..." : "Finalize rotation (remove old tokens)"}
              </Button>
            </div>

            {latestGeneratedToken ? (
              <div className="settings-copy-row">
                <code className="settings-code">{latestGeneratedToken}</code>
                <CopyButton value={latestGeneratedToken} label="Copy new token" />
              </div>
            ) : null}
          </div>

          <div>
            <p className="muted">JSON example</p>
            <div className="settings-copy-row">
              <code className="settings-code">{sampleJsonRequest}</code>
              <CopyButton value={sampleJsonRequest} label="Copy JSON request" />
            </div>
          </div>

          <div>
            <p className="muted">TEXT example</p>
            <div className="settings-copy-row">
              <code className="settings-code">{sampleTextRequest}</code>
              <CopyButton value={sampleTextRequest} label="Copy TEXT request" />
            </div>
          </div>
        </div>
      </section>

      <section className="card section">
        <h2>Security events (latest 50)</h2>
        <p className="muted">Use this to investigate suspicious login/setup/API activity quickly.</p>

        {loadingSecurityEvents ? (
          <p className="muted">Loading security events…</p>
        ) : securityEvents.length === 0 ? (
          <p className="muted">No security events yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="tier-table dash-responsive-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>IP</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {securityEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{formatEventTime(event.created_at)}</td>
                    <td>{event.event_type}</td>
                    <td>{event.ip_address || "—"}</td>
                    <td>{eventDetailsText(event.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
