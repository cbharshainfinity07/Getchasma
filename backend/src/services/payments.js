/**
 * Payment provider integration.
 *
 * - Cash on Delivery works out of the box.
 * - Razorpay is fully wired (order creation, signature verification, refunds) but only activates when
 *   RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are configured in backend/.env. Without keys the option is
 *   reported as unavailable to the storefront and the API refuses online payments.
 */
const crypto = require('node:crypto');
const config = require('../config');
const settings = require('./settings');
const { HttpError } = require('../lib/errors');

const RZP_API = 'https://api.razorpay.com/v1';

function razorpayAuthHeader() {
  const token = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
  return `Basic ${token}`;
}

function availableMethods(orderTotalMajor) {
  const p = settings.getSection('payments');
  const methods = [];
  methods.push({
    id: 'razorpay',
    label: 'Pay online',
    description: 'UPI, cards, net banking & wallets via Razorpay',
    available: Boolean(p.razorpayEnabled && config.razorpay.enabled),
    reason: !config.razorpay.enabled
      ? 'Online payments are not configured yet'
      : !p.razorpayEnabled
        ? 'Online payments are currently disabled'
        : null,
  });
  const codTooHigh = orderTotalMajor != null && p.codMaxOrder > 0 && orderTotalMajor > p.codMaxOrder;
  methods.push({
    id: 'cod',
    label: 'Cash on delivery',
    description: 'Pay in cash or UPI when your order arrives',
    available: Boolean(p.codEnabled) && !codTooHigh,
    reason: !p.codEnabled
      ? 'Cash on delivery is currently unavailable'
      : codTooHigh
        ? `Available on orders up to ₹${p.codMaxOrder.toLocaleString('en-IN')}`
        : null,
  });
  return methods;
}

function assertMethodAvailable(method, totalMajor) {
  const m = availableMethods(totalMajor).find((x) => x.id === method);
  if (!m) throw new HttpError(400, 'Unknown payment method');
  if (!m.available) throw new HttpError(400, m.reason || 'This payment method is unavailable');
}

async function createRazorpayOrder({ amountMinor, receipt }) {
  const res = await fetch(`${RZP_API}/orders`, {
    method: 'POST',
    headers: { Authorization: razorpayAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountMinor, currency: 'INR', receipt }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new HttpError(502, body?.error?.description || 'Could not start the online payment. Please try again.');
  }
  return body; // { id, amount, currency, ... }
}

function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function refundRazorpayPayment({ paymentId, amountMinor }) {
  const res = await fetch(`${RZP_API}/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: { Authorization: razorpayAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountMinor }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, body?.error?.description || 'Razorpay refund failed');
  return body;
}

module.exports = {
  availableMethods,
  assertMethodAvailable,
  createRazorpayOrder,
  verifyRazorpaySignature,
  refundRazorpayPayment,
  razorpayKeyId: () => config.razorpay.keyId,
  razorpayEnabled: () => config.razorpay.enabled,
};
