import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface">
        <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Palash<span className="text-accent"> Telecom</span> · Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin/products/new" prefetch={false} className="text-muted hover:text-ink">Add product</Link>
            <Link href="/" prefetch={false} className="text-muted hover:text-ink">View store</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium hover:bg-soft">
        Sign out
      </button>
    </form>
  );
}
