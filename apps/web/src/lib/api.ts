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

export type AuthPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    return new ApiError(res.status, data?.detail || "Request failed");
  } catch {
    return new ApiError(res.status, `Request failed (${res.status})`);
  }
}

export async function postStepComplete(payload: StepCompleteRequest): Promise<StepCompleteResponse> {
  const res = await fetch(`${env.apiBase}/flow/step-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as StepCompleteResponse;
}

export async function register(payload: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${env.apiBase}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AuthResponse;
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${env.apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as AuthResponse;
}
