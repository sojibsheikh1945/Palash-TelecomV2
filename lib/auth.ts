// =============================================================================
//  lib/auth.ts  —  JWT session helpers (edge-safe via `jose`).
//  Tokens are signed HS256 and carried in an httpOnly + Secure + SameSite=Strict
//  cookie (immune to XSS token theft). Verified server-side in middleware.ts.
// =============================================================================
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const SESSION_COOKIE = 'pt_session';
export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export interface SessionClaims extends JWTPayload { sub: string; email: string; role: Role; }

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    // Never silently use a weak secret in production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET missing or too short (need >= 32 chars).');
    }
    return new TextEncoder().encode('dev-only-insecure-secret-do-not-use-in-prod!!');
  }
  return new TextEncoder().encode(s);
}

export async function signSession(claims: { sub: string; email: string; role: Role }): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // short-lived access token
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as SessionClaims;
  } catch {
    return null;
  }
}

export function isAdmin(claims: SessionClaims | null): boolean {
  return claims?.role === 'ADMIN' || claims?.role === 'SUPER_ADMIN';
}
