const { all, get, run, now, transaction } = require('../db');
const { toMajor, toMinor, parseJson, slugify } = require('../lib/util');
const { notFound, conflict } = require('../lib/errors');

function stockStatus(p) {
  if (p.stock <= 0) return 'out_of_stock';
  if (p.stock <= p.low_stock_threshold) return 'low_stock';
  return 'in_stock';
}

function imagesFor(ids) {
  if (!ids.length) return new Map();
  const rows = all(
    `SELECT id, product_id, url, alt FROM product_images
     WHERE product_id IN (${ids.map(() => '?').join(',')})
     ORDER BY sort_order, id`,
    ...ids,
  );
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.product_id)) map.set(r.product_id, []);
    map.get(r.product_id).push({ id: r.id, url: r.url, alt: r.alt || '' });
  }
  return map;
}

/** Shape a DB row for API output. `admin` adds operational fields. */
function toDTO(row, images = [], { admin = false } = {}) {
  const price = toMajor(row.price);
  const salePrice = row.sale_price != null && row.sale_price < row.price ? toMajor(row.sale_price) : null;
  const effective = salePrice ?? price;
  const status = stockStatus(row);
  const dto = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || '',
    description: row.description || '',
    price,
    salePrice,
    effectivePrice: effective,
    discountPercent: salePrice ? Math.round(((price - salePrice) / price) * 100) : 0,
    category: row.category_id
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
    material: row.material || '',
    frameShape: row.frame_shape || '',
    gender: row.gender,
    colors: parseJson(row.colors, []),
    sku: row.sku,
    stockStatus: status,
    stockLeft: status === 'low_stock' ? row.stock : undefined,
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    images,
    soldCount: row.sold_count ?? undefined,
    createdAt: row.created_at,
  };
  if (admin) {
    Object.assign(dto, {
      stock: row.stock,
      lowStockThreshold: row.low_stock_threshold,
      status: row.status,
      updatedAt: row.updated_at,
      categoryId: row.category_id,
    });
  }
  return dto;
}

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug,
    COALESCE((
      SELECT SUM(oi.quantity) FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = p.id AND o.status NOT IN ('cancelled', 'refunded')
    ), 0) AS sold_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id`;

const SORTS = {
  newest: 'p.created_at DESC, p.id DESC',
  price_asc: 'COALESCE(p.sale_price, p.price) ASC',
  price_desc: 'COALESCE(p.sale_price, p.price) DESC',
  popular: 'sold_count DESC, p.is_bestseller DESC, p.id DESC',
  name: 'p.name COLLATE NOCASE ASC',
  stock_asc: 'p.stock ASC',
  featured: 'p.is_featured DESC, p.is_bestseller DESC, p.created_at DESC',
};

/**
 * Flexible product search used by both storefront (publishedOnly) and admin.
 * Filters: q, category (slug), categoryId, colors[], materials[], genders[], minPrice, maxPrice,
 *          featured, bestseller, onSale, inStock, status, stock (low|out)
 */
function search(filters = {}, { publishedOnly = true, admin = false, limit = 24, offset = 0 } = {}) {
  const where = [];
  const params = [];

  if (publishedOnly) where.push("p.status = 'published'");
  else if (filters.status) {
    where.push('p.status = ?');
    params.push(filters.status);
  }
  if (filters.q) {
    where.push('(p.name LIKE ? OR p.tagline LIKE ? OR p.sku LIKE ? OR p.material LIKE ? OR c.name LIKE ?)');
    const like = `%${filters.q}%`;
    params.push(like, like, like, like, like);
  }
  if (filters.category) {
    where.push('c.slug = ?');
    params.push(filters.category);
  }
  if (filters.categoryId) {
    where.push('p.category_id = ?');
    params.push(Number(filters.categoryId));
  }
  if (filters.colors?.length) {
    where.push(
      `EXISTS (SELECT 1 FROM json_each(p.colors) je WHERE lower(json_extract(je.value, '$.name')) IN (${filters.colors
        .map(() => '?')
        .join(',')}))`,
    );
    params.push(...filters.colors.map((c) => c.toLowerCase()));
  }
  if (filters.materials?.length) {
    where.push(`lower(p.material) IN (${filters.materials.map(() => '?').join(',')})`);
    params.push(...filters.materials.map((m) => m.toLowerCase()));
  }
  if (filters.shapes?.length) {
    where.push(`lower(p.frame_shape) IN (${filters.shapes.map(() => '?').join(',')})`);
    params.push(...filters.shapes.map((s) => s.toLowerCase()));
  }
  if (filters.genders?.length) {
    where.push(`p.gender IN (${filters.genders.map(() => '?').join(',')})`);
    params.push(...filters.genders);
  }
  if (filters.minPrice != null) {
    where.push('COALESCE(p.sale_price, p.price) >= ?');
    params.push(toMinor(filters.minPrice));
  }
  if (filters.maxPrice != null) {
    where.push('COALESCE(p.sale_price, p.price) <= ?');
    params.push(toMinor(filters.maxPrice));
  }
  if (filters.featured) where.push('p.is_featured = 1');
  if (filters.bestseller) where.push('p.is_bestseller = 1');
  if (filters.onSale) where.push('p.sale_price IS NOT NULL AND p.sale_price < p.price');
  if (filters.inStock) where.push('p.stock > 0');
  if (filters.stock === 'out') where.push('p.stock <= 0');
  if (filters.stock === 'low') where.push('p.stock > 0 AND p.stock <= p.low_stock_threshold');
  if (filters.excludeId) {
    where.push('p.id != ?');
    params.push(Number(filters.excludeId));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = SORTS[filters.sort] || SORTS.featured;

  const total = get(
    `SELECT COUNT(*) AS n FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`,
    ...params,
  ).n;
  const rows = all(`${BASE_SELECT} ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`, ...params, limit, offset);
  const imgs = imagesFor(rows.map((r) => r.id));
  return { total, items: rows.map((r) => toDTO(r, imgs.get(r.id) || [], { admin })) };
}

function findRow(idOrSlug) {
  const isId = /^\d+$/.test(String(idOrSlug));
  return get(`${BASE_SELECT} WHERE ${isId ? 'p.id = ?' : 'p.slug = ?'}`, isId ? Number(idOrSlug) : idOrSlug);
}

function findOne(idOrSlug, { publishedOnly = true, admin = false } = {}) {
  const row = findRow(idOrSlug);
  if (!row || (publishedOnly && row.status !== 'published')) throw notFound('Product not found');
  return toDTO(row, imagesFor([row.id]).get(row.id) || [], { admin });
}

/** Facets for filter UI computed from published catalogue. */
function facets() {
  const published = "status = 'published'";
  const materials = all(
    `SELECT material AS value, COUNT(*) AS count FROM products WHERE ${published} AND material IS NOT NULL AND material != '' GROUP BY lower(material) ORDER BY count DESC`,
  );
  const colors = all(
    `SELECT json_extract(je.value, '$.name') AS name, json_extract(je.value, '$.hex') AS hex, COUNT(DISTINCT p.id) AS count
     FROM products p, json_each(p.colors) je WHERE p.${published}
     GROUP BY lower(json_extract(je.value, '$.name')) ORDER BY count DESC`,
  );
  const price = get(
    `SELECT MIN(COALESCE(sale_price, price)) AS min, MAX(COALESCE(sale_price, price)) AS max FROM products WHERE ${published}`,
  );
  const shapes = all(
    `SELECT frame_shape AS value, COUNT(*) AS count FROM products WHERE ${published} AND frame_shape IS NOT NULL AND frame_shape != '' GROUP BY lower(frame_shape) ORDER BY count DESC`,
  );
  const genders = all(`SELECT gender AS value, COUNT(*) AS count FROM products WHERE ${published} GROUP BY gender`);
  return {
    materials,
    shapes,
    colors,
    genders,
    price: { min: toMajor(price?.min ?? 0), max: toMajor(price?.max ?? 0) },
  };
}

function uniqueSlug(base, excludeId) {
  let slug = slugify(base);
  let n = 1;
  while (get('SELECT id FROM products WHERE slug = ? AND id != ?', slug, excludeId || 0)) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

function writeImages(productId, images) {
  run('DELETE FROM product_images WHERE product_id = ?', productId);
  images.forEach((img, i) => {
    run(
      'INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)',
      productId,
      img.url,
      img.alt || null,
      i,
    );
  });
}

function recordMovement({ productId, change, stockAfter, reason, note, orderId, userId }) {
  run(
    `INSERT INTO inventory_movements (product_id, change, stock_after, reason, note, order_id, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    productId,
    change,
    stockAfter,
    reason,
    note || null,
    orderId || null,
    userId || null,
  );
}

