import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simplified middleware.
  // In a real app with server-side auth, you would inspect a session cookie here.
  // For now, it provides a basic structure for path-based redirects.

  const pathname = request.nextUrl.pathname;

  // Basic example: if someone tries to go to a non-existent /chef path,
  // we redirect them to the dashboard.
  if (pathname.startsWith('/chef/') && !pathname.startsWith('/chef-profile-setup')) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
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
};
