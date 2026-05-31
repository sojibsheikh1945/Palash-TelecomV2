// =============================================================================
//  lib/types.ts  —  domain types shared across the app (mirror schema.sql)
// =============================================================================
export type Grade = 'A_PLUS' | 'A' | 'B' | 'C';
export type StockStatus = 'IN_STOCK' | 'RESERVED' | 'SOLD';
export type CategorySlug = 'phones' | 'accessories';

export interface ProductImage {
  url: string;
  blurDataURL?: string;
}

/** The full catalog record (what the DB / detail page works with). */
export interface CatalogProduct {
  slug: string;
  sku: string;
  brand: string;
  model: string;
  category: CategorySlug;
  categoryLabel: string; // "Smartphone", "Charger", "Earbuds"...
  pricePaisa: number;
  mrpPaisa?: number | null;
  grade?: Grade | null;
  batteryHealth?: number | null;
  warrantyMonths: number;
  hasBox: boolean;
  hasCharger: boolean;
  storageGb?: number | null;
  ramGb?: number | null;
  color?: string | null;
  description?: string;
  stock: StockStatus;
  images: ProductImage[];
  featured?: boolean;
  createdAt: string; // ISO
}
