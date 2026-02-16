import { NextRequest, NextResponse } from "next/server";

const RESERVED = new Set([
  "",
  "api",
  "health",
  "login",
  "admin",
  "step",
  "verify",
  "pricing",
  "faq",
  "terms",
  "privacy",
  "cookie",
  "support",
  "contact",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE || process.env.PUBLIC_API_BASE_URL;
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const isDockerWeb = process.env.HOSTNAME === "web" || process.env.DOCKER_ENV === "1";
    if (isDockerWeb && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      url.hostname = "api";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return raw.replace(/\/$/, "");
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;

  if (!code || RESERVED.has(code) || code.includes(".")) {
    return new Response("Not Found", { status: 404 });
  }

  const apiBase = getApiBase();
  if (!apiBase) {
    return new Response("API base URL is not configured", { status: 500 });
  }

  const target = `${apiBase}/${encodeURIComponent(code)}`;
  const headers: Record<string, string> = {
    "user-agent": req.headers.get("user-agent") || "",
    "x-forwarded-proto": req.headers.get("x-forwarded-proto") || "https",
  };

  const fwdFor = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  if (fwdFor) headers["x-forwarded-for"] = fwdFor;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: "GET",
      redirect: "manual",
      headers,
      cache: "no-store",
    });
  } catch {
    return new Response("Bad Gateway", { status: 502 });
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      return NextResponse.redirect(location, upstream.status);
    }
  }

  if (upstream.status === 404) return new Response("Not Found", { status: 404 });
  if (upstream.status === 429) return new Response("Too Many Requests", { status: 429 });
  if (upstream.status === 400 || upstream.status === 401 || upstream.status === 409) {
    return new Response("Link expired, restart.", { status: 410 });
  }

  return new Response("Bad Gateway", { status: 502 });
}
