const express = require('express');
const { requireAdmin } = require('../../middleware/auth');
const { get } = require('../../db');

const router = express.Router();

// Admin responses must never be cached by browsers or proxies.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.use('/auth', require('./auth'));

// Everything below requires an authenticated admin or staff session.
router.use(requireAdmin());

const { categories, inventory, uploads } = require('./catalog');
const { orders, customers, discounts } = require('./sales');
const { settings, team } = require('./settings');

router.use('/products', require('./products'));
router.use('/categories', categories);
router.use('/inventory', inventory);
router.use('/uploads', uploads);
router.use('/orders', orders);
router.use('/customers', customers);
router.use('/discounts', discounts);
router.use('/settings', settings);
router.use('/team', team);
router.use('/', require('./insights'));

/** Sidebar badges. */
router.get('/badges', (req, res) => {
  res.json({
    pendingOrders: get("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").n,
    lowStock: get(
      "SELECT COUNT(*) AS n FROM products WHERE status != 'archived' AND stock <= low_stock_threshold",
    ).n,
  });
});

module.exports = router;
