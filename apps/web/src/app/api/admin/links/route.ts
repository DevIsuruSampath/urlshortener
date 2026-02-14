import { NextRequest } from "next/server";

function resolveApiBase() {
  const fromPublic = process.env.NEXT_PUBLIC_API_BASE;
  const fromServer = process.env.PUBLIC_API_BASE_URL;
  const fallback = "http://api:8000";
  return (fromPublic || fromServer || fallback).replace(/\/$/, "");
}

async function proxyToApi(request: NextRequest) {
  const apiBase = resolveApiBase();
  const url = `${apiBase}/admin/links`;

  const headers: HeadersInit = {
    "content-type": "application/json",
  };

  const auth = request.headers.get("authorization");
  if (auth) headers.authorization = auth;

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method === "POST") {
    init.body = await request.text();
  }

  const upstream = await fetch(url, init);
  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyToApi(request);
}

export async function POST(request: NextRequest) {
  return proxyToApi(request);
}
