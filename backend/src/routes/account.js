/** Customer accounts: registration, sessions, profile, order history and wishlist. */
const express = require('express');
const password = require('../lib/password');
const rateLimit = require('express-rate-limit');
const { all, get, run, now } = require('../db');
const { validate } = require('../middleware/validate');
const { issueSession, clearSession, requireCustomer, optionalCustomer } = require('../middleware/auth');
const { badRequest, conflict, unauthorized, notFound } = require('../lib/errors');
const S = require('../lib/schemas');
const orders = require('../services/orders');
const products = require('../services/products');
const { z } = require('zod');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone });

router.get('/me', optionalCustomer, (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.post('/register', authLimiter, validate(S.register), async (req, res) => {
  const { name, email, phone } = req.body;
  if (get('SELECT id FROM users WHERE email = ?', email)) {
    throw conflict('An account with this email already exists', { fields: { email: 'Already registered. Try signing in' } });
  }
  const hash = await password.hash(req.body.password);
  const r = run("INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, 'customer')", email, hash, name, phone);
  const userId = Number(r.lastInsertRowid);
  orders.upsertCustomer({ email, name, phone, userId });
  const user = get('SELECT * FROM users WHERE id = ?', userId);
  issueSession(res, user, 'customer');
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', authLimiter, validate(S.login), async (req, res) => {
  const user = get("SELECT * FROM users WHERE email = ? AND role = 'customer'", req.body.email);
  const ok = await password.verify(req.body.password, user?.password_hash);
  if (!user || !ok || !user.is_active) throw unauthorized('Incorrect email or password');
  run('UPDATE users SET last_login_at = ? WHERE id = ?', now(), user.id);
  issueSession(res, user, 'customer');
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearSession(res, 'customer');
  res.json({ ok: true });
});

router.put('/profile', requireCustomer, validate(S.profile), (req, res) => {
  run('UPDATE users SET name = ?, phone = ? WHERE id = ?', req.body.name, req.body.phone, req.user.id);
  run('UPDATE customers SET name = ?, phone = ? WHERE user_id = ?', req.body.name, req.body.phone, req.user.id);
  res.json({ user: publicUser(get('SELECT * FROM users WHERE id = ?', req.user.id)) });
});

router.put('/password', requireCustomer, authLimiter, validate(S.changePassword), async (req, res) => {
  const u = get('SELECT password_hash FROM users WHERE id = ?', req.user.id);
  if (!(await password.verify(req.body.currentPassword, u.password_hash))) {
    throw badRequest('Current password is incorrect', { fields: { currentPassword: 'Incorrect password' } });
  }
  run('UPDATE users SET password_hash = ? WHERE id = ?', await password.hash(req.body.newPassword), req.user.id);
  res.json({ ok: true });
});

router.get('/orders', requireCustomer, (req, res) => {
  const rows = all(
    `SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`,
    req.user.id,
  );
  const previews = new Map();
  if (rows.length) {
    const imgs = all(
      `SELECT order_id, image, name FROM order_items WHERE order_id IN (${rows.map(() => '?').join(',')}) ORDER BY id`,
      ...rows.map((r) => r.id),
    );
    for (const i of imgs) {
      if (!previews.has(i.order_id)) previews.set(i.order_id, []);
      previews.get(i.order_id).push({ image: i.image, name: i.name });
    }
  }
  res.json(rows.map((o) => ({ ...orders.orderDTO(o), previews: (previews.get(o.id) || []).slice(0, 4) })));
});

router.get('/orders/:orderNumber', requireCustomer, (req, res) => {
  const o = get('SELECT id, user_id FROM orders WHERE order_number = ?', req.params.orderNumber.toUpperCase());
  if (!o || o.user_id !== req.user.id) throw notFound('Order not found');
  res.json(orders.getOrder(o.id));
});

router.post('/orders/:orderNumber/cancel', requireCustomer, validate(z.object({ reason: z.string().trim().max(300).optional() })), (req, res) => {
  const o = get('SELECT * FROM orders WHERE order_number = ?', req.params.orderNumber.toUpperCase());
  if (!o || o.user_id !== req.user.id) throw notFound('Order not found');
  if (!['pending', 'confirmed'].includes(o.status)) {
    throw badRequest('This order is already being prepared and can no longer be cancelled online. Please contact us.');
  }
  orders.updateStatus(o.id, { status: 'cancelled', cancelReason: req.body.reason || 'Cancelled by customer' }, null);
  res.json(orders.getOrder(o.id));
});

// ------------------------------------------------------------------ wishlist (signed-in customers)

router.get('/wishlist', requireCustomer, (req, res) => {
  const ids = all('SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY created_at DESC', req.user.id).map(
    (r) => r.product_id,
  );
  res.json({ productIds: ids });
});

router.put(
  '/wishlist',
  requireCustomer,
  validate(z.object({ productIds: z.array(z.coerce.number().int().positive()).max(200) })),
  (req, res) => {
    run('DELETE FROM wishlist_items WHERE user_id = ?', req.user.id);
    for (const id of new Set(req.body.productIds)) {
      if (products.findRow(id)) run('INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)', req.user.id, id);
    }
    const ids = all('SELECT product_id FROM wishlist_items WHERE user_id = ?', req.user.id).map((r) => r.product_id);
    res.json({ productIds: ids });
  },
);

module.exports = router;
