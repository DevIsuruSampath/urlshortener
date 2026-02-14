"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";

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

  function onPasswordChange(e: FormEvent<HTMLFormElement>) {
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
  }

  function onFlowDefaultsSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Flow defaults updated.", "success");
  }

  function onAntiAbuseSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Anti-abuse rules updated.", "success");
  }

  function onMonetizationSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("Monetization settings updated.", "success");
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
    </main>
  );
}
