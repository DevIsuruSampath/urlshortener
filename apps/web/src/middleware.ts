import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domains - adjust these or load from env
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.localhost:3000';
const ADS_DOMAIN = process.env.NEXT_PUBLIC_ADS_DOMAIN || 'ads.localhost:3000';
const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || 'short.localhost:3000';

// Internal API for rewriting
const INTERNAL_API_HOST = process.env.INTERNAL_API_HOST || 'http://api:8000';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const { pathname, search } = url;

  // 1. Example Domain (example.com) - MAIN SITE
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    if (pathname.startsWith('/admin')) {
      // Redirect /admin/* to admin.example.com/* (stripping /admin prefix)
      // e.g. /admin/links -> admin.example.com/links
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
    // Allow Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }

    // Handle legacy /admin paths -> Redirect to clean paths
    // e.g. /admin/links -> /links
    if (pathname.startsWith('/admin')) {
       const cleanPath = pathname.replace(/^\/admin/, '') || '/';
       return NextResponse.redirect(new URL(cleanPath, request.url));
    }

    // Rewrite clean paths to internal file structure (/admin/*)
    // / -> /admin/page.tsx (Overview)
    // /links -> /admin/links/page.tsx
    // /settings -> /admin/settings/page.tsx
    
    // Check if path is root
    if (pathname === '/') {
        return NextResponse.rewrite(new URL('/admin', request.url));
    }
    
    // Otherwise rewrite to /admin + pathname
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
    return NextResponse.rewrite(apiUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
