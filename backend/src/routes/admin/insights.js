/**
 * Dashboard + analytics. Every number here is computed live from orders/products in the database.
 * "Net sales" = order totals minus refunds, excluding cancelled and fully refunded orders.
 */
const express = require('express');
const { all, get } = require('../../db');
const { toMajor } = require('../../lib/util');
const ordersSvc = require('../../services/orders');

// Store operates in India — group by IST calendar day.
const LOCAL_DAY = "date(o.created_at, '+5 hours', '+30 minutes')";
const LOCAL_MONTH = "strftime('%Y-%m', o.created_at, '+5 hours', '+30 minutes')";
const COUNTED = "o.status NOT IN ('cancelled', 'refunded')";
const NET = 'o.total - o.refunded_amount';

function istDate(d) {
  return new Date(d.getTime() + 330 * 60000).toISOString().slice(0, 10);
}

function dailySeries(days) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const rows = all(
    `SELECT ${LOCAL_DAY} AS day, COUNT(*) AS orders, COALESCE(SUM(${NET}), 0) AS revenue
     FROM orders o WHERE ${COUNTED} AND o.created_at >= ? GROUP BY day`,
    since,
  );
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = istDate(new Date(Date.now() - i * 86400000));
    const r = byDay.get(key);
    out.push({ date: key, orders: r?.orders || 0, revenue: toMajor(r?.revenue || 0) });
  }
  return out;
}

function monthlySeries(months) {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1), 1);
  const rows = all(
    `SELECT ${LOCAL_MONTH} AS month, COUNT(*) AS orders, COALESCE(SUM(${NET}), 0) AS revenue
     FROM orders o WHERE ${COUNTED} AND o.created_at >= ? GROUP BY month`,
    start.toISOString(),
  );
  const byMonth = new Map(rows.map((r) => [r.month, r]));
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const r = byMonth.get(key);
    out.push({ date: key, orders: r?.orders || 0, revenue: toMajor(r?.revenue || 0) });
  }
  return out;
}

function periodKpis(fromIso, toIso) {
  const r = get(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(${NET}), 0) AS revenue, COALESCE(SUM(oi.units), 0) AS units
     FROM orders o LEFT JOIN (SELECT order_id, SUM(quantity) AS units FROM order_items GROUP BY order_id) oi ON oi.order_id = o.id
     WHERE ${COUNTED} AND o.created_at >= ? AND o.created_at < ?`,
    fromIso,
    toIso,
  );
  const customers = get('SELECT COUNT(*) AS n FROM customers WHERE created_at >= ? AND created_at < ?', fromIso, toIso).n;
  const cancelled = get(
    "SELECT COUNT(*) AS n FROM orders WHERE status = 'cancelled' AND created_at >= ? AND created_at < ?",
    fromIso,
    toIso,
  ).n;
  return {
    revenue: toMajor(r.revenue),
    orders: r.orders,
    units: r.units,
    averageOrderValue: r.orders ? toMajor(Math.round(r.revenue / r.orders)) : 0,
    newCustomers: customers,
    cancelled,
  };
}

function topProducts({ sinceIso, limit = 5 } = {}) {
  const rows = all(
    `SELECT oi.product_id, oi.name, MAX(oi.image) AS image, SUM(oi.quantity) AS units, SUM(oi.line_total) AS revenue,
       p.stock, p.slug
     FROM order_items oi JOIN orders o ON o.id = oi.order_id LEFT JOIN products p ON p.id = oi.product_id
     WHERE ${COUNTED} ${sinceIso ? 'AND o.created_at >= ?' : ''}
     GROUP BY COALESCE(oi.product_id, oi.name) ORDER BY units DESC, revenue DESC LIMIT ?`,
    ...(sinceIso ? [sinceIso] : []),
    limit,
  );
  return rows.map((r) => ({
    productId: r.product_id,
    name: r.name,
    image: r.image,
    units: r.units,
    revenue: toMajor(r.revenue),
    stock: r.stock,
  }));
}

const router = express.Router();

router.get('/dashboard', (req, res) => {
  const totals = get(
    `SELECT COALESCE(SUM(CASE WHEN ${COUNTED} THEN ${NET} ELSE 0 END), 0) AS revenue, COUNT(*) AS orders,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN o.status IN ('confirmed', 'processing') THEN 1 ELSE 0 END) AS to_fulfil
     FROM orders o`,
  );
  const productCounts = get(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
       SUM(CASE WHEN stock <= 0 AND status != 'archived' THEN 1 ELSE 0 END) AS out_of_stock,
       SUM(CASE WHEN stock > 0 AND stock <= low_stock_threshold AND status != 'archived' THEN 1 ELSE 0 END) AS low_stock
     FROM products`,
  );
  const customers = get('SELECT COUNT(*) AS n FROM customers').n;

  const thirty = new Date(Date.now() - 30 * 86400000).toISOString();
  const sixty = new Date(Date.now() - 60 * 86400000).toISOString();
  const nowIso = new Date().toISOString();
  const current = periodKpis(thirty, nowIso);
  const previous = periodKpis(sixty, thirty);

  const lowStock = all(
    `SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
       (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
     FROM products p WHERE p.status != 'archived' AND p.stock <= p.low_stock_threshold ORDER BY p.stock ASC LIMIT 6`,
  ).map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, threshold: p.low_stock_threshold, image: p.image }));

  const recent = all(
    `SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o ORDER BY o.created_at DESC LIMIT 6`,
  ).map((o) => ordersSvc.orderDTO(o));

  const statusBreakdown = all('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');

  res.json({
    totals: {
      revenue: toMajor(totals.revenue),
      orders: totals.orders,
      pendingOrders: totals.pending || 0,
      toFulfil: totals.to_fulfil || 0,
      products: productCounts.total,
      publishedProducts: productCounts.published || 0,
      customers,
      lowStock: productCounts.low_stock || 0,
      outOfStock: productCounts.out_of_stock || 0,
    },
    last30: current,
    previous30: previous,
    series: dailySeries(30),
    recentOrders: recent,
    lowStockProducts: lowStock,
    bestSellers: topProducts({ limit: 5 }),
    statusBreakdown,
  });
});

