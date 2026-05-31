// =============================================================================
//  middleware.ts  —  server-side RBAC. Runs on the Edge BEFORE any /admin page
//  renders. Hiding buttons is never the security boundary (ARCHITECTURE.md §3).
// =============================================================================
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession, isAdmin } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  // Dev-only escape hatch so the demo admin is reachable without a login flow.
  // MUST be unset in production (guarded by NODE_ENV regardless).
  const devBypass =
    process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === '1';
  if (devBypass) return NextResponse.next();

  const claims = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!isAdmin(claims)) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Protect the admin panel (and its API). Public pages never hit this.
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
