"use client";

import { useState, useEffect } from "react";
import { adminMe, adminChangePassword, adminDeveloperTokenInfo, adminRegenerateDeveloperToken, adminFinalizeDeveloperTokenRotation, ApiError } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string; user_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Token management
  const [regeneratingToken, setRegeneratingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userData, tokenData] = await Promise.all([
        adminMe(),
        adminDeveloperTokenInfo()
      ]);
      setUser(userData);
      setTokenInfo(tokenData);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await adminChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordError(error.message);
      } else {
        setPasswordError("Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleRegenerateToken() {
    if (!confirm("Are you sure you want to regenerate your API token? Existing integrations will stop working until you update them with the new token.")) {
      return;
    }

    setRegeneratingToken(true);
    try {
      const result = await adminRegenerateDeveloperToken();
      setNewToken(result.new_token);
      setTokenInfo({
        ...tokenInfo,
        masked_tokens: result.masked_tokens
      });
      setShowToken(true);
    } catch (error) {
      console.error("Failed to regenerate token:", error);
      alert("Failed to regenerate token");
    } finally {
      setRegeneratingToken(false);
    }
  }

  async function handleFinalizeToken() {
    try {
      const result = await adminFinalizeDeveloperTokenRotation();
      setTokenInfo({
        ...tokenInfo,
        masked_tokens: result.masked_tokens
      });
      setNewToken(null);
      setShowToken(false);
      alert("Token rotation finalized. Old token is now invalid.");
    } catch (error) {
      console.error("Failed to finalize token:", error);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  if (loading) {
    return (
      <main className="dash-page">
        <header className="dash-page-head">
          <h1>Profile</h1>
          <p className="muted">Manage your account settings</p>
        </header>
        <div className="card">
          <p className="muted">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dash-page">
      <header className="dash-page-head">
        <h1>Profile</h1>
        <p className="muted">Manage your account settings</p>
      </header>

      <div className="profile-sections">
        {/* My Account Section */}
        <section className="card section">
          <h2>My Account</h2>
          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value mono">{user?.user_id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">Administrator</span>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="card section">
          <h2>Security</h2>
          <p className="muted">Change your password</p>
          
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={changingPassword}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={changingPassword}
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={changingPassword}
                minLength={8}
              />
            </div>
            
            {passwordError && (
              <div className="form-error">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="form-success">
                {passwordSuccess}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={changingPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* Developer Section */}
        <section className="card section">
          <h2>Developer</h2>
          <p className="muted">Manage your API access token</p>
          
          <div className="token-section">
            <div className="token-info">
              <p className="muted">Current token:</p>
              <code className="token-display">
                {tokenInfo?.masked_token || "not-configured"}
              </code>
              
              <div className="token-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleRegenerateToken}
                  disabled={regeneratingToken}
                >
                  {regeneratingToken ? "Regenerating..." : "Regenerate Token"}
                </button>
                
                {newToken && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => copyToClipboard(newToken)}
                  >
                    Copy New Token
                  </button>
                )}
              </div>
              
              {newToken && showToken && (
                <div className="new-token-warning">
                  <p><strong>⚠️ Save this token now!</strong></p>
                  <p>It will only be shown once. Copy it to a secure location.</p>
                  <code className="new-token">
                    {newToken}
                  </code>
                  <button
                    className="btn btn-sm"
                    onClick={handleFinalizeToken}
                  >
                    Finalize Token Rotation
                  </button>
                </div>
              )}
              
              <div className="token-help muted">
                <p>Use this token to authenticate API requests. Keep it secret!</p>
                <p>Regenerating will invalidate the old token after you finalize the rotation.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}