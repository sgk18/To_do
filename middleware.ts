import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.includes(path);

  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicPath && token && path !== '/') {
      // Redirect logged-in users away from auth pages, but let them visit home if they want (or redirect to dashboard)
      // Usually better to redirect to dashboard if they try to access login/register
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
