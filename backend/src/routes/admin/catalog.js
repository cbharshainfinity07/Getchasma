/** Categories, inventory and uploads. */
const express = require('express');
const { all, get, run } = require('../../db');
const { validate } = require('../../middleware/validate');
const { requireAdmin } = require('../../middleware/auth');
const { imageUpload } = require('../../middleware/upload');
const { notFound, badRequest } = require('../../lib/errors');
const { slugify, paginate } = require('../../lib/util');
const S = require('../../lib/schemas');
const products = require('../../services/products');
const { z } = require('zod');

const categories = express.Router();

const catDTO = (c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.image,
  sortOrder: c.sort_order,
  isActive: Boolean(c.is_active),
  productCount: c.product_count ?? 0,
  createdAt: c.created_at,
});

function uniqueCatSlug(base, excludeId = 0) {
  let slug = slugify(base);
  let n = 1;
  while (get('SELECT id FROM categories WHERE slug = ? AND id != ?', slug, excludeId)) slug = `${slugify(base)}-${++n}`;
  return slug;
}

categories.get('/', (req, res) => {
  const rows = all(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
     FROM categories c ORDER BY c.sort_order, c.name`,
  );
  res.json(rows.map(catDTO));
});

categories.post('/', validate(S.category), (req, res) => {
  const b = req.body;
  const r = run(
    'INSERT INTO categories (name, slug, description, image, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    b.name,
    uniqueCatSlug(b.slug || b.name),
    b.description ?? null,
    b.image ?? null,
    b.sortOrder,
    b.isActive ? 1 : 0,
  );
  res.status(201).json(catDTO(get('SELECT * FROM categories WHERE id = ?', r.lastInsertRowid)));
});

categories.put('/:id', validate(S.category), (req, res) => {
  const id = Number(req.params.id);
  if (!get('SELECT id FROM categories WHERE id = ?', id)) throw notFound('Category not found');
  const b = req.body;
  run(
    'UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, sort_order = ?, is_active = ? WHERE id = ?',
    b.name,
    uniqueCatSlug(b.slug || b.name, id),
    b.description ?? null,
    b.image ?? null,
    b.sortOrder,
    b.isActive ? 1 : 0,
    id,
  );
  res.json(catDTO(get('SELECT * FROM categories WHERE id = ?', id)));
});

/** Assign or remove products from a category in one call. */
categories.put(
  '/:id/products',
  validate(z.object({ productIds: z.array(z.coerce.number().int().positive()).max(1000) })),
  (req, res) => {
    const id = Number(req.params.id);
    if (!get('SELECT id FROM categories WHERE id = ?', id)) throw notFound('Category not found');
    run('UPDATE products SET category_id = NULL WHERE category_id = ?', id);
    for (const pid of req.body.productIds) run('UPDATE products SET category_id = ? WHERE id = ?', id, pid);
    res.json({ ok: true, count: req.body.productIds.length });
  },
);

categories.delete('/:id', requireAdmin('admin'), (req, res) => {
  const id = Number(req.params.id);
  const count = get('SELECT COUNT(*) AS n FROM products WHERE category_id = ?', id).n;
  if (count > 0 && req.query.force !== 'true') {
    throw badRequest(`${count} product(s) are in this category. Move them first or confirm to uncategorise them.`, {
      productCount: count,
    });
  }
  const r = run('DELETE FROM categories WHERE id = ?', id);
  if (!Number(r.changes)) throw notFound('Category not found');
  res.status(204).end();
});

// ------------------------------------------------------------------ inventory

const inventory = express.Router();

inventory.get('/', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 25 });
  const filters = {
    q: req.query.q ? String(req.query.q) : null,
    stock: ['low', 'out'].includes(req.query.stock) ? req.query.stock : null,
    categoryId: req.query.categoryId || null,
    sort: req.query.sort === 'stock_asc' ? 'stock_asc' : req.query.sort || 'stock_asc',
  };
  const result = products.search(filters, { publishedOnly: false, admin: true, limit, offset });
  const summary = get(
    `SELECT COUNT(*) AS products, COALESCE(SUM(stock), 0) AS units,
       COALESCE(SUM(stock * COALESCE(sale_price, price)), 0) AS value,
       SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS out_of_stock,
       SUM(CASE WHEN stock > 0 AND stock <= low_stock_threshold THEN 1 ELSE 0 END) AS low_stock
     FROM products WHERE status != 'archived'`,
  );
  res.json({
    ...result,
    page,
    limit,
    pages: Math.max(1, Math.ceil(result.total / limit)),
    summary: {
      products: summary.products,
      units: summary.units,
      value: summary.value / 100,
      outOfStock: summary.out_of_stock || 0,
      lowStock: summary.low_stock || 0,
    },
  });
});

inventory.post('/:id/adjust', validate(S.stockAdjust), (req, res) => {
  const { mode, quantity, reason, note } = req.body;
  const result = products.adjustStock(Number(req.params.id), {
    delta: mode === 'add' ? quantity : mode === 'remove' ? -quantity : undefined,
    set: mode === 'set' ? quantity : undefined,
    reason: mode === 'add' && reason === 'adjustment' ? 'restock' : reason,
    note,
    userId: req.user.id,
  });
  res.json(result);
});

inventory.patch(
  '/:id/threshold',
  validate(z.object({ lowStockThreshold: z.coerce.number().int().min(0).max(10000) })),
  (req, res) => {
    const r = run('UPDATE products SET low_stock_threshold = ? WHERE id = ?', req.body.lowStockThreshold, Number(req.params.id));
    if (!Number(r.changes)) throw notFound('Product not found');
    res.json({ ok: true });
  },
);

inventory.get('/history', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 30 });
  const where = req.query.productId ? 'WHERE m.product_id = ?' : '';
  const params = req.query.productId ? [Number(req.query.productId)] : [];
  const total = get(`SELECT COUNT(*) AS n FROM inventory_movements m ${where}`, ...params).n;
  const rows = all(
    `SELECT m.*, p.name AS product_name, p.sku, u.name AS user_name, o.order_number
     FROM inventory_movements m
     JOIN products p ON p.id = m.product_id
     LEFT JOIN users u ON u.id = m.user_id
     LEFT JOIN orders o ON o.id = m.order_id
     ${where} ORDER BY m.created_at DESC, m.id DESC LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
  res.json({
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    items: rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      sku: r.sku,
      change: r.change,
      stockAfter: r.stock_after,
      reason: r.reason,
      note: r.note,
      orderNumber: r.order_number,
      user: r.user_name,
      createdAt: r.created_at,
    })),
  });
});

// ------------------------------------------------------------------ uploads

const uploads = express.Router();
uploads.post('/', imageUpload, (req, res) => {
  if (!req.uploaded?.length) throw badRequest('Choose at least one image to upload');
  res.status(201).json({ files: req.uploaded });
});

module.exports = { categories, inventory, uploads };
