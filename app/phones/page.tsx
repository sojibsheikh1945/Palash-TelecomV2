import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ProductGrid from '@/components/ProductGrid';
import { listProducts, getBrands } from '@/lib/products';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Phones', description: 'Certified pre-owned smartphones — tested, graded and warrantied.' };

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`rounded-full border px-3 py-1.5 transition-colors ${
        active ? 'border-accent bg-accent text-accent-ink' : 'border-hairline text-muted hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}

export default async function PhonesPage({
  searchParams,
}: { searchParams: { brand?: string; sort?: 'newest' | 'price-asc' | 'price-desc' } }) {
  const [products, brands] = await Promise.all([
    listProducts({ category: 'phones', brand: searchParams.brand, sort: searchParams.sort }),
    getBrands('phones'),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Container className="py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Pre-owned phones</h1>
          <p className="mt-1 text-sm text-muted">{products.length} device{products.length === 1 ? '' : 's'} available</p>

          <nav className="mt-6 flex flex-wrap gap-2 text-sm">
            <FilterChip href="/phones" active={!searchParams.brand} label="All brands" />
            {brands.map((b) => (
              <FilterChip key={b} href={`/phones?brand=${encodeURIComponent(b)}`} active={searchParams.brand === b} label={b} />
            ))}
          </nav>

          <div className="mt-6"><ProductGrid products={products} /></div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
