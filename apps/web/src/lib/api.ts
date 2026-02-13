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

export async function postStepComplete(payload: StepCompleteRequest): Promise<StepCompleteResponse> {
  const res = await fetch(`${env.apiBase}/flow/step-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "step-complete failed");
  }
  return data as StepCompleteResponse;
}
