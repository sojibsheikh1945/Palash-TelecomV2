// =============================================================================
//  app/layout.tsx  —  root layout
//  Performance choice for 2G/3G: a pure SYSTEM FONT STACK (see globals.css).
//  Zero font bytes downloaded, zero render-blocking, no build-time font fetch.
//  Text paints on the first byte. (ARCHITECTURE.md §1 "Fonts".)
// =============================================================================
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://palashtelecom.com'),
  title: {
    default: 'Palash Telecom — Certified Pre-Owned Phones in Bangladesh',
    template: '%s · Palash Telecom',
  },
  description:
    'Tested, graded and warrantied used smartphones in Bangladesh. ' +
    'Battery-health verified. Pay with bKash, Nagad, card or cash on delivery.',
  applicationName: 'Palash Telecom',
  keywords: ['used phone', 'refurbished iphone', 'second hand mobile Bangladesh', 'bKash', 'Sirajganj'],
  openGraph: {
    type: 'website',
    siteName: 'Palash Telecom',
    locale: 'en_BD',
    title: 'Palash Telecom — Certified Pre-Owned Phones',
    description: 'Tested, graded, warrantied used smartphones in Bangladesh.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
