import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define your domains here (or load from env)
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.example.com';
const ADS_DOMAIN = process.env.NEXT_PUBLIC_ADS_DOMAIN || 'adsexample.com';

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
    // Allow /step/* (ScrollWall pages), /verify (verification), and assets
    if (
      pathname.startsWith('/step') ||
      pathname.startsWith('/verify') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return NextResponse.next();
    }
    // Root → redirect to main site
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
    }
    // Block everything else
    return NextResponse.redirect(new URL('/', `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`));
  }

  // 3. Main domain — block /step and /verify (only accessible via ads domain)
  if (hostname !== ADMIN_DOMAIN && hostname !== ADS_DOMAIN) {
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
