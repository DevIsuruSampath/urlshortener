import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Domains
const APP_DOMAIN = process.env.APP_DOMAIN || 'localhost:3000';
const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN || 'admin.localhost:3000';
const AUTH_DOMAIN = process.env.AUTH_DOMAIN || 'auth.localhost:3000';
const ADS_DOMAIN = process.env.ADS_DOMAIN || 'ads.localhost:3000';
const SHORT_DOMAIN = process.env.SHORT_DOMAIN || 'short.localhost:3000';

// Internal API for rewriting
const INTERNAL_API_HOST = process.env.INTERNAL_API_HOST || process.env.API_BASE || 'http://api:8000';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  const { pathname, search } = url;

  // 1. Example Domain (example.com) - MAIN SITE (Maintenance)
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) {
    // Redirect /login to Auth Domain
    if (pathname === '/login') {
       return NextResponse.redirect(new URL('/', `http://${AUTH_DOMAIN}`));
    }

    if (pathname.startsWith('/admin')) {
      const newPath = pathname.replace(/^\/admin/, '') || '/';
      return NextResponse.redirect(new URL(newPath, `http://${ADMIN_DOMAIN}`));
    }
    // Block ads/verify
    if (pathname.startsWith('/step') || pathname.startsWith('/verify')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin Domain (admin.example.com) - DASHBOARD ONLY
  if (hostname === ADMIN_DOMAIN) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }

    // Redirect Login/Register to AUTH Domain
    if (pathname === '/login' || pathname === '/register') {
       return NextResponse.redirect(new URL(pathname, `http://${AUTH_DOMAIN}`));
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

  // 3. Auth Domain (auth.example.com) - AUTH PORTAL
  if (hostname === AUTH_DOMAIN) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }

    // Rewrite Root '/' to Login (Single Page Auth)
    if (pathname === '/') {
       return NextResponse.rewrite(new URL('/login', request.url));
    }

    // Allow direct access to /login if needed, but root handles it now
    if (pathname === '/login') {
       return NextResponse.next();
    }

    // Register is disabled (log-based setup)
    if (pathname === '/register') {
       return NextResponse.redirect(new URL('/', request.url));
    }

    // All other paths -> Redirect to Root (Login)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Ads Domain (adsexample.com) - AD FLOW
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

  // 5. Short Domain (exa.com) - SHORT LINKS & VERIFY
  if (hostname === SHORT_DOMAIN) {
    if (pathname.startsWith('/verify')) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico') {
      return NextResponse.next();
    }
    
    const apiUrl = new URL(`${pathname}${search}`, INTERNAL_API_HOST);
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
