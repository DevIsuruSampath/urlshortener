import { env } from "./env";

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  ok: boolean;
};

export type AdminDeveloperTokenInfo = {
  masked_token: string;
  masked_tokens: string[];
};

export type AdminDeveloperTokenRegenerateResponse = {
  ok: boolean;
  new_token: string;
  masked_tokens: string[];
};

export type AdminDeveloperTokenFinalizeResponse = {
  ok: boolean;
  masked_tokens: string[];
};

export type AdminStatusResponse = {
  initialized: boolean;
};

export type AdminSetupPayload = {
  email: string;
  password: string;
  confirm_password: string;
  setup_token?: string;
};

export type AdminSetupResponse = {
  initialized: boolean;
  recovery_codes: string[];
};

export type AdminLinkCreatePayload = {
  destination_url: string;
  tier?: string;
  created_via?: string;
};

export type AdminLinkResponse = {
  id: string;
  code: string;
  short_url: string;
  destination_url: string;
  tier: string;
  web_steps: number;
  app_steps: number;
  is_active: boolean;
  created_via?: string;
  created_at?: string;
  total_clicks?: number;
  valid_clicks?: number;
  invalid_clicks?: number;
  conversion_rate?: number;
};

export type SecurityEventType =
  | "admin_setup_completed"
  | "admin_login_success"
  | "admin_login_failed"
  | "admin_password_reset_cli"
  | "developer_api_token_used"
  | "link_blocked"
  | "link_unblocked"
  | "settings_changed";

export type AdminSecurityEvent = {
  id: string;
  event_type: SecurityEventType | string;
  actor_user_id?: string | null;
  ip_address?: string | null;
  details?: Record<string, unknown>;
  created_at: string;
};

export type AdminSecurityEventCreatePayload = {
  event_type: "settings_changed" | "link_blocked" | "link_unblocked";
  details?: Record<string, unknown>;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(contentType = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = "application/json";
  return headers;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    let msg = data?.detail || data?.message || "Request failed";

    if (typeof msg !== "string") {
      // Handle FastAPI validation errors (array of objects)
      if (Array.isArray(msg) && msg.length > 0 && msg[0].msg) {
        msg = msg[0].msg;
      } else {
        msg = JSON.stringify(msg);
      }
    }

    return new ApiError(res.status, msg);
  } catch {
    try {
      const text = (await res.text()).trim();
      return new ApiError(res.status, text || `Request failed (${res.status})`);
    } catch {
      return new ApiError(res.status, `Request failed (${res.status})`);
    }
  }
}

async function fetchAdminLinks(init: RequestInit): Promise<Response> {
  return await fetch(ADMIN_LINKS_BASE, init);
}

const ADMIN_AUTH_BASE = `${env.apiBase}/admin/auth`;
const ADMIN_LINKS_BASE = `${env.apiBase}/admin/links`;
const ADMIN_SETTINGS_BASE = `${env.apiBase}/admin/settings`;

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/login`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLoginResponse;
}

export async function adminMe(): Promise<{ email: string; user_id: string }> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/me`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { email: string; user_id: string };
}

export async function adminStatus(): Promise<AdminStatusResponse> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/status`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminStatusResponse;
}

export async function adminSetup(payload: AdminSetupPayload): Promise<AdminSetupResponse> {
  const headers = authHeaders(true) as Record<string, string>;
  if (payload.setup_token) {
    headers["x-admin-setup-token"] = payload.setup_token;
  }

  const res = await fetch(`${ADMIN_AUTH_BASE}/setup`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirm_password,
    }),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminSetupResponse;
}

export async function adminLogout(): Promise<void> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/logout`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }
}

export async function adminDeveloperTokenInfo(): Promise<AdminDeveloperTokenInfo> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/developer-token`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminDeveloperTokenInfo;
}

export async function adminRegenerateDeveloperToken(): Promise<AdminDeveloperTokenRegenerateResponse> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/developer-token/regenerate`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminDeveloperTokenRegenerateResponse;
}

