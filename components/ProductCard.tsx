// =============================================================================
//  components/ProductCard.tsx  —  Server Component
//  Apple-style card with trust badges (Battery Health, Condition Grade).
//  Lazy-loaded image with a blur placeholder served from the DB (LQIP).
// =============================================================================
import Link from 'next/link';
import Image from 'next/image';

export type Product = {
  slug: string;
  model: string;                 // phone model OR accessory name ("USB-C Cable 1m")
  categoryLabel?: string;        // shown for accessories: "Charger", "Earbuds"...
  pricePaisa: number;
  mrpPaisa?: number | null;
  grade?: 'A_PLUS' | 'A' | 'B' | 'C' | null; // null = brand-new / non-graded
  batteryHealth?: number | null; // phones only
  hasBox: boolean;
  hasCharger: boolean;
  image: { url: string; blurDataURL?: string };
};

const GRADE_LABEL: Record<NonNullable<Product['grade']>, string> = {
  A_PLUS: 'Like New', A: 'Grade A', B: 'Grade B', C: 'Grade C',
};

const bdt = (paisa: number) =>
  '৳' + Math.round(paisa / 100).toLocaleString('en-BD');

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      prefetch={false}
      className="group block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-[var(--bg-soft)]">
        <Image
          src={p.image.url}
          alt={p.model}
          fill
          loading="lazy"                /* default; explicit for clarity */
          sizes="(max-width: 640px) 50vw, 25vw"
          quality={65}
          placeholder={p.image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={p.image.blurDataURL}
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {/* Condition badge: grade for used items, "New" for sealed accessories */}
        <span className="absolute left-2 top-2 rounded-full bg-[var(--text)] px-2.5 py-1 text-[11px] font-semibold text-[var(--bg)]">
          {p.grade ? GRADE_LABEL[p.grade] : 'New'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-medium">{p.model}</h3>

        {/* Trust row: battery health for phones; category tag for accessories */}
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)]">
          {p.batteryHealth != null && (
            <span className="rounded-md bg-[var(--bg-soft)] px-2 py-0.5">
              🔋 {p.batteryHealth}%
            </span>
          )}
          {p.batteryHealth == null && p.categoryLabel && (
            <span className="rounded-md bg-[var(--bg-soft)] px-2 py-0.5">{p.categoryLabel}</span>
          )}
          {p.hasBox && <span className="rounded-md bg-[var(--bg-soft)] px-2 py-0.5">Box</span>}
          {p.hasCharger && <span className="rounded-md bg-[var(--bg-soft)] px-2 py-0.5">Charger</span>}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{bdt(p.pricePaisa)}</span>
          {p.mrpPaisa && p.mrpPaisa > p.pricePaisa && (
            <span className="text-xs text-[var(--text-muted)] line-through">{bdt(p.mrpPaisa)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
