import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Always allow access to public pages
    const publicPages = ['/', '/auth/signin', '/auth/signup', '/about', '/terms', '/privacy'];
    const isPublicPage = publicPages.includes(req.nextUrl.pathname);
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
    
    if (isPublicPage) {
      return NextResponse.next();
    }

    // Allow access to auth pages when not authenticated
    if (isAuthPage && !req.nextauth.token) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to signin for protected routes
    if (!req.nextauth.token && !isPublicPage && !isAuthPage) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user account is active (only if we have user data and isActive is explicitly false)
    if (req.nextauth.token && req.nextauth.token.isActive === false) {
      const errorUrl = new URL('/auth/signin?error=account-suspended', req.url);
      return NextResponse.redirect(errorUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to public pages and auth pages
        const publicPages = ['/', '/auth/signin', '/auth/signup', '/about', '/terms', '/privacy'];
        const isPublicPage = publicPages.includes(req.nextUrl.pathname);
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');

        // Always allow public pages and auth pages
        if (isPublicPage || isAuthPage) {
          return true;
        }

        // For protected pages, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all pages except public assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
