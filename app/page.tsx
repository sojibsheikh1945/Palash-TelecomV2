// =============================================================================
//  app/page.tsx  —  Homepage (Server Component)
//  Rendering: statically generated, refreshed on a schedule (ISR). HTML-first —
//  content paints on 2G without waiting for JS. The product grid streams via
//  <Suspense> so the shell shows instantly.
// =============================================================================
import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureStrip from '@/components/FeatureStrip';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ProductGrid from '@/components/ProductGrid';
import { getFeaturedProducts } from '@/lib/products';

// ISR: serve a cached static page, rebuild at most once every 5 minutes.
export const revalidate = 300;

const CATEGORIES = [
  { href: '/phones', title: 'Phones', sub: 'iPhone · Samsung · Xiaomi' },
  { href: '/accessories', title: 'Accessories', sub: 'Chargers · Cables · Earbuds' },
  { href: '/deals', title: 'Deals', sub: 'Discounted this week' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />

        <Container className="py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Latest arrivals</h2>
            <Link href="/phones" prefetch={false} className="text-sm font-medium text-accent hover:opacity-80">
              View all →
            </Link>
          </div>
          {/* Shell renders immediately; grid streams when the DB query resolves */}
          <Suspense fallback={<GridSkeleton />}>
            <FeaturedGrid />
          </Suspense>
        </Container>

        <Container className="pb-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                prefetch={false}
                className="group flex items-center justify-between rounded-2xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-base font-semibold tracking-tight">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">{c.sub}</p>
                </div>
                <span className="text-accent transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

async function FeaturedGrid() {
  const products = await getFeaturedProducts(8);
  return <ProductGrid products={products} />;
}

// Lightweight CSS-only skeleton (no JS) shown while the grid streams.
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-hairline">
          <div className="aspect-square animate-pulse bg-soft" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 animate-pulse rounded bg-soft" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}
