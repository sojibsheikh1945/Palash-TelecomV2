// =============================================================================
//  components/Hero.tsx  —  Server Component, statically rendered (SSG)
//  Clean, Apple-style hero. One CTA. The hero image is the LCP element, so it
//  gets priority loading; everything else stays lazy.
// =============================================================================
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="bg-[var(--bg-soft)]">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:grid-cols-2 sm:py-20">
        <div>
          <p className="mb-3 text-sm font-medium text-[var(--accent)]">Certified Pre-Owned</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Premium phones,<br />honestly graded.
          </h1>
          <p className="mt-4 max-w-md text-[var(--text-muted)]">
            Every device tested for battery health and condition, with warranty.
            Pay with bKash, Nagad, card, or cash on delivery.
          </p>
          <Link
            href="/phones"
            prefetch={false}
            className="mt-6 inline-flex items-center rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)] transition-opacity hover:opacity-90"
          >
            Shop phones
          </Link>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          <Image
            src="/hero.png"
            alt="Refurbished premium smartphones"
            fill
            priority                 /* LCP image: load eagerly */
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={70}             /* lower quality = fewer bytes on 2G */
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
