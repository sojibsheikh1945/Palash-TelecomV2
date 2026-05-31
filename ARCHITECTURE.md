# Palash Telecom — Architecture & Engineering Blueprint

A pre-owned phone storefront engineered to load on 2G/3G in rural Bangladesh, with
webhook-safe payments and a locked-down admin panel.

---

## 1. Architecture & 2G/3G Optimization Strategy

### Rendering model — HTML-first, JS-last
The single biggest win on slow networks is **not waiting for JavaScript to render content**.

| Page type | Strategy | Why |
|---|---|---|
| Home, category, product detail | **SSG + ISR** (`export const revalidate = 300`) | HTML is pre-built and CDN-cached. The phone gets ready-to-paint HTML on the first byte — no client fetch, no hydration wait for content. |
| Cart, checkout, account | **SSR** | Per-user, can't be static, but still rendered server-side. |
| Product grid inside a page | **Streaming SSR** with `<Suspense>` | The page shell + navbar paint instantly; the grid streams in when the DB query resolves. |

Everything defaults to **React Server Components**. Only genuinely interactive islands
(`'use client'`) ship JS: the admin form, the cart button, the checkout flow. Target an
initial JS payload **under ~50 KB gzipped**.

### Images — the #1 bandwidth cost
Used via `next/image` + the `next.config.mjs` settings:
- **AVIF → WebP** formats (50–70% smaller than JPEG).
- `deviceSizes` capped at phone widths (max 1080px) — never generate 4K variants.
- `quality={60–70}` on grid/hero — visually fine, far fewer bytes.
- **Lazy-load by default**; only the hero (LCP) image gets `priority`.
- **LQIP blur placeholders** stored in `product_images.blur_data_url` so cards show a
  tiny blurred preview instantly while the real image streams.

### Adaptive / data-saver loading
Detect the connection and degrade gracefully. Read the `Save-Data` request header (and
`navigator.connection.effectiveType` on the client) and, on `2g`/`slow-2g` or when
Save-Data is on: lower image quality further, reduce grid page size, skip the hero image.

### Prefetch discipline (key low-bandwidth insight)
Next.js `<Link>` **prefetches every visible link by default** — on metered 2G data this
silently burns the user's balance. Every `<Link>` here sets **`prefetch={false}`**.
Optionally re-enable prefetch only when `effectiveType === '4g'`.

### Fonts
System font stack renders with **zero downloaded bytes**. Inter loads as progressive
enhancement via `next/font` (Latin subset, `display: swap`), so text never blocks paint.
*If you need Bangla UI text, add a Bangla subset or a system Bangla fallback — don't ship a full Bangla font over 2G.*

### Caching & delivery
- ISR + `Cache-Control: s-maxage, stale-while-revalidate` at the CDN edge.
- Brotli compression at the CDN.
- **PWA service worker** (e.g. `next-pwa`): cache the app shell + recently viewed
  products so repeat visits and flaky connections still work offline. This matters a lot
  on unstable rural mobile data.

### Database & payload hygiene
- `SELECT` only the columns the view needs (never `SELECT *`).
- Paginate listings (12–20 rows). Indexes in `schema.sql` make brand/price/grade filters fast.
- Semantic, shallow HTML → smaller DOM, faster parse on low-end phones.

---

## 2. Payment & Webhook Safety (the network-drop problem)

**The problem:** on 2G/3G the user's redirect back from the bKash/Nagad gateway can fail
*after* they've already paid. If your order status depended on that redirect, you'd lose
the payment.

**The fix:** the order status is **never** decided by the browser redirect. It is decided
by a **server-to-server IPN (Instant Payment Notification) webhook** that the gateway
sends independently of the user's network.

### Flow
```
 ┌────────┐   1. checkout    ┌──────────────┐
 │ Browser│ ───────────────► │  Our Backend │  create order (PENDING_PAYMENT)
 │ (2G/3G)│                  │              │  create txn  (INITIATED, unique tran_id)
 └────────┘                  └──────┬───────┘
      ▲                             │ 2. initiate() → GatewayPageURL
      │ 3. redirect to gateway      ▼
      │                       ┌──────────────┐
      └────── pays ──────────►│  SSLCommerz  │  (bKash / Nagad / card)
                              └──────┬───────┘
        ┌──────── 4a. redirect back (UNRELIABLE on 2G) ───────┐
        │                                                     │
        ▼                                                     │
 ┌────────────┐   4b. IPN POST (server→server, RELIABLE)  ┌───┴──────────┐
 │ /success UI│ ◄──reads order status from DB──────────── │  Our Backend │
 └────────────┘                                           │  /api/ipn    │
                                                          └──────────────┘
```

