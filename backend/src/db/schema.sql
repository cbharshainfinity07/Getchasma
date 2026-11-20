-- GetChasma database schema (SQLite).
-- All monetary values are stored as INTEGER minor units (paise) to avoid floating point errors.
-- Timestamps are ISO-8601 UTC strings.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT,
  role           TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  is_active      INTEGER NOT NULL DEFAULT 1,
  last_login_at  TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Customers are everyone who has bought or registered. A customer may or may not have a login (user_id).
CREATE TABLE IF NOT EXISTS customers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name        TEXT NOT NULL,
  phone       TEXT,
  user_id     INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  image        TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS products (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  tagline              TEXT,
  description          TEXT,
  price                INTEGER NOT NULL CHECK (price >= 0),          -- original / MRP
  sale_price           INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  category_id          INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  material             TEXT,
  frame_shape          TEXT,
  gender               TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
  colors               TEXT NOT NULL DEFAULT '[]',                   -- JSON: [{ "name": "Black", "hex": "#000000" }]
  sku                  TEXT NOT NULL UNIQUE COLLATE NOCASE,
  stock                INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold  INTEGER NOT NULL DEFAULT 5,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured          INTEGER NOT NULL DEFAULT 0,
  is_bestseller        INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS product_images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change       INTEGER NOT NULL,
  stock_after  INTEGER NOT NULL,
  reason       TEXT NOT NULL CHECK (reason IN ('initial', 'restock', 'adjustment', 'order', 'cancellation', 'refund', 'correction')),
  note         TEXT,
  order_id     INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);

CREATE TABLE IF NOT EXISTS discounts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  description  TEXT,
  type         TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value        INTEGER NOT NULL CHECK (value > 0),   -- percentage: whole percent; fixed: minor units
  min_order    INTEGER NOT NULL DEFAULT 0,
  max_uses     INTEGER,
  used_count   INTEGER NOT NULL DEFAULT 0,
  starts_at    TEXT,
  ends_at      TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number      TEXT NOT NULL UNIQUE,
  customer_id       INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  user_id           INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email             TEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  shipping_address  TEXT NOT NULL,          -- JSON
  subtotal          INTEGER NOT NULL,
  discount_total    INTEGER NOT NULL DEFAULT 0,
  shipping_total    INTEGER NOT NULL DEFAULT 0,
  tax_total         INTEGER NOT NULL DEFAULT 0,
  total             INTEGER NOT NULL,
  discount_code     TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
  payment_status    TEXT NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_ref       TEXT,                   -- gateway order id
  payment_txn_id    TEXT,                   -- gateway payment id
  refunded_amount   INTEGER NOT NULL DEFAULT 0,
  carrier           TEXT,
  tracking_number   TEXT,
  customer_note     TEXT,
  internal_note     TEXT,
  cancel_reason     TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  sku         TEXT NOT NULL,
  image       TEXT,
  color       TEXT,
  unit_price  INTEGER NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE TABLE IF NOT EXISTS order_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,          -- status | payment | note | refund
  status      TEXT,
  message     TEXT NOT NULL,
  is_public   INTEGER NOT NULL DEFAULT 1,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

CREATE TABLE IF NOT EXISTS wishlist_items (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL      -- JSON
);
