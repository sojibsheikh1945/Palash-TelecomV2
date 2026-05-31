import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/products';

const BASE = 'https://palashtelecom.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const staticRoutes = ['', '/phones', '/accessories', '/deals', '/contact'].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: p === '' ? 1 : 0.7,
  }));
  const productRoutes = slugs.map((slug) => ({
    url: `${BASE}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...productRoutes];
}
