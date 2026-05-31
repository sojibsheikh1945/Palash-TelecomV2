import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validation';
import { signSession, SESSION_COOKIE } from '@/lib/auth';

// Demo fallback so login works before you configure env: password "palash-admin".
// Replace by setting ADMIN_EMAIL + ADMIN_PASSWORD_HASH (npm run hash -- '...').
const DEMO_EMAIL = 'admin@palashtelecom.com';
const DEMO_PASSWORD = 'palash-admin';

export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const adminEmail = (process.env.ADMIN_EMAIL || DEMO_EMAIL).toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;

  let valid = false;
  if (email.toLowerCase() === adminEmail) {
    valid = hash ? await bcrypt.compare(password, hash) : password === DEMO_PASSWORD;
  } else {
    // Constant-time-ish: still run a compare to reduce email enumeration timing.
    await bcrypt.compare(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
  }
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const token = await signSession({ sub: adminEmail, email: adminEmail, role: 'SUPER_ADMIN' });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2,
    });
    return res;
  } catch (err) {
    // Most likely a missing/short JWT_SECRET in production. Fail closed + clean.
    console.error('[auth] sign session failed:', err);
    return NextResponse.json({ ok: false, error: 'Server auth not configured' }, { status: 503 });
  }
}
