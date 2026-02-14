import { env } from "./env";

export type StepCompleteRequest = {
  session_id: string;
  step: number;
  token: string;
  captcha_token?: string;
};

export type StepCompleteResponse = {
  done: boolean;
  next_step?: number;
  next_step_url?: string;
  redirect_url?: string;
  requires_captcha?: boolean;
  message?: string;
};

export type AdminLoginPayload = {
  username: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type AdminDeveloperTokenInfo = {
  masked_token: string;
};

export type AdminLinkCreatePayload = {
  destination_url: string;
  tier?: string;
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
  created_at?: string;
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

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("paidlink_access_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    return new ApiError(res.status, data?.detail || data?.message || "Request failed");
  } catch {
    return new ApiError(res.status, `Request failed (${res.status})`);
  }
}

async function fetchAdminLinksWithFallback(init: RequestInit): Promise<Response> {
  try {
    return await fetch(ADMIN_LINKS_BASE, init);
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    return await fetch(ADMIN_LINKS_PROXY_BASE, init);
  }
}

export async function postStepComplete(payload: StepCompleteRequest): Promise<StepCompleteResponse> {
  const res = await fetch(`${env.apiBase}/flow/step-complete`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as StepCompleteResponse;
}

const ADMIN_AUTH_BASE = `${env.apiBase}/admin/auth`;
const ADMIN_LINKS_BASE = `${env.apiBase}/admin/links`;
const ADMIN_LINKS_PROXY_BASE = `/api/admin/links`;

export async function adminLogin(payload: AdminLoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/login`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AuthResponse;
}

export async function adminMe(): Promise<{ username: string; user_id: string }> {
  const res = await fetch(`${ADMIN_AUTH_BASE}/me`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as { username: string; user_id: string };
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

export async function adminCreateLink(payload: AdminLinkCreatePayload): Promise<AdminLinkResponse> {
  const res = await fetchAdminLinksWithFallback({
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
  const res = await fetchAdminLinksWithFallback({
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AdminLinkResponse[];
}
