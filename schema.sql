-- =============================================================================
--  PALASH TELECOM  —  PostgreSQL Schema (lean, indexed for fast filtering)
--  Run on PostgreSQL 14+.  Money is stored in PAISA (BDT * 100) as BIGINT to
--  avoid floating-point rounding errors.  Times are timestamptz (UTC).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";   -- case-insensitive email (users.email)

-- ---------- ENUMS ------------------------------------------------------------
CREATE TYPE user_role        AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE condition_grade  AS ENUM ('A_PLUS', 'A', 'B', 'C');           -- A+ = Like New
CREATE TYPE stock_status     AS ENUM ('IN_STOCK', 'RESERVED', 'SOLD');
CREATE TYPE order_status      AS ENUM (
  'PENDING_PAYMENT', -- order created, gateway not yet confirmed
  'PAID',            -- IPN/webhook confirmed payment
  'COD_CONFIRMED',   -- cash on delivery, awaiting dispatch
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
);
CREATE TYPE payment_method   AS ENUM ('SSLCOMMERZ', 'AMARPAY', 'COD');
CREATE TYPE txn_status        AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'CANCELLED');

-- ---------- USERS  (RBAC handles "admin users" via the `role` column) --------
-- A single users table + role enum is leaner and safer than a separate
-- admin_users table: one auth path, no duplicated email logic, easy promotion.
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT        NOT NULL,
  email         CITEXT      UNIQUE NOT NULL,        -- case-insensitive unique
  phone         VARCHAR(20),
  password_hash TEXT        NOT NULL,               -- bcrypt, NEVER plaintext
  role          user_role   NOT NULL DEFAULT 'CUSTOMER',
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Partial index: admin lookups are rare but should be instant.
CREATE INDEX idx_users_admins ON users (role) WHERE role <> 'CUSTOMER';

-- ---------- BRANDS & CATEGORIES ---------------------------------------------
CREATE TABLE brands (
  id    SMALLSERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,        -- Apple, Samsung, Xiaomi...
  slug  TEXT UNIQUE NOT NULL
);

CREATE TABLE categories (
  id    SMALLSERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,        -- Smartphone, Charger, Earbuds, Case...
  slug  TEXT UNIQUE NOT NULL
);

-- ---------- PRODUCTS  (used phones + accessories) ---------------------------
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,             -- SEO + SSG route key
  brand_id        SMALLINT NOT NULL REFERENCES brands(id),
  category_id     SMALLINT NOT NULL REFERENCES categories(id),
  model           TEXT NOT NULL,                    -- "iPhone 13 Pro"

  price_paisa     BIGINT NOT NULL CHECK (price_paisa >= 0),
  mrp_paisa       BIGINT,                           -- original price, for % off badge

  -- ---- Trust factors (used-phone specifics; all OPTIONAL for accessories) ----
  -- Convention: grade IS NULL     -> brand-new / non-graded item (e.g. a sealed cable)
  --             grade IS NOT NULL  -> used & graded (phones, used earbuds, etc.)
  grade           condition_grade,
  battery_health  SMALLINT CHECK (battery_health BETWEEN 0 AND 100), -- % (phones only; NULL for accessories)
  warranty_months SMALLINT NOT NULL DEFAULT 0,
  has_box         BOOLEAN  NOT NULL DEFAULT FALSE,
  has_charger     BOOLEAN  NOT NULL DEFAULT FALSE,

  -- ---- Specs (nullable for accessories) ----
  storage_gb      SMALLINT,
  ram_gb          SMALLINT,
  color           TEXT,

  description     TEXT,
  stock           stock_status NOT NULL DEFAULT 'IN_STOCK',  -- used phones are usually qty 1
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite/partial indexes tuned for the storefront's hot filters.
-- Only published, in-stock rows are ever listed -> partial index keeps it tiny & fast.
CREATE INDEX idx_products_browse
  ON products (brand_id, category_id, price_paisa)
  WHERE is_published = TRUE AND stock = 'IN_STOCK';
CREATE INDEX idx_products_price   ON products (price_paisa) WHERE is_published = TRUE;
CREATE INDEX idx_products_grade   ON products (grade)       WHERE is_published = TRUE;
-- Trigram index for fast model search ("ILIKE %iphone%").
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_model_trgm ON products USING gin (model gin_trgm_ops);

-- ---------- PRODUCT IMAGES  (normalized; carries LQIP blur for next/image) ---
CREATE TABLE product_images (
  id             BIGSERIAL PRIMARY KEY,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url            TEXT NOT NULL,            -- CDN URL (object storage)
  blur_data_url  TEXT,                     -- tiny base64 LQIP for placeholder="blur"
  width          SMALLINT,
  height         SMALLINT,
  position       SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_images_product ON product_images (product_id, position);

-- ---------- ORDERS -----------------------------------------------------------
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,         -- human-friendly: PT-20260531-0001
  user_id         UUID REFERENCES users(id),    -- NULL allowed for guest COD checkout

  status          order_status   NOT NULL DEFAULT 'PENDING_PAYMENT',
  method          payment_method NOT NULL,

  subtotal_paisa  BIGINT NOT NULL,
  shipping_paisa  BIGINT NOT NULL DEFAULT 0,
  total_paisa     BIGINT NOT NULL,

  -- Shipping snapshot (kept on the order so address edits don't rewrite history)
  ship_name       TEXT NOT NULL,
  ship_phone      VARCHAR(20) NOT NULL,
  ship_address    TEXT NOT NULL,
  ship_district   TEXT NOT NULL,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user   ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders (status, created_at DESC);

-- ---------- ORDER ITEMS  (snapshot specs because used phones are unique) -----
CREATE TABLE order_items (
  id               BIGSERIAL PRIMARY KEY,
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id),       -- keep ref even if later sold
  product_snapshot JSONB NOT NULL,                     -- {model,grade,battery,specs...}
  unit_price_paisa BIGINT NOT NULL,
  quantity         SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0)
);
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- ---------- PAYMENT TRANSACTIONS  (source of truth for webhook safety) -------
CREATE TABLE payment_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id),
  gateway          payment_method NOT NULL,
  tran_id          TEXT UNIQUE NOT NULL,    -- OUR id, sent to gateway on initiate
  val_id           TEXT,                    -- gateway validation id (set on IPN)
  amount_paisa     BIGINT NOT NULL,
  currency         CHAR(3) NOT NULL DEFAULT 'BDT',
  status           txn_status NOT NULL DEFAULT 'INITIATED',
  -- Idempotency: a webhook can fire many times; this guarantees once-only effect.
  idempotency_key  TEXT UNIQUE NOT NULL,
  raw_payload      JSONB,                   -- full gateway response for audit/dispute
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_txn_order   ON payment_transactions (order_id);
-- Reconciliation job scans stuck INITIATED rows (missed webhooks on 2G).
CREATE INDEX idx_txn_pending ON payment_transactions (status, created_at)
  WHERE status = 'INITIATED';

-- ---------- AUTO updated_at TRIGGER -----------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_touch    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_products_touch BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_orders_touch   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_txn_touch      BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
