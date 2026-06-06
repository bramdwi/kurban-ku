import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production!');
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kurbanku-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'kurbanku-auth-token';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/animals',
  '/animal-types',
  '/buyers',
  '/transactions',
  '/deliveries',
  '/reports',
  '/users',
  '/notifications',
  '/settings',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Verify token
  let user = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch (e) {
      // Token is invalid/expired
    }
  }

  // Check if accessing a protected route
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isProtected) {
    if (!user) {
      // Redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control checking (Owner for user management and settings)
    if (pathname.startsWith('/users') || pathname.startsWith('/settings')) {
      if (user.role !== 'OWNER') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect authenticated user away from public landing/auth pages
  const isPublicAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  if (isPublicAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
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
     * - uploads (uploaded photos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
