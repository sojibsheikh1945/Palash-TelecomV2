// =============================================================================
//  components/Navbar.tsx  —  Server Component (ships ZERO JavaScript)
//  Glassmorphism via backdrop-blur. Mobile menu uses the native <details>
//  element instead of a JS state toggle — no client bundle, works on 2G.
// =============================================================================
import Link from 'next/link';

const NAV = [
  { href: '/phones',      label: 'Phones' },
  { href: '/accessories', label: 'Accessories' },
  { href: '/deals',       label: 'Deals' },
  { href: '/contact',     label: 'Contact' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/70 backdrop-blur-md dark:bg-black/70">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* prefetch={false}: never pre-download routes on metered 2G/3G data */}
        <Link href="/" prefetch={false} className="text-lg font-semibold tracking-tight">
          Palash<span className="text-[var(--accent)]"> Telecom</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 text-sm font-medium text-[var(--text-muted)] sm:flex">
          {NAV.map((i) => (
            <li key={i.href}>
              <Link href={i.href} prefetch={false} className="transition-colors hover:text-[var(--text)]">
                {i.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu — native <details>, no JavaScript */}
        <details className="relative sm:hidden">
          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--border)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Menu">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </summary>
          <ul className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} prefetch={false} className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--bg-soft)]">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