### What the IPN handler does (in one DB transaction)
1. **Authenticate** — call the gateway's *Validation API* with the `val_id`; verify the
   store passcode / signature hash. Never trust the raw POST body.
2. **Idempotency** — look up the `idempotency_key` / `tran_id`. If already `SUCCESS`,
   return `200` and stop. (The gateway may fire the webhook several times.)
3. **Amount check** — confirm `amount == order.total_paisa` to block tampering.
4. **Commit atomically** — set `payment_transactions.status = SUCCESS`,
   `orders.status = PAID`, and mark stock `SOLD` in a single SQL transaction.
5. The `/success`, `/fail`, `/cancel` pages just **read the order from the DB** — which the
   IPN already updated. If the redirect never arrives, the order is *still* correctly PAID.

### Reconciliation safety net
A cron job scans `payment_transactions` where `status = 'INITIATED'` and
`created_at < now() - 15min` (the `idx_txn_pending` partial index makes this cheap), then
queries the gateway directly to catch any IPN that was lost entirely. This guarantees no
paid order is ever stuck.

### IPN handler skeleton (Next.js Route Handler)
```ts
// app/api/payment/ipn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateWithGateway } from '@/lib/sslcommerz';

export async function POST(req: NextRequest) {
  const body = Object.fromEntries(await req.formData());

  // 1. Authenticate against the gateway (don't trust the POST).
  const verified = await validateWithGateway(body.val_id as string);
  if (!verified.ok) return NextResponse.json({ ok: false }, { status: 400 });

  await db.transaction(async (tx) => {
    const txn = await tx.getTxnForUpdate(body.tran_id as string); // SELECT ... FOR UPDATE
    if (!txn || txn.status === 'SUCCESS') return;                 // 2. idempotent
    if (verified.amountPaisa !== txn.amount_paisa) return;        // 3. amount check

    await tx.markTxnSuccess(txn.id, body.val_id, body);          // 4. atomic commit
    await tx.markOrderPaid(txn.order_id);
    await tx.markItemsSold(txn.order_id);
  });

  return NextResponse.json({ ok: true }); // always 200 so the gateway stops retrying
}
```

---

## 3. Security Checklist

**Auth & sessions**
- [ ] Passwords hashed with **bcrypt** (cost ≥ 12). Never log or store plaintext.
- [ ] **JWT** short-lived access token + refresh token, stored in **httpOnly + Secure +
      SameSite=Strict cookies** (not `localStorage` → immune to XSS token theft).
- [ ] Strong, rotated `JWT_SECRET` from env vars only.

**Admin / RBAC**
- [ ] Role check enforced **server-side in `middleware.ts`** for every `/admin/*` route —
      hiding buttons is never the security boundary.
- [ ] `SUPER_ADMIN` vs `ADMIN` separation; log all admin write actions (audit trail).

```ts
// middleware.ts — runs before any /admin page renders
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const claims = await verifyJwt(req.cookies.get('access_token')?.value);
    if (!claims || (claims.role !== 'ADMIN' && claims.role !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
```

**Input & injection**
- [ ] **Zod** schema validation on every API route / Server Action.
- [ ] **Parameterized queries only** (Prisma/Drizzle or `pg` placeholders) → no SQL injection.
- [ ] React auto-escapes output; avoid `dangerouslySetInnerHTML`, sanitize if unavoidable.

**HTTP hardening (the "Helmet" equivalent — set in `next.config.mjs`)**
- [ ] CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
      `Referrer-Policy`, `HSTS`, `Permissions-Policy`.
- [ ] CSP `frame-src` allows only the SSLCommerz/AmarPay gateway domains.

**Transactions & abuse**
- [ ] Webhook = validate via gateway API + idempotency key + amount check (see §2).
- [ ] **Rate-limit** login, checkout, and the IPN endpoint per IP.
- [ ] CSRF tokens for cookie-based state-changing forms (SameSite=Strict already helps).

**Infrastructure**
- [ ] HTTPS everywhere; HSTS preload.
- [ ] Least-privilege DB user; TLS connection to PostgreSQL.
- [ ] Secrets in env vars / a secret manager — never committed.
- [ ] Validate uploaded image MIME type + size; store on object storage/CDN, not the app server.
- [ ] Run `npm audit` / Dependabot on dependencies.
```
