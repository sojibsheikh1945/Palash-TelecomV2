import Link from 'next/link';
import { listProducts, getDeals } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [all, deals] = await Promise.all([listProducts(), getDeals()]);
  const phones = all.filter((p) => p.batteryHealth != null).length;
  const stats = [
    { label: 'Listable products', value: all.length },
    { label: 'Phones', value: phones },
    { label: 'On discount', value: deals.length },
  ];

  return (
    <main className="mx-auto max-w-content p-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-hairline bg-surface p-5">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <Link
        href="/admin/products/new"
        prefetch={false}
        className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
      >
        + Add pre-owned product
      </Link>
    </main>
  );
}
