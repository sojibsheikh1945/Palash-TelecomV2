// =============================================================================
//  next.config.mjs  —  performance + security baked in at the framework level
// =============================================================================
const isProd = process.env.NODE_ENV === 'production';

// CSP must be relaxed in dev: Next's HMR/runtime uses eval + inline scripts.
// In production we ship a strict policy. (ARCHITECTURE.md §3 "HTTP hardening".)
const scriptSrc = isProd ? "script-src 'self'" : "script-src 'self' 'unsafe-eval' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  "img-src 'self' https://cdn.palashtelecom.com data: blob:",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  // Allow ONLY the bKash/Nagad gateway iframe; lock everything else down.
  "frame-src https://*.sslcommerz.com https://*.amarpay.com",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,          // hide "X-Powered-By" (minor info-leak)
  compress: true,                  // gzip; put Brotli at the CDN/edge in front

  images: {
    // Serve the smallest possible bytes: AVIF first, WebP fallback.
    formats: ['image/avif', 'image/webp'],
    // Only generate the widths a phone screen actually needs — no 4K variants.
    deviceSizes: [320, 420, 640, 768, 1080],
    imageSizes: [64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // cache optimized images 30 days
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.palashtelecom.com' }],
  },

  // Security headers (the "Helmet" equivalent for Next.js).
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options',        value: 'DENY' },
        { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: csp },
      ],
    }];
  },
};

export default nextConfig;