export async function adminFinalizeDeveloperTokenRotation(): Promise<AdminDeveloperTokenFinalizeResponse> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/developer-token/finalize`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminDeveloperTokenFinalizeResponse;
}

export async function adminCreateLink(payload: AdminLinkCreatePayload): Promise<AdminLinkResponse> {
  const res = await fetchAdminLinks({
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({ destination_url: payload.destination_url, tier: payload.tier || "standard" }),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLinkResponse;
}

export async function adminListLinks(): Promise<AdminLinkResponse[]> {
  try {
    const res = await fetchAdminLinks({
      method: "GET",
      headers: authHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      throw await parseError(res);
    }

    return (await res.json()) as AdminLinkResponse[];
  } catch (error) {
    console.error("Failed to fetch admin links:", error);
    console.error("ADMIN_LINKS_BASE:", ADMIN_LINKS_BASE);
    console.error("env.apiBase:", env.apiBase);
    throw error;
  }
}

export async function adminListSecurityEvents(limit = 50): Promise<AdminSecurityEvent[]> {
  const res = await fetch(`${env.apiBase}/admin/security-events?limit=${encodeURIComponent(String(limit))}`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminSecurityEvent[];
}

export async function adminRecordSecurityEvent(payload: AdminSecurityEventCreatePayload): Promise<AdminSecurityEvent> {
  const res = await fetch(`${env.apiBase}/admin/security-events`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminSecurityEvent;
}

// ── Link CRUD ────────────────────────────────────────────────────────────

export type AdminLinkEditPayload = {
  destination_url?: string;
  tier?: string;
  web_steps?: number;
  app_steps?: number;
};

export async function adminEditLink(linkId: string, payload: AdminLinkEditPayload): Promise<AdminLinkResponse> {
  const res = await fetch(`${ADMIN_LINKS_BASE}/${linkId}`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLinkResponse;
}

export async function adminDeleteLink(linkId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${ADMIN_LINKS_BASE}/${linkId}`, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { ok: boolean };
}

export async function adminToggleLink(linkId: string): Promise<AdminLinkResponse> {
  const res = await fetch(`${ADMIN_LINKS_BASE}/${linkId}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLinkResponse;
}

export async function adminBlockLink(linkId: string, block: boolean): Promise<AdminLinkResponse> {
  const res = await fetch(`${ADMIN_LINKS_BASE}/${linkId}/block`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify({ block }),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLinkResponse;
}

// ── Change Password ──────────────────────────────────────────────────────

export type AdminChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export async function adminChangePassword(payload: AdminChangePasswordPayload): Promise<{ ok: boolean }> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/change-password`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { ok: boolean };
}

// ── Settings ─────────────────────────────────────────────────────────────

export type FlowSettings = {
  default_web_steps: string;
  default_app_steps: string;
  first_step_min_seconds: string;
  next_step_min_seconds: string;
  captcha_mode: string;
};

export async function adminGetFlowSettings(): Promise<FlowSettings> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/flow`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as FlowSettings;
}

export async function adminPutFlowSettings(payload: FlowSettings): Promise<{ ok: boolean }> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/flow`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { ok: boolean };
}

export type AntiAbuseSettings = {
  dedupe_hours: string;
  start_rate_limit_per_minute: string;
  step_rate_limit_per_minute: string;
  auth_rate_limit_per_minute: string;
};

export async function adminGetAntiAbuseSettings(): Promise<AntiAbuseSettings> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/anti-abuse`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AntiAbuseSettings;
}

export async function adminPutAntiAbuseSettings(payload: AntiAbuseSettings): Promise<{ ok: boolean }> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/anti-abuse`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { ok: boolean };
}

export type MonetizationSettings = {
  payout_threshold_usd: string;
  rotation_enabled: string;
  primary_ad_network: string;
  secondary_ad_network: string;
  global_mobile_rpm: string;
  global_desktop_rpm: string;
  lk_mobile_rpm: string;
  in_mobile_rpm: string;
};

export async function adminGetMonetizationSettings(): Promise<MonetizationSettings> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/monetization`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as MonetizationSettings;
}

export async function adminPutMonetizationSettings(payload: MonetizationSettings): Promise<{ ok: boolean }> {
  const res = await fetch(`${ADMIN_SETTINGS_BASE}/monetization`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { ok: boolean };
}
