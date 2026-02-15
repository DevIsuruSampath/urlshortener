import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define your domains here (or load from env)
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.example.com';
const ADS_DOMAIN = process.env.NEXT_PUBLIC_ADS_DOMAIN || 'adsexample.com';
const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || 'exa.com';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // 1. Handle Admin Domain
  if (hostname === ADMIN_DOMAIN) {
    // If accessing root on admin domain, redirect to /admin/stats
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/stats', request.url));
    }
    // Allow /admin routes and login
    return NextResponse.next();
  }

  // 2. Handle Ads/Interstitial Domain
  if (hostname === ADS_DOMAIN) {
    // Allow /l (interstitial) and static assets
    if (pathname.startsWith('/l') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }
    // Block everything else or redirect to main site
    return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
  }

  // 3. Handle Short Link Domain (if it hits Next.js)
  if (hostname === SHORT_DOMAIN) {
    // Rewrite /{code} to API redirect logic or handle locally
    // For now, let it pass to /[code] route
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
