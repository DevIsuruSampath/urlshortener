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
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/stats', request.url));
    }
    return NextResponse.next();
  }

  // 2. Handle Ads/Interstitial Domain
  if (hostname === ADS_DOMAIN) {
    // Allow /step/* (ScrollWall pages) and assets
    if (
      pathname.startsWith('/step') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return NextResponse.next();
    }
    // Block /verify on ads domain (moved to short domain)
    if (pathname.startsWith('/verify')) {
       return NextResponse.redirect(new URL('/verify', `https://${SHORT_DOMAIN}`));
    }
    // Root → redirect to main site
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
    }
    // Block everything else
    return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
  }

  // 3. Handle Short Domain (exa.com)
  if (hostname === SHORT_DOMAIN) {
    // Allow /verify and short codes (handled by [code]/route.ts)
    if (pathname.startsWith('/verify') || pathname.length > 1) {
      return NextResponse.next();
    }
    // Root of short domain -> redirect to main site
    return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
  }

  // 4. Main domain — block /step and /verify, redirect admin/auth to admin domain
  if (hostname !== ADMIN_DOMAIN && hostname !== ADS_DOMAIN && hostname !== SHORT_DOMAIN) {
    // Redirect /admin, /login, /register to admin domain
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL(pathname, `https://${ADMIN_DOMAIN}`));
    }
    // Block ads/verify pages on main domain
    if (pathname.startsWith('/step') || pathname.startsWith('/verify')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
