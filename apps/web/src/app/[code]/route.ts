import { NextRequest, NextResponse } from "next/server";

const RESERVED = new Set([
  "",
  "api",
  "health",
  "l",
  "login",
  "register",
  "forgot-password",
  "verify-email",
  "pricing",
  "faq",
  "terms",
  "privacy",
  "cookie",
  "support",
  "contact",
  "dashboard",
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
    // Smart local fallback for docker-compose split services:
    // browser uses localhost, server-side in web container should talk to api service.
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
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

  const upstream = await fetch(target, {
    method: "GET",
    redirect: "manual",
    headers: {
      "user-agent": req.headers.get("user-agent") || "",
      "x-forwarded-for": req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
      "x-forwarded-proto": req.headers.get("x-forwarded-proto") || "https",
      host: req.headers.get("host") || "",
    },
    cache: "no-store",
  });

  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      return NextResponse.redirect(location, upstream.status);
    }
  }

  if (upstream.status === 404) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response("Bad Gateway", { status: 502 });
}
