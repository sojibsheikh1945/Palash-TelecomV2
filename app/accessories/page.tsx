import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ProductGrid from '@/components/ProductGrid';
import { listProducts } from '@/lib/products';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Accessories', description: 'Chargers, cables, earbuds and power banks.' };

export default async function AccessoriesPage() {
  const products = await listProducts({ category: 'accessories' });
  return (
    <>
      <Navbar />
      <main>
        <Container className="py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Accessories</h1>
          <p className="mt-1 text-sm text-muted">Chargers, cables, earbuds &amp; power banks</p>
          <div className="mt-6"><ProductGrid products={products} /></div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
