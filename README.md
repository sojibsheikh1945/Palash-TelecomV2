# Palash Telecom

Certified pre-owned phone storefront, engineered to load on **2G/3G in rural Bangladesh**,
with webhook-safe payments and a server-side-locked admin panel.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL**.

## Quick start

```bash
npm install
cp .env.example .env      # works out of the box; edit for real DB/gateway/auth
npm run dev               # http://localhost:3000
```

The storefront ships with an **in-memory seed catalog** (`lib/products.ts`) and an
**in-memory payment store** (`lib/db.ts`), so everything runs with **no database**.

- `npm run dev` – local dev server
- `npm run build` / `npm start` – production build & serve
- `npm run typecheck` – strict TypeScript check
- `npm run hash -- 'YourPassword'` – bcrypt hash for `ADMIN_PASSWORD_HASH`

## Admin

- Visit `/admin` (dev: open by default via `ADMIN_DEV_BYPASS=1`).
- In production the route is protected by `middleware.ts`; sign in at `/login`.
- Demo credentials: `admin@palashtelecom.com` / `palash-admin`.

## Going to production

1. **Database** – run `schema.sql` on PostgreSQL 14+, install `pg`, set `DATABASE_URL`,
   and replace the bodies in `lib/products.ts` / `lib/db.ts` with the SQL in the comments.
2. **Auth** – set a strong `JWT_SECRET` (≥32 chars), set `ADMIN_PASSWORD_HASH`,
   and remove `ADMIN_DEV_BYPASS`.
3. **Payments** – set the SSLCommerz env vars; the IPN handler is at
   `app/api/payment/ipn/route.ts`.
4. **Images** – upload to object storage behind `cdn.palashtelecom.com`
   (already allowed in `next.config.mjs` + CSP).

See `ARCHITECTURE.md` for the full performance, payment-safety and security rationale.

## Project layout

```
app/            routes (home, phones, accessories, deals, products/[slug], contact,
                login, admin/*, api/*)
components/     Navbar, Hero, ProductCard, ProductGrid, FeatureStrip, Footer, Container
lib/            products (catalog/queries), db, auth, validation, sslcommerz, format, types
middleware.ts   server-side RBAC for /admin and /api/admin
schema.sql      PostgreSQL schema
```
