import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'civicos-fallback-secret-key-32-chars-long';
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = 'civicos_token';

// Map of route prefixes to allowed roles
const ROLE_PERMISSIONS = {
  '/citizen': ['citizen'],
  '/officer': ['officer', 'admin'],
  '/admin': ['admin'],
};

const AUTH_PAGES = ['/login', '/register'];

function getDashboardRoute(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'officer':
      return '/officer';
    case 'citizen':
    default:
      return '/citizen';
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let verifiedUser = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, ENCODED_KEY);
      verifiedUser = payload;
    } catch (err) {
      // Token is invalid, expired, or tampered with
      verifiedUser = null;
    }
  }

  // 1. Redirect already logged-in users away from /login and /register to their dashboard
  if (AUTH_PAGES.some((path) => pathname.startsWith(path))) {
    if (verifiedUser) {
      const dashboard = getDashboardRoute(verifiedUser.role);
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.next();
  }

  // 2. Check Role-Based Access Control for Protected Application Routes
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
    if (pathname.startsWith(routePrefix)) {
      // Unauthenticated -> redirect to login
      if (!verifiedUser) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Authenticated but unauthorized role -> redirect to access-denied
      if (!allowedRoles.includes(verifiedUser.role)) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/citizen/:path*',
    '/officer/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
