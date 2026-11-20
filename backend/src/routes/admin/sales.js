/** Orders, customers and discounts. */
const express = require('express');
const { all, get, run, now } = require('../../db');
const { validate } = require('../../middleware/validate');
const { requireAdmin } = require('../../middleware/auth');
const { notFound } = require('../../lib/errors');
const { paginate, toMajor, toMinor } = require('../../lib/util');
const S = require('../../lib/schemas');
const orders = require('../../services/orders');

// ------------------------------------------------------------------ orders

const ordersRouter = express.Router();

ordersRouter.get('/', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 20 });
  const where = [];
  const params = [];
  if (orders.STATUSES.includes(req.query.status)) {
    where.push('o.status = ?');
    params.push(req.query.status);
  }
  if (['pending', 'paid', 'failed', 'refunded', 'partially_refunded'].includes(req.query.paymentStatus)) {
    where.push('o.payment_status = ?');
    params.push(req.query.paymentStatus);
  }
  if (['cod', 'razorpay'].includes(req.query.paymentMethod)) {
    where.push('o.payment_method = ?');
    params.push(req.query.paymentMethod);
  }
  if (req.query.q) {
    where.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.email LIKE ? OR o.phone LIKE ?)');
    const like = `%${String(req.query.q).trim()}%`;
    params.push(like, like, like, like);
  }
  if (req.query.from) {
    where.push('o.created_at >= ?');
    params.push(new Date(req.query.from).toISOString());
  }
  if (req.query.to) {
    const to = new Date(req.query.to);
    to.setHours(23, 59, 59, 999);
    where.push('o.created_at <= ?');
    params.push(to.toISOString());
  }
  if (req.query.customerId) {
    where.push('o.customer_id = ?');
    params.push(Number(req.query.customerId));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sort = { oldest: 'o.created_at ASC', total_desc: 'o.total DESC', total_asc: 'o.total ASC' }[req.query.sort] || 'o.created_at DESC';
  const total = get(`SELECT COUNT(*) AS n FROM orders o ${whereSql}`, ...params).n;
  const rows = all(
    `SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o ${whereSql} ORDER BY ${sort} LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
  const counts = Object.fromEntries(all('SELECT status, COUNT(*) AS n FROM orders GROUP BY status').map((r) => [r.status, r.n]));
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0);
  res.json({
    items: rows.map((o) => orders.orderDTO(o, { admin: true })),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts,
  });
});

ordersRouter.get('/export.csv', (req, res) => {
  const rows = all('SELECT * FROM orders ORDER BY created_at DESC');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Order', 'Date', 'Customer', 'Email', 'Phone', 'Status', 'Payment', 'Payment status', 'Subtotal', 'Discount', 'Shipping', 'Tax', 'Total', 'Refunded'];
  const lines = rows.map((o) =>
    [o.order_number, o.created_at, o.customer_name, o.email, o.phone, o.status, o.payment_method, o.payment_status,
      toMajor(o.subtotal), toMajor(o.discount_total), toMajor(o.shipping_total), toMajor(o.tax_total), toMajor(o.total), toMajor(o.refunded_amount)]
      .map(esc)
      .join(','),
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="getchasma-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send([header.map(esc).join(','), ...lines].join('\n'));
});

ordersRouter.get('/:id', (req, res) => {
  const order = orders.getOrder(Number(req.params.id), { admin: true });
  const customer = order.customerId
    ? get(
        `SELECT c.id, c.name, c.email, c.phone, c.user_id, c.created_at,
           (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) AS order_count,
           (SELECT COALESCE(SUM(total - refunded_amount), 0) FROM orders WHERE customer_id = c.id AND status NOT IN ('cancelled','refunded')) AS spent
         FROM customers c WHERE c.id = ?`,
        order.customerId,
      )
    : null;
  res.json({
    ...order,
    customer: customer && {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      hasAccount: Boolean(customer.user_id),
      orderCount: customer.order_count,
      totalSpent: toMajor(customer.spent),
      since: customer.created_at,
    },
  });
});

ordersRouter.patch('/:id/status', validate(S.orderStatus), (req, res) => {
  res.json(orders.updateStatus(Number(req.params.id), req.body, req.user.id));
});

ordersRouter.post('/:id/refund', requireAdmin('admin'), validate(S.orderRefund), async (req, res) => {
  res.json(await orders.refund(Number(req.params.id), req.body, req.user.id));
});

ordersRouter.post('/:id/mark-paid', (req, res) => {
  res.json(orders.markPaid(Number(req.params.id), { txnId: req.body?.txnId }, req.user.id));
});

ordersRouter.post('/:id/notes', validate(S.orderNote), (req, res) => {
  const id = Number(req.params.id);
  if (!get('SELECT id FROM orders WHERE id = ?', id)) throw notFound('Order not found');
  orders.addEvent(id, { type: 'note', message: req.body.note, isPublic: false, userId: req.user.id });
  run('UPDATE orders SET updated_at = ? WHERE id = ?', now(), id);
  res.status(201).json(orders.getOrder(id, { admin: true }));
});

// ------------------------------------------------------------------ customers

const customersRouter = express.Router();

const CUSTOMER_STATS = `
  COUNT(o.id) AS order_count,
  COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','refunded') THEN o.total - o.refunded_amount ELSE 0 END), 0) AS spent,
  MAX(o.created_at) AS last_order_at`;

const customerDTO = (c) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  hasAccount: Boolean(c.user_id),
  notes: c.notes,
  orderCount: c.order_count,
  totalSpent: toMajor(c.spent),
  averageOrder: c.order_count ? toMajor(Math.round(c.spent / c.order_count)) : 0,
  lastOrderAt: c.last_order_at,
  createdAt: c.created_at,
});

customersRouter.get('/', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 20 });
  const where = [];
  const params = [];
  if (req.query.q) {
    where.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)');
    const like = `%${String(req.query.q).trim()}%`;
    params.push(like, like, like);
  }
  if (req.query.type === 'registered') where.push('c.user_id IS NOT NULL');
  if (req.query.type === 'guest') where.push('c.user_id IS NULL');
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sort = { spent: 'spent DESC', orders: 'order_count DESC', recent: 'last_order_at DESC', name: 'c.name COLLATE NOCASE' }[req.query.sort] || 'c.created_at DESC';
  const total = get(`SELECT COUNT(*) AS n FROM customers c ${whereSql}`, ...params).n;
  const rows = all(
    `SELECT c.*, ${CUSTOMER_STATS} FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
     ${whereSql} GROUP BY c.id ORDER BY ${sort} LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
  res.json({ items: rows.map(customerDTO), total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
});

customersRouter.get('/:id', (req, res) => {
  const c = get(
    `SELECT c.*, ${CUSTOMER_STATS} FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE c.id = ? GROUP BY c.id`,
    Number(req.params.id),
  );
  if (!c) throw notFound('Customer not found');
  const orderRows = all(
    `SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC`,
    c.id,
  );
  const addresses = [...new Set(orderRows.map((o) => o.shipping_address))].slice(0, 3).map((a) => JSON.parse(a));
  const favourite = all(
    `SELECT oi.name, SUM(oi.quantity) AS qty FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.customer_id = ? GROUP BY oi.name ORDER BY qty DESC LIMIT 3`,
    c.id,
  );
  res.json({
    ...customerDTO(c),
    addresses,
    favouriteProducts: favourite,
    orders: orderRows.map((o) => orders.orderDTO(o, { admin: true })),
  });
});

customersRouter.patch('/:id', (req, res) => {
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.slice(0, 2000) : null;
  const r = run('UPDATE customers SET notes = ? WHERE id = ?', notes, Number(req.params.id));
  if (!Number(r.changes)) throw notFound('Customer not found');
  res.json({ ok: true });
});

// ------------------------------------------------------------------ discounts

const discountsRouter = express.Router();

const discountDTO = (d) => {
  const ts = now();
  let state = 'active';
  if (!d.is_active) state = 'disabled';
  else if (d.starts_at && ts < d.starts_at) state = 'scheduled';
  else if (d.ends_at && ts > d.ends_at) state = 'expired';
  else if (d.max_uses != null && d.used_count >= d.max_uses) state = 'exhausted';
  return {
    id: d.id,
    code: d.code,
    description: d.description,
    type: d.type,
    value: d.type === 'fixed' ? toMajor(d.value) : d.value,
    minOrder: toMajor(d.min_order),
    maxUses: d.max_uses,
    usedCount: d.used_count,
    startsAt: d.starts_at,
    endsAt: d.ends_at,
    isActive: Boolean(d.is_active),
    state,
    revenue: d.revenue != null ? toMajor(d.revenue) : undefined,
    createdAt: d.created_at,
  };
};

const discountValues = (b) => [
  b.code,
  b.description ?? null,
  b.type,
  b.type === 'fixed' ? toMinor(b.value) : Math.round(b.value),
  toMinor(b.minOrder),
  b.maxUses ?? null,
  b.startsAt ? new Date(b.startsAt).toISOString() : null,
  b.endsAt ? new Date(b.endsAt).toISOString() : null,
  b.isActive ? 1 : 0,
];

discountsRouter.get('/', (req, res) => {
  const rows = all(
    `SELECT d.*, (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.discount_code = d.code AND o.status NOT IN ('cancelled','refunded')) AS revenue
     FROM discounts d ORDER BY d.created_at DESC`,
  );
  res.json(rows.map(discountDTO));
});

discountsRouter.post('/', validate(S.discount), (req, res) => {
  const r = run(
    `INSERT INTO discounts (code, description, type, value, min_order, max_uses, starts_at, ends_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...discountValues(req.body),
  );
  res.status(201).json(discountDTO(get('SELECT * FROM discounts WHERE id = ?', r.lastInsertRowid)));
});

discountsRouter.put('/:id', validate(S.discount), (req, res) => {
  const id = Number(req.params.id);
  const r = run(
    `UPDATE discounts SET code = ?, description = ?, type = ?, value = ?, min_order = ?, max_uses = ?, starts_at = ?,
       ends_at = ?, is_active = ? WHERE id = ?`,
    ...discountValues(req.body),
    id,
  );
  if (!Number(r.changes)) throw notFound('Discount not found');
  res.json(discountDTO(get('SELECT * FROM discounts WHERE id = ?', id)));
});

discountsRouter.patch('/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const r = run('UPDATE discounts SET is_active = 1 - is_active WHERE id = ?', id);
  if (!Number(r.changes)) throw notFound('Discount not found');
  res.json(discountDTO(get('SELECT * FROM discounts WHERE id = ?', id)));
});

discountsRouter.delete('/:id', requireAdmin('admin'), (req, res) => {
  const r = run('DELETE FROM discounts WHERE id = ?', Number(req.params.id));
  if (!Number(r.changes)) throw notFound('Discount not found');
  res.status(204).end();
});

module.exports = { orders: ordersRouter, customers: customersRouter, discounts: discountsRouter };