/** Create a product from validated admin input (major-unit prices). */
function create(input, userId) {
  return transaction(() => {
    if (get('SELECT id FROM products WHERE sku = ?', input.sku)) {
      throw conflict('SKU already exists', { fields: { sku: 'This SKU is already used by another product' } });
    }
    const slug = uniqueSlug(input.slug || input.name);
    const res = run(
      `INSERT INTO products (name, slug, tagline, description, price, sale_price, category_id, material, frame_shape,
        gender, colors, sku, stock, low_stock_threshold, status, is_featured, is_bestseller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.name,
      slug,
      input.tagline || null,
      input.description || null,
      toMinor(input.price),
      input.salePrice != null ? toMinor(input.salePrice) : null,
      input.categoryId || null,
      input.material || null,
      input.frameShape || null,
      input.gender,
      JSON.stringify(input.colors || []),
      input.sku,
      input.stock,
      input.lowStockThreshold,
      input.status,
      input.isFeatured ? 1 : 0,
      input.isBestseller ? 1 : 0,
    );
    const id = Number(res.lastInsertRowid);
    writeImages(id, input.images || []);
    if (input.stock > 0) {
      recordMovement({ productId: id, change: input.stock, stockAfter: input.stock, reason: 'initial', userId });
    }
    return findOne(id, { publishedOnly: false, admin: true });
  });
}

function update(id, input, userId) {
  return transaction(() => {
    const existing = get('SELECT * FROM products WHERE id = ?', id);
    if (!existing) throw notFound('Product not found');
    if (input.sku && get('SELECT id FROM products WHERE sku = ? AND id != ?', input.sku, id)) {
      throw conflict('SKU already exists', { fields: { sku: 'This SKU is already used by another product' } });
    }
    const merged = {
      name: input.name ?? existing.name,
      slug: input.slug ? uniqueSlug(input.slug, id) : existing.slug,
      tagline: input.tagline !== undefined ? input.tagline : existing.tagline,
      description: input.description !== undefined ? input.description : existing.description,
      price: input.price !== undefined ? toMinor(input.price) : existing.price,
      sale_price:
        input.salePrice !== undefined ? (input.salePrice == null ? null : toMinor(input.salePrice)) : existing.sale_price,
      category_id: input.categoryId !== undefined ? input.categoryId : existing.category_id,
      material: input.material !== undefined ? input.material : existing.material,
      frame_shape: input.frameShape !== undefined ? input.frameShape : existing.frame_shape,
      gender: input.gender ?? existing.gender,
      colors: input.colors ? JSON.stringify(input.colors) : existing.colors,
      sku: input.sku ?? existing.sku,
      stock: input.stock ?? existing.stock,
      low_stock_threshold: input.lowStockThreshold ?? existing.low_stock_threshold,
      status: input.status ?? existing.status,
      is_featured: input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : existing.is_featured,
      is_bestseller: input.isBestseller !== undefined ? (input.isBestseller ? 1 : 0) : existing.is_bestseller,
    };
    run(
      `UPDATE products SET name = ?, slug = ?, tagline = ?, description = ?, price = ?, sale_price = ?, category_id = ?,
        material = ?, frame_shape = ?, gender = ?, colors = ?, sku = ?, stock = ?, low_stock_threshold = ?, status = ?,
        is_featured = ?, is_bestseller = ?, updated_at = ? WHERE id = ?`,
      merged.name,
      merged.slug,
      merged.tagline,
      merged.description,
      merged.price,
      merged.sale_price,
      merged.category_id,
      merged.material,
      merged.frame_shape,
      merged.gender,
      merged.colors,
      merged.sku,
      merged.stock,
      merged.low_stock_threshold,
      merged.status,
      merged.is_featured,
      merged.is_bestseller,
      now(),
      id,
    );
    if (merged.stock !== existing.stock) {
      recordMovement({
        productId: id,
        change: merged.stock - existing.stock,
        stockAfter: merged.stock,
        reason: 'adjustment',
        note: 'Updated from product editor',
        userId,
      });
    }
    if (input.images) writeImages(id, input.images);
    return findOne(id, { publishedOnly: false, admin: true });
  });
}

/** Adjust stock by delta (or set absolute) and log the movement. */
function adjustStock(id, { delta, set, reason = 'adjustment', note, userId, orderId }) {
  return transaction(() => {
    const p = get('SELECT id, stock FROM products WHERE id = ?', id);
    if (!p) throw notFound('Product not found');
    const next = set != null ? set : p.stock + delta;
    if (next < 0) throw conflict('Stock cannot go below zero');
    run('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?', next, now(), id);
    recordMovement({ productId: id, change: next - p.stock, stockAfter: next, reason, note, userId, orderId });
    return { id, stock: next };
  });
}

module.exports = {
  search,
  findOne,
  findRow,
  facets,
  create,
  update,
  adjustStock,
  recordMovement,
  imagesFor,
  stockStatus,
  toDTO,
  SORTS,
};
