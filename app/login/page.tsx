'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Login failed');
      }
      const next = new URLSearchParams(window.location.search).get('next') || '/admin';
      window.location.href = next;
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed');
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold tracking-tight">
          Palash<span className="text-accent"> Telecom</span> Admin
        </h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-hairline bg-surface p-6">
          {err && <p className="rounded-lg border border-hairline bg-soft px-3 py-2 text-sm text-danger">{err}</p>}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Email</label>
            <input name="email" type="email" required defaultValue="admin@palashtelecom.com"
              className="w-full rounded-xl border border-hairline bg-bg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <input name="password" type="password" required placeholder="palash-admin (demo)"
              className="w-full rounded-xl border border-hairline bg-bg px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
          <button disabled={busy}
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-xs text-muted">Demo: admin@palashtelecom.com / palash-admin</p>
        </form>
      </div>
    </main>
  );
}
