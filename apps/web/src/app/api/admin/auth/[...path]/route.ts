import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["login", "logout", "me"]);

function getApiBase() {
  const raw = process.env.PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE;
  if (!raw) return null;
  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    return raw.replace(/\/$/, "");
  }
}

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const apiBase = getApiBase();
  if (!apiBase) {
    return NextResponse.json({ detail: "API base URL is not configured" }, { status: 500 });
  }

  const { path } = await context.params;
  const segments = (path || []).filter(Boolean);
  if (segments.length !== 1 || !ALLOWED.has(segments[0])) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const target = `${apiBase}/admin/auth/${segments[0]}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);
  const text = await upstream.text();

  const res = new NextResponse(text, { status: upstream.status });

  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) res.headers.set("content-type", upstreamType);

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(req, context);
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(req, context);
}
