/**
 * End-to-end API tests against an isolated temporary database.
 * Run: npm test   (from backend/)
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gc-test-'));
process.env.DATABASE_FILE = path.join(tmp, 'test.db');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
process.env.JWT_SECRET = 'test-secret-'.padEnd(48, 'x');
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'admin-password-123';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const { ensureAdmin } = require('../src/db/bootstrap');
const { run, get } = require('../src/db');

let server;
let base;
let adminCookie;

async function call(method, url, { body, cookie } = {}) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers };
}

const checkoutBody = (items, extra = {}) => ({
  items,
  customerName: 'Test Person',
  email: 'person@example.test',
  phone: '9876543210',
  shippingAddress: { line1: '1 Test Street', city: 'Kalaburagi', state: 'Karnataka', postalCode: '585101' },
  paymentMethod: 'cod',
  ...extra,
});

before(async () => {
  await ensureAdmin();
  run("INSERT INTO categories (name, slug) VALUES ('Sunglasses', 'sunglasses')");
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
  const login = await call('POST', '/admin/auth/login', { body: { email: 'admin@test.local', password: 'admin-password-123' } });
  assert.equal(login.status, 200);
  adminCookie = login.headers.get('set-cookie').split(';')[0];
});

after(() => {
  server?.close();
});

test('admin routes require authentication', async () => {
  const r = await call('GET', '/admin/dashboard');
  assert.equal(r.status, 401);
});

test('rejects wrong admin password', async () => {
  const r = await call('POST', '/admin/auth/login', { body: { email: 'admin@test.local', password: 'nope' } });
  assert.equal(r.status, 401);
});

let productId;
test('admin creates a product with validation', async () => {
  const bad = await call('POST', '/admin/products', {
    cookie: adminCookie,
    body: { name: 'X', price: 1000, salePrice: 1200, sku: 'BAD SKU', stock: 1, status: 'published' },
  });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.fields.salePrice);
  assert.ok(bad.body.error.fields.sku);

  const ok = await call('POST', '/admin/products', {
    cookie: adminCookie,
    body: {
      name: 'Test Aviator',
      price: 2000,
      salePrice: 1500,
      sku: 'TST-001',
      stock: 3,
      status: 'published',
      categoryId: 1,
      colors: [{ name: 'Black', hex: '#111111' }],
      images: [{ url: '/test.jpg' }],
    },
  });
  assert.equal(ok.status, 201, JSON.stringify(ok.body));
  productId = ok.body.id;
  assert.equal(ok.body.discountPercent, 25);
});

test('public catalogue lists published product with filters', async () => {
  const r = await call('GET', '/products?colors=black&category=sunglasses');
  assert.equal(r.body.total, 1);
  assert.equal(r.body.items[0].effectivePrice, 1500);
  assert.equal(r.body.items[0].stock, undefined, 'raw stock is not exposed publicly');
});

test('quote prices server-side and flags stock problems', async () => {
  const r = await call('POST', '/cart/quote', { body: { items: [{ productId, quantity: 5 }] } });
  assert.equal(r.status, 200);
  assert.equal(r.body.problems.length, 1);
  assert.equal(r.body.subtotal, 7500);
});

test('checkout decrements stock atomically and records inventory movement', async () => {
  const r = await call('POST', '/checkout', { body: checkoutBody([{ productId, quantity: 2 }]) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.match(r.body.orderNumber, /^GC-/);
  assert.equal(get('SELECT stock FROM products WHERE id = ?', productId).stock, 1);

  const oversell = await call('POST', '/checkout', { body: checkoutBody([{ productId, quantity: 2 }]) });
  assert.equal(oversell.status, 409);
});

test('online payment is refused while Razorpay is not configured', async () => {
  const r = await call('POST', '/checkout', { body: checkoutBody([{ productId, quantity: 1 }], { paymentMethod: 'razorpay' }) });
  assert.equal(r.status, 400);
});

test('order status workflow, tracking requirement, COD auto-paid, cancellation restock', async () => {
  const list = await call('GET', '/admin/orders', { cookie: adminCookie });
  const order = list.body.items[0];

  const noTracking = await call('PATCH', `/admin/orders/${order.id}/status`, { cookie: adminCookie, body: { status: 'shipped' } });
  assert.equal(noTracking.status, 400);

  const shipped = await call('PATCH', `/admin/orders/${order.id}/status`, {
    cookie: adminCookie,
    body: { status: 'shipped', trackingNumber: 'TRK1', carrier: 'Delhivery' },
  });
  assert.equal(shipped.body.status, 'shipped');

  const cannotCancel = await call('PATCH', `/admin/orders/${order.id}/status`, { cookie: adminCookie, body: { status: 'cancelled' } });
  assert.equal(cannotCancel.status, 400);

  const delivered = await call('PATCH', `/admin/orders/${order.id}/status`, { cookie: adminCookie, body: { status: 'delivered' } });
  assert.equal(delivered.body.paymentStatus, 'paid');

  const refund = await call('POST', `/admin/orders/${order.id}/refund`, { cookie: adminCookie, body: { restockItems: true } });
  assert.equal(refund.body.status, 'refunded');
  assert.equal(get('SELECT stock FROM products WHERE id = ?', productId).stock, 3);
});

test('discount codes enforce minimum order', async () => {
  const d = await call('POST', '/admin/discounts', { cookie: adminCookie, body: { code: 'save10', type: 'percentage', value: 10, minOrder: 5000 } });
  assert.equal(d.status, 201);
  const q = await call('POST', '/cart/quote', { body: { items: [{ productId, quantity: 1 }], discountCode: 'SAVE10' } });
  assert.equal(q.status, 400);
  assert.ok(q.body.error.fields.discountCode);
});

test('analytics excludes refunded orders from net sales', async () => {
  const r = await call('GET', '/admin/analytics?range=30d', { cookie: adminCookie });
  assert.equal(r.status, 200);
  assert.equal(r.body.kpis.revenue, 0);
});

test('customer registration, login and order history isolation', async () => {
  const reg = await call('POST', '/account/register', { body: { name: 'Asha', email: 'asha@example.test', password: 'password123' } });
  assert.equal(reg.status, 201);
  const cookie = reg.headers.get('set-cookie').split(';')[0];
  const orders = await call('GET', '/account/orders', { cookie });
  assert.deepEqual(orders.body, []);
  // Admin session cookie must not work on customer routes and vice versa
  const cross = await call('GET', '/admin/dashboard', { cookie });
  assert.equal(cross.status, 401);
});