router.get('/analytics', (req, res) => {
  const range = ['7d', '30d', '90d', '12m'].includes(req.query.range) ? req.query.range : '30d';
  const days = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }[range];
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const prevSince = new Date(Date.now() - 2 * days * 86400000).toISOString();
  const nowIso = new Date().toISOString();

  const series = range === '12m' ? monthlySeries(12) : dailySeries(days);

  const byCategory = all(
    `SELECT COALESCE(c.name, 'Uncategorised') AS name, SUM(oi.quantity) AS units, SUM(oi.line_total) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     LEFT JOIN products p ON p.id = oi.product_id LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${COUNTED} AND o.created_at >= ? GROUP BY c.id ORDER BY revenue DESC`,
    since,
  ).map((r) => ({ name: r.name, units: r.units, revenue: toMajor(r.revenue) }));

  const byStatus = all(
    'SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS value FROM orders WHERE created_at >= ? GROUP BY status',
    since,
  ).map((r) => ({ status: r.status, count: r.count, value: toMajor(r.value) }));

  const byPayment = all(
    `SELECT payment_method AS method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS value FROM orders o
     WHERE ${COUNTED} AND o.created_at >= ? GROUP BY payment_method`,
    since,
  ).map((r) => ({ method: r.method, count: r.count, value: toMajor(r.value) }));

  const topCustomers = all(
    `SELECT c.id, c.name, c.email, COUNT(o.id) AS orders, SUM(${NET}) AS spent
     FROM orders o JOIN customers c ON c.id = o.customer_id
     WHERE ${COUNTED} AND o.created_at >= ? GROUP BY c.id ORDER BY spent DESC LIMIT 5`,
    since,
  ).map((r) => ({ id: r.id, name: r.name, email: r.email, orders: r.orders, spent: toMajor(r.spent) }));

  const buyers = get(
    `SELECT COUNT(*) AS buyers, SUM(CASE WHEN n > 1 THEN 1 ELSE 0 END) AS repeat FROM (
       SELECT customer_id, COUNT(*) AS n FROM orders o WHERE ${COUNTED} AND o.created_at >= ? GROUP BY customer_id)`,
    since,
  );

  const productPerformance = all(
    `SELECT p.id, p.name, p.sku, p.stock, c.name AS category,
       COALESCE(SUM(CASE WHEN ${COUNTED} AND o.created_at >= ? THEN oi.quantity END), 0) AS units,
       COALESCE(SUM(CASE WHEN ${COUNTED} AND o.created_at >= ? THEN oi.line_total END), 0) AS revenue
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id
     WHERE p.status != 'archived' GROUP BY p.id ORDER BY revenue DESC, units DESC`,
    since,
    since,
  ).map((r) => ({ id: r.id, name: r.name, sku: r.sku, category: r.category, stock: r.stock, units: r.units, revenue: toMajor(r.revenue) }));

  res.json({
    range,
    kpis: periodKpis(since, nowIso),
    previous: periodKpis(prevSince, since),
    series,
    byCategory,
    byStatus,
    byPayment,
    topProducts: topProducts({ sinceIso: since, limit: 8 }),
    productPerformance,
    customers: {
      total: get('SELECT COUNT(*) AS n FROM customers').n,
      registered: get('SELECT COUNT(*) AS n FROM customers WHERE user_id IS NOT NULL').n,
      buyers: buyers.buyers || 0,
      repeatBuyers: buyers.repeat || 0,
      repeatRate: buyers.buyers ? Math.round(((buyers.repeat || 0) / buyers.buyers) * 100) : 0,
      top: topCustomers,
      newsletter: get('SELECT COUNT(*) AS n FROM newsletter_subscribers').n,
    },
  });
});

module.exports = router;
