import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes completely
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get the JWT token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Define public pages that don't require authentication
  const publicPages = ['/', '/auth/signin', '/auth/signup', '/about', '/terms', '/privacy'];
  const isPublicPage = publicPages.includes(request.nextUrl.pathname);
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');

  // Always allow access to public pages
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Allow access to auth pages when not authenticated
  if (isAuthPage && !token) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to signin for protected routes
  if (!token && !isPublicPage && !isAuthPage) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user account is active (only if we have user data and isActive is explicitly false)
  if (token && token.isActive === false) {
    const errorUrl = new URL('/auth/signin?error=account-suspended', request.url);
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pages except API routes, public assets and static files
    '/((?!api/|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
