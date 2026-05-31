import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { getProductBySlug, getAllSlugs } from '@/lib/products';
import { bdt, discountPct } from '@/lib/format';
import type { Grade } from '@/lib/types';

export const revalidate = 300;

const GRADE_LABEL: Record<Grade, string> = { A_PLUS: 'Like New', A: 'Grade A', B: 'Grade B', C: 'Grade C' };

// Pre-render every product page at build time (SSG); ISR refreshes them.
export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: 'Not found' };
  return {
    title: p.model,
    description: p.description?.slice(0, 155) ?? `${p.model} — certified pre-owned.`,
    openGraph: { title: p.model, images: [p.images[0]?.url].filter(Boolean) as string[] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();

  const off = discountPct(p.pricePaisa, p.mrpPaisa);
  const soldOut = p.stock === 'SOLD';
  const specs: [string, string][] = [
    p.storageGb ? ['Storage', `${p.storageGb} GB`] : null,
    p.ramGb ? ['RAM', `${p.ramGb} GB`] : null,
    p.color ? ['Colour', p.color] : null,
    p.batteryHealth != null ? ['Battery health', `${p.batteryHealth}%`] : null,
    p.grade ? ['Condition', GRADE_LABEL[p.grade]] : ['Condition', 'New / Sealed'],
    ['Warranty', p.warrantyMonths > 0 ? `${p.warrantyMonths} month${p.warrantyMonths > 1 ? 's' : ''}` : 'No warranty'],
    ['Box', p.hasBox ? 'Included' : 'Not included'],
    ['Charger', p.hasCharger ? 'Included' : 'Not included'],
    ['SKU', p.sku],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      <Navbar />
      <main>
        <Container className="py-8">
          <nav className="mb-6 text-sm text-muted">
            <Link href="/" prefetch={false} className="hover:text-ink">Home</Link>
            <span className="px-2">/</span>
            <Link href={p.category === 'phones' ? '/phones' : '/accessories'} prefetch={false} className="hover:text-ink">
              {p.category === 'phones' ? 'Phones' : 'Accessories'}
            </Link>
            <span className="px-2">/</span>
            <span className="text-ink">{p.model}</span>
          </nav>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-hairline bg-soft">
              <Image
                src={p.images[0].url}
                alt={p.model}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={70}
                placeholder={p.images[0].blurDataURL ? 'blur' : 'empty'}
                blurDataURL={p.images[0].blurDataURL}
                className="object-contain p-8"
              />
              <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-bg">
                {p.grade ? GRADE_LABEL[p.grade] : 'New'}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-accent">{p.brand}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{p.model}</h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">{bdt(p.pricePaisa)}</span>
                {p.mrpPaisa && p.mrpPaisa > p.pricePaisa && (
                  <span className="text-base text-muted line-through">{bdt(p.mrpPaisa)}</span>
                )}
                {off && (
                  <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-semibold text-success">{off}% off</span>
                )}
              </div>

              <p className="mt-2 text-sm">
                {soldOut ? (
                  <span className="font-medium text-danger">Sold out</span>
                ) : p.stock === 'RESERVED' ? (
                  <span className="font-medium text-muted">Reserved — ask us about availability</span>
                ) : (
                  <span className="font-medium text-success">In stock · ready to ship</span>
                )}
              </p>

              {p.description && <p className="mt-4 text-sm leading-relaxed text-muted">{p.description}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={soldOut}
                  className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Buy with bKash / Nagad / Card
                </button>
                <button
                  disabled={soldOut}
                  className="rounded-xl border border-hairline px-6 py-3 text-sm font-semibold transition-colors hover:bg-soft disabled:opacity-40"
                >
                  Cash on delivery
                </button>
              </div>

              <dl className="mt-8 divide-y divide-hairline rounded-2xl border border-hairline">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3 text-sm">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
