const express = require('express');
const { all, get, run } = require('../../db');
const { validate } = require('../../middleware/validate');
const { requireAdmin } = require('../../middleware/auth');
const { notFound, conflict, forbidden } = require('../../lib/errors');
const { paginate, slugify } = require('../../lib/util');
const { removeUploadedFile } = require('../../middleware/upload');
const S = require('../../lib/schemas');
const products = require('../../services/products');
const { z } = require('zod');

const router = express.Router();

router.get('/', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 20 });
  const filters = {
    q: req.query.q ? String(req.query.q) : null,
    categoryId: req.query.categoryId || null,
    status: ['draft', 'published', 'archived'].includes(req.query.status) ? req.query.status : null,
    stock: ['low', 'out'].includes(req.query.stock) ? req.query.stock : null,
    featured: req.query.flag === 'featured',
    bestseller: req.query.flag === 'bestseller',
    sort: products.SORTS[req.query.sort] ? req.query.sort : 'newest',
  };
  const result = products.search(filters, { publishedOnly: false, admin: true, limit, offset });
  const counts = Object.fromEntries(
    all('SELECT status, COUNT(*) AS n FROM products GROUP BY status').map((r) => [r.status, r.n]),
  );
  res.json({ ...result, page, limit, pages: Math.max(1, Math.ceil(result.total / limit)), counts });
});

router.get('/sku-suggestion', (req, res) => {
  const base = slugify(req.query.name || 'GC').replace(/-/g, '').slice(0, 6).toUpperCase() || 'GC';
  let n = get('SELECT COUNT(*) AS n FROM products').n + 1;
  let sku = `GC-${base}-${String(n).padStart(3, '0')}`;
  while (get('SELECT id FROM products WHERE sku = ?', sku)) sku = `GC-${base}-${String(++n).padStart(3, '0')}`;
  res.json({ sku });
});

router.get('/:id', (req, res) => {
  res.json(products.findOne(Number(req.params.id), { publishedOnly: false, admin: true }));
});

router.post('/', validate(S.productCreate), (req, res) => {
  res.status(201).json(products.create(req.body, req.user.id));
});

router.put('/:id', validate(S.productUpdate), (req, res) => {
  const id = Number(req.params.id);
  const before = products.imagesFor([id]).get(id) || [];
  const updated = products.update(id, req.body, req.user.id);
  if (req.body.images) {
    const keep = new Set(req.body.images.map((i) => i.url));
    before.filter((i) => !keep.has(i.url)).forEach((i) => removeUploadedFile(i.url));
  }
  res.json(updated);
});

router.patch('/:id/status', validate(S.productStatus), (req, res) => {
  const id = Number(req.params.id);
  const p = get('SELECT id FROM products WHERE id = ?', id);
  if (!p) throw notFound('Product not found');
  if (req.body.status === 'published') {
    const hasImage = get('SELECT 1 AS ok FROM product_images WHERE product_id = ? LIMIT 1', id);
    if (!hasImage) throw conflict('Add at least one image before publishing this product');
  }
  res.json(products.update(id, { status: req.body.status }, req.user.id));
});

router.post(
  '/bulk',
  validate(
    z.object({
      ids: z.array(z.coerce.number().int().positive()).min(1).max(200),
      action: z.enum(['publish', 'unpublish', 'archive', 'delete']),
    }),
  ),
  (req, res) => {
    const { ids, action } = req.body;
    if (action === 'delete' && req.user.role !== 'admin') throw forbidden('Only admins can delete products');
    let affected = 0;
    for (const id of ids) {
      if (action === 'delete') {
        affected += deleteProduct(id) ? 1 : 0;
      } else {
        const status = action === 'publish' ? 'published' : action === 'unpublish' ? 'draft' : 'archived';
        if (status === 'published' && !get('SELECT 1 AS ok FROM product_images WHERE product_id = ?', id)) continue;
        affected += Number(run('UPDATE products SET status = ? WHERE id = ?', status, id).changes);
      }
    }
    res.json({ affected });
  },
);

function deleteProduct(id) {
  const imgs = all('SELECT url FROM product_images WHERE product_id = ?', id);
  const r = run('DELETE FROM products WHERE id = ?', id);
  if (Number(r.changes)) imgs.forEach((i) => removeUploadedFile(i.url));
  return Number(r.changes) > 0;
}

// Deleting is admin-only. Products with order history keep their order line snapshots (product_id becomes NULL).
router.delete('/:id', requireAdmin('admin'), (req, res) => {
  if (!deleteProduct(Number(req.params.id))) throw notFound('Product not found');
  res.status(204).end();
});

module.exports = router;
