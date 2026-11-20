/** Public storefront API: catalogue, settings, newsletter, checkout and order tracking. */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { all, get, run } = require('../db');
const { validate } = require('../middleware/validate');
const { optionalCustomer } = require('../middleware/auth');
const { badRequest, notFound } = require('../lib/errors');
const { paginate, bool, toMajor } = require('../lib/util');
const S = require('../lib/schemas');
const products = require('../services/products');
const orders = require('../services/orders');
const payments = require('../services/payments');
const settings = require('../services/settings');

const router = express.Router();

const list = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const num = (v) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

function parseProductFilters(q) {
  return {
    q: q.q ? String(q.q).slice(0, 100) : null,
    category: q.category ? String(q.category) : null,
    colors: list(q.colors),
    materials: list(q.materials),
    shapes: list(q.shapes),
    genders: list(q.genders).filter((g) => ['men', 'women', 'unisex'].includes(g)),
    minPrice: num(q.minPrice),
    maxPrice: num(q.maxPrice),
    featured: bool(q.featured),
    bestseller: bool(q.bestseller),
    onSale: bool(q.onSale),
    inStock: bool(q.inStock),
    excludeId: num(q.excludeId),
    sort: q.sort ? String(q.sort) : undefined,
  };
}

router.get('/settings', (req, res) => {
  const s = settings.getAll();
  res.json({
    store: s.store,
    branding: s.branding,
    shipping: s.shipping,
    tax: { label: s.tax.label, rate: s.tax.rate, inclusive: s.tax.inclusive },
    testimonials: s.testimonials,
    payments: payments.availableMethods(null),
    razorpayKeyId: payments.razorpayEnabled() ? payments.razorpayKeyId() : null,
  });
});

router.get('/categories', (req, res) => {
  const rows = all(
    `SELECT c.id, c.name, c.slug, c.description, c.image,
       (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published') AS product_count
     FROM categories c WHERE c.is_active = 1 ORDER BY c.sort_order, c.name`,
  );
  res.json(rows.map((r) => ({ ...r, productCount: r.product_count, product_count: undefined })));
});

router.get('/products', (req, res) => {
  const { page, limit, offset } = paginate(req.query, { defaultLimit: 12, maxLimit: 48 });
  const result = products.search(parseProductFilters(req.query), { limit, offset });
  res.json({ ...result, page, limit, pages: Math.max(1, Math.ceil(result.total / limit)) });
});

router.get('/products/facets', (req, res) => res.json(products.facets()));

router.get('/products/:slug', (req, res) => {
  const product = products.findOne(req.params.slug);
  const related = products.search(
    { category: product.category?.slug, excludeId: product.id, sort: 'popular' },
    { limit: 4 },
  ).items;
  if (related.length < 4) {
    const more = products.search(
      { excludeId: product.id, sort: 'popular' },
      { limit: 8 },
    ).items.filter((p) => !related.some((r) => r.id === p.id));
    related.push(...more.slice(0, 4 - related.length));
  }
  res.json({ product, related });
});

/** Lightweight lookup used to refresh saved carts/wishlists. */
router.get('/products-by-ids', (req, res) => {
  const ids = list(req.query.ids).map(Number).filter(Boolean).slice(0, 50);
  if (!ids.length) return res.json([]);
  const items = ids
    .map((id) => {
      try {
        return products.findOne(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  res.json(items);
});

const newsletterLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false });
router.post('/newsletter', newsletterLimiter, validate(S.newsletter), (req, res) => {
  const exists = get('SELECT id FROM newsletter_subscribers WHERE email = ?', req.body.email);
  if (!exists) run('INSERT INTO newsletter_subscribers (email) VALUES (?)', req.body.email);
  res.status(exists ? 200 : 201).json({ subscribed: true, alreadySubscribed: Boolean(exists) });
});

// ------------------------------------------------------------------ checkout

router.post('/cart/quote', validate(S.quote), (req, res) => {
  res.json(orders.quoteDTO(orders.priceCart(req.body)));
});

const checkoutLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

router.post('/checkout', checkoutLimiter, optionalCustomer, validate(S.checkout), async (req, res) => {
  const placed = orders.placeOrder(req.body, req.user);
  const response = { orderNumber: placed.orderNumber, email: req.body.email };

  if (req.body.paymentMethod === 'razorpay') {
    try {
      const rzp = await payments.createRazorpayOrder({ amountMinor: placed.total, receipt: placed.orderNumber });
      run('UPDATE orders SET payment_ref = ? WHERE id = ?', rzp.id, placed.orderId);
      response.payment = {
        provider: 'razorpay',
        keyId: payments.razorpayKeyId(),
        razorpayOrderId: rzp.id,
        amount: rzp.amount,
        currency: rzp.currency,
      };
    } catch (err) {
      // Order is kept (stock reserved) so the customer can retry payment; admin can cancel if abandoned.
      orders.addEvent(placed.orderId, { type: 'payment', message: 'Online payment could not be started', isPublic: false });
      response.paymentError = err.message;
    }
  }
  res.status(201).json(response);
});

router.post('/checkout/razorpay/verify', validate(S.razorpayVerify), (req, res) => {
  const o = get('SELECT * FROM orders WHERE order_number = ?', req.body.orderNumber);
  if (!o || o.payment_method !== 'razorpay') throw notFound('Order not found');
  if (o.payment_ref !== req.body.razorpayOrderId) throw badRequest('Payment does not match this order');
  const ok = payments.verifyRazorpaySignature({
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    signature: req.body.razorpaySignature,
  });
  if (!ok) {
    run("UPDATE orders SET payment_status = 'failed' WHERE id = ?", o.id);
    orders.addEvent(o.id, { type: 'payment', message: 'Payment verification failed' });
    throw badRequest('We could not verify your payment. If money was deducted it will be refunded automatically.');
  }
  run(
    "UPDATE orders SET payment_status = 'paid', payment_txn_id = ?, status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END WHERE id = ?",
    req.body.razorpayPaymentId,
    o.id,
  );
  orders.addEvent(o.id, { type: 'payment', message: 'Payment received' });
  orders.addEvent(o.id, { status: 'confirmed', message: 'Order confirmed' });
  res.json({ ok: true, orderNumber: o.order_number });
});

/** Order lookup for confirmation page and guest tracking — requires the order number AND the email used. */
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
router.post('/orders/track', trackLimiter, validate(S.trackOrder), (req, res) => {
  const o = get('SELECT id, email FROM orders WHERE order_number = ?', req.body.orderNumber);
  if (!o || o.email.toLowerCase() !== req.body.email.toLowerCase()) {
    throw notFound('We could not find an order with those details');
  }
  res.json(orders.getOrder(o.id));
});

router.get('/payment-methods', (req, res) => {
  res.json(payments.availableMethods(req.query.total ? toMajor(Number(req.query.total) * 100) : null));
});

module.exports = router;
