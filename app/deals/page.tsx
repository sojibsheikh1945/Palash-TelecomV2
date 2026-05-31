import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import ProductGrid from '@/components/ProductGrid';
import { getDeals } from '@/lib/products';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Deals', description: 'Best markdowns on certified pre-owned devices.' };

export default async function DealsPage() {
  const products = await getDeals();
  return (
    <>
      <Navbar />
      <main>
        <Container className="py-10">
          <h1 className="text-2xl font-semibold tracking-tight">This week&rsquo;s deals</h1>
          <p className="mt-1 text-sm text-muted">Biggest savings, ranked by discount</p>
          <div className="mt-6"><ProductGrid products={products} /></div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
