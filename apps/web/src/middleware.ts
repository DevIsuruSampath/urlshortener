import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domains - adjust these or load from env
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.localhost:3000';
const ADS_DOMAIN = process.env.NEXT_PUBLIC_ADS_DOMAIN || 'ads.localhost:3000';
const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || 'short.localhost:3000';

// Internal API for rewriting
// If running in Dokploy separately, set this to "http://api.example.com" or the internal IP/DNS
// Falls back to NEXT_PUBLIC_API_BASE if not set
const INTERNAL_API_HOST = process.env.INTERNAL_API_HOST || process.env.NEXT_PUBLIC_API_BASE || 'http://api:8000';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const { pathname, search } = url;

  // 1. Example Domain (example.com) - MAIN SITE
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    if (pathname.startsWith('/admin')) {
      const newPath = pathname.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(new URL(newPath, `http://${ADMIN_DOMAIN}`));
    }
    if (pathname.startsWith('/step') || pathname.startsWith('/verify')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin Domain (admin.example.com) - DASHBOARD
  if (hostname === ADMIN_DOMAIN) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }

    // Redirect login/register to main site (since they don't exist on admin subdomain)
    if (pathname === '/login' || pathname === '/register') {
       return NextResponse.redirect(new URL(pathname, `http://${APP_DOMAIN}`));
    }

    // Handle legacy /admin paths -> Redirect to clean paths
    if (pathname.startsWith('/admin')) {
       const cleanPath = pathname.replace(/^\/admin/, '') || '/';
       return NextResponse.redirect(new URL(cleanPath, request.url));
    }

    // Rewrite clean paths to internal file structure (/admin/*)
    if (pathname === '/') {
        return NextResponse.rewrite(new URL('/admin', request.url));
    }
    return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
  }

  // 3. Ads Domain (adsexample.com) - AD FLOW
  if (hostname === ADS_DOMAIN) {
    if (
      pathname.startsWith('/step') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static')
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', `http://${APP_DOMAIN}`));
  }

  // 4. Short Domain (exa.com) - SHORT LINKS & VERIFY
  if (hostname === SHORT_DOMAIN) {
    if (pathname.startsWith('/verify')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }
    
    // Proxy short codes to API container
    const apiUrl = new URL(`${pathname}${search}`, INTERNAL_API_HOST);

    // Forward IP headers for accurate analytics/rate-limiting
    const requestHeaders = new Headers(request.headers);
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    requestHeaders.set('x-forwarded-for', ip);
    requestHeaders.set('x-real-ip', ip);

    return NextResponse.rewrite(apiUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
