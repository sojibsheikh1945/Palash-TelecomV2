// =============================================================================
//  lib/products.ts  —  the data-access layer the pages import.
//
//  Ships with an in-memory seed catalog so the whole storefront runs with NO
//  database. To go live, swap the function bodies for the parameterised SQL
//  shown in each comment (lib/db.ts gives you a guarded `pg` pool). The public
//  signatures stay the same, so no page needs to change.
// =============================================================================
import type { Product } from '@/components/ProductCard';
import type { CatalogProduct, CategorySlug, Grade } from '@/lib/types';

const BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAFUlEQVR4nGP88OEzA27AhEduBEsDAHNYAue/sWWyAAAAAElFTkSuQmCC';

const img = (slug: string) => ({ url: `/img/${slug}.png`, blurDataURL: BLUR });

// --- Seed catalog (realistic BD pricing, stored in paisa = BDT * 100) --------
const CATALOG: CatalogProduct[] = [
  {
    slug: 'iphone-13-pro', sku: 'PT-IP13P-256', brand: 'Apple', model: 'iPhone 13 Pro',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 7_200_000, mrpPaisa: 9_500_000, grade: 'A_PLUS', batteryHealth: 92,
    warrantyMonths: 3, hasBox: true, hasCharger: true, storageGb: 256, ramGb: 6, color: 'Graphite',
    description: 'Flagship A15 Bionic, ProMotion 120Hz display, triple 12MP camera. Fully tested, battery health 92%, no scratches.',
    stock: 'IN_STOCK', images: [img('iphone-13-pro')], featured: true, createdAt: '2026-05-20',
  },
  {
    slug: 'iphone-12', sku: 'PT-IP12-128', brand: 'Apple', model: 'iPhone 12',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 4_500_000, mrpPaisa: 5_800_000, grade: 'A', batteryHealth: 87,
    warrantyMonths: 3, hasBox: true, hasCharger: false, storageGb: 128, ramGb: 4, color: 'Blue',
    description: 'Reliable A14 daily driver with OLED Super Retina XDR. Minor edge wear, screen flawless.',
    stock: 'IN_STOCK', images: [img('iphone-12')], featured: true, createdAt: '2026-05-22',
  },
  {
    slug: 'iphone-11', sku: 'PT-IP11-64', brand: 'Apple', model: 'iPhone 11',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 3_300_000, mrpPaisa: 4_200_000, grade: 'B', batteryHealth: 81,
    warrantyMonths: 1, hasBox: false, hasCharger: true, storageGb: 64, ramGb: 4, color: 'White',
    description: 'Great-value dual-camera iPhone. Visible but light cosmetic wear; fully functional.',
    stock: 'IN_STOCK', images: [img('iphone-11')], featured: true, createdAt: '2026-05-18',
  },
  {
    slug: 'samsung-galaxy-s21', sku: 'PT-SGS21-128', brand: 'Samsung', model: 'Galaxy S21 5G',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 3_800_000, mrpPaisa: 5_200_000, grade: 'A', batteryHealth: 89,
    warrantyMonths: 3, hasBox: true, hasCharger: true, storageGb: 128, ramGb: 8, color: 'Phantom Gray',
    description: 'Snapdragon 888, 120Hz AMOLED, triple camera. Excellent condition.',
    stock: 'IN_STOCK', images: [img('samsung-galaxy-s21')], featured: true, createdAt: '2026-05-25',
  },
  {
    slug: 'samsung-galaxy-a52', sku: 'PT-SGA52-128', brand: 'Samsung', model: 'Galaxy A52',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 2_200_000, mrpPaisa: 3_000_000, grade: 'A', batteryHealth: 90,
    warrantyMonths: 3, hasBox: true, hasCharger: true, storageGb: 128, ramGb: 6, color: 'Awesome Black',
    description: 'Dependable mid-ranger with 90Hz Super AMOLED and big battery.',
    stock: 'IN_STOCK', images: [img('samsung-galaxy-a52')], createdAt: '2026-05-26',
  },
  {
    slug: 'xiaomi-12', sku: 'PT-MI12-256', brand: 'Xiaomi', model: 'Xiaomi 12',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 2_900_000, mrpPaisa: 3_900_000, grade: 'A_PLUS', batteryHealth: 94,
    warrantyMonths: 3, hasBox: true, hasCharger: true, storageGb: 256, ramGb: 8, color: 'Purple',
    description: 'Snapdragon 8 Gen 1, 67W fast charge. Like new, barely used.',
    stock: 'RESERVED', images: [img('xiaomi-12')], featured: true, createdAt: '2026-05-19',
  },
  {
    slug: 'google-pixel-6', sku: 'PT-PX6-128', brand: 'Other', model: 'Google Pixel 6',
    category: 'phones', categoryLabel: 'Smartphone',
    pricePaisa: 3_100_000, mrpPaisa: 4_000_000, grade: 'B', batteryHealth: 83,
    warrantyMonths: 1, hasBox: false, hasCharger: false, storageGb: 128, ramGb: 8, color: 'Stormy Black',
    description: 'Best-in-class computational photography with the Tensor chip.',
    stock: 'IN_STOCK', images: [img('google-pixel-6')], createdAt: '2026-05-15',
  },
  // ---- Accessories (grade = null => brand-new / non-graded) ----
  {
    slug: 'anker-charger-30w', sku: 'PT-ANK30W', brand: 'Anker', model: 'Anker 30W USB-C Charger',
    category: 'accessories', categoryLabel: 'Charger',
    pricePaisa: 180_000, mrpPaisa: 250_000, grade: null, batteryHealth: null,
    warrantyMonths: 6, hasBox: true, hasCharger: false,
    description: 'Compact GaN fast charger. Brand new, sealed.',
    stock: 'IN_STOCK', images: [img('anker-charger-30w')], featured: true, createdAt: '2026-05-28',
  },
  {
    slug: 'baseus-usb-c-cable', sku: 'PT-BSUSBC1M', brand: 'Baseus', model: 'Baseus USB-C Cable 1m',
    category: 'accessories', categoryLabel: 'Cable',
    pricePaisa: 45_000, mrpPaisa: 70_000, grade: null, batteryHealth: null,
    warrantyMonths: 3, hasBox: true, hasCharger: false,
    description: '100W braided USB-C to USB-C cable. Brand new.',
    stock: 'IN_STOCK', images: [img('baseus-usb-c-cable')], createdAt: '2026-05-27',
  },
  {
    slug: 'wireless-earbuds', sku: 'PT-EB-PRO', brand: 'Other', model: 'Wireless Earbuds Pro',
    category: 'accessories', categoryLabel: 'Earbuds',
    pricePaisa: 350_000, mrpPaisa: 500_000, grade: 'A', batteryHealth: null,
    warrantyMonths: 1, hasBox: true, hasCharger: false,
    description: 'ANC true-wireless earbuds. Open-box, lightly used.',
    stock: 'IN_STOCK', images: [img('wireless-earbuds')], featured: true, createdAt: '2026-05-24',
  },
  {
    slug: 'powerbank-20000', sku: 'PT-PB20K', brand: 'Anker', model: 'Power Bank 20000mAh',
    category: 'accessories', categoryLabel: 'Power Bank',
    pricePaisa: 240_000, mrpPaisa: 320_000, grade: null, batteryHealth: null,
    warrantyMonths: 6, hasBox: true, hasCharger: false,
    description: '20W PD power bank, two-port. Brand new, sealed.',
    stock: 'IN_STOCK', images: [img('powerbank-20000')], createdAt: '2026-05-23',
  },
];

