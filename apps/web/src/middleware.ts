import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domains - You can adjust these or load from env
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'example.com';
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.example.com';
const ADS_DOMAIN = process.env.NEXT_PUBLIC_ADS_DOMAIN || 'adsexample.com';
const SHORT_DOMAIN = process.env.NEXT_PUBLIC_SHORT_DOMAIN || 'exa.com';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // 1. Example Domain (example.com) - MAIN SITE
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    // Block admin/ads routes on main domain
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(pathname, `http://${ADMIN_DOMAIN}`));
    }
    if (pathname.startsWith('/step') || pathname.startsWith('/verify')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow Landing, Login, Register, Public pages
    return NextResponse.next();
  }

  // 2. Admin Domain (admin.example.com) - DASHBOARD
  if (hostname === ADMIN_DOMAIN) {
    // Redirect root to /admin (Overview)
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Allow everything else
    return NextResponse.next();
  }

  // 3. Ads Domain (adsexample.com) - AD FLOW
  if (hostname === ADS_DOMAIN) {
    // Allow /step/* and assets
    if (
      pathname.startsWith('/step') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return NextResponse.next();
    }
    // Redirect everything else to Main Site
    return NextResponse.redirect(new URL('/', `http://${APP_DOMAIN}`));
  }

  // 4. Short Domain (exa.com) - SHORT LINKS & VERIFY
  if (hostname === SHORT_DOMAIN) {
    // Allow /verify (Nginx proxies this to Web)
    if (pathname.startsWith('/verify')) {
      return NextResponse.next();
    }
    // /{code} is handled by Nginx -> API, so middleware won't see it if config is correct.
    // If it DOES reach here (e.g. root), redirect to Main Site
    return NextResponse.redirect(new URL('/', `http://${APP_DOMAIN}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