// --- Mapper: rich catalog record -> lightweight card shape -------------------
function toCard(p: CatalogProduct): Product {
  return {
    slug: p.slug,
    model: p.model,
    categoryLabel: p.category === 'accessories' ? p.categoryLabel : undefined,
    pricePaisa: p.pricePaisa,
    mrpPaisa: p.mrpPaisa ?? null,
    grade: p.grade ?? null,
    batteryHealth: p.batteryHealth ?? null,
    hasBox: p.hasBox,
    hasCharger: p.hasCharger,
    image: p.images[0],
  };
}

const isListable = (p: CatalogProduct) => p.stock !== 'SOLD';

// --- Public query API (pages import these) -----------------------------------

/**
 * Featured products for the homepage grid.
 * SQL: SELECT slug, model, price_paisa, mrp_paisa, grade, battery_health,
 *      has_box, has_charger, (first image) FROM products
 *      WHERE is_published AND stock <> 'SOLD' ORDER BY created_at DESC LIMIT $1;
 */
export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  return CATALOG.filter((p) => p.featured && isListable(p))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(toCard);
}

export interface ListOptions {
  category?: CategorySlug;
  brand?: string;
  grade?: Grade;
  sort?: 'newest' | 'price-asc' | 'price-desc';
}

/** Listing pages (/phones, /accessories, /deals) with light filtering. */
export async function listProducts(opts: ListOptions = {}): Promise<Product[]> {
  let rows = CATALOG.filter(isListable);
  if (opts.category) rows = rows.filter((p) => p.category === opts.category);
  if (opts.brand) rows = rows.filter((p) => p.brand.toLowerCase() === opts.brand!.toLowerCase());
  if (opts.grade) rows = rows.filter((p) => p.grade === opts.grade);

  switch (opts.sort) {
    case 'price-asc': rows = [...rows].sort((a, b) => a.pricePaisa - b.pricePaisa); break;
    case 'price-desc': rows = [...rows].sort((a, b) => b.pricePaisa - a.pricePaisa); break;
    default: rows = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return rows.map(toCard);
}

/** Products with a real markdown — powers /deals. */
export async function getDeals(): Promise<Product[]> {
  return CATALOG.filter((p) => isListable(p) && p.mrpPaisa && p.mrpPaisa > p.pricePaisa)
    .sort((a, b) => (b.mrpPaisa! - b.pricePaisa) / b.mrpPaisa! - (a.mrpPaisa! - a.pricePaisa) / a.mrpPaisa!)
    .map(toCard);
}

/** Full record for the product detail page. */
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  return CATALOG.find((p) => p.slug === slug) ?? null;
}

/** Static params for SSG of /products/[slug]. */
export async function getAllSlugs(): Promise<string[]> {
  return CATALOG.map((p) => p.slug);
}

/** Distinct brands for filter UI. */
export async function getBrands(category?: CategorySlug): Promise<string[]> {
  const rows = category ? CATALOG.filter((p) => p.category === category) : CATALOG;
  return Array.from(new Set(rows.map((p) => p.brand))).sort();
}
