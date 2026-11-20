const { all, get, run, now, transaction } = require('../db');
const { toMajor, toMinor, parseJson, generateOrderNumber } = require('../lib/util');
const { badRequest, conflict, notFound, HttpError } = require('../lib/errors');
const settings = require('./settings');
const products = require('./products');
const payments = require('./payments');

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_MESSAGES = {
  pending: 'Order placed',
  confirmed: 'Order confirmed',
  processing: 'Your order is being prepared',
  shipped: 'Order shipped',
  delivered: 'Order delivered',
  cancelled: 'Order cancelled',
  refunded: 'Order refunded',
};

/** Which statuses an order may move to from its current status. */
function allowedTransitions(order) {
  const { status } = order;
  if (status === 'refunded') return [];
  if (status === 'cancelled') return [];
  const idx = FLOW.indexOf(status);
  const next = FLOW.slice(idx + 1);
  if (['pending', 'confirmed', 'processing'].includes(status)) next.push('cancelled');
  return next;
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

function evaluateDiscount(code, subtotalMinor) {
  if (!code) return { discount: null, amount: 0 };
  const d = get('SELECT * FROM discounts WHERE code = ?', code.trim());
  const invalid = (msg) => {
    throw badRequest(msg, { fields: { discountCode: msg } });
  };
  if (!d || !d.is_active) invalid('This discount code is not valid');
  const ts = now();
  if (d.starts_at && ts < d.starts_at) invalid('This discount code is not active yet');
  if (d.ends_at && ts > d.ends_at) invalid('This discount code has expired');
  if (d.max_uses != null && d.used_count >= d.max_uses) invalid('This discount code has reached its usage limit');
  if (subtotalMinor < d.min_order) {
    invalid(`Add ₹${toMajor(d.min_order - subtotalMinor).toLocaleString('en-IN')} more to use this code`);
  }
  const amount =
    d.type === 'percentage' ? Math.round((subtotalMinor * d.value) / 100) : Math.min(d.value, subtotalMinor);
  return { discount: d, amount };
}

// ---------------------------------------------------------------------------
// Pricing (always computed server-side from the catalogue — client prices are never trusted)
// ---------------------------------------------------------------------------

function priceCart({ items, discountCode }) {
  if (!Array.isArray(items) || items.length === 0) throw badRequest('Your cart is empty');

  const lines = [];
  const problems = [];
  for (const item of items) {
    const row = products.findRow(item.productId);
    if (!row || row.status !== 'published') {
      problems.push({ productId: item.productId, message: 'This product is no longer available' });
      continue;
    }
    const qty = Math.max(1, Math.min(10, Number(item.quantity) || 1));
    if (row.stock < qty) {
      problems.push({
        productId: row.id,
        message: row.stock <= 0 ? `${row.name} is out of stock` : `Only ${row.stock} of ${row.name} left in stock`,
        available: row.stock,
      });
    }
    const colors = parseJson(row.colors, []);
    const color = item.color && colors.some((c) => c.name === item.color) ? item.color : colors[0]?.name || null;
    const unit = row.sale_price != null && row.sale_price < row.price ? row.sale_price : row.price;
    const image = products.imagesFor([row.id]).get(row.id)?.[0]?.url || null;
    lines.push({
      productId: row.id,
      slug: row.slug,
      name: row.name,
      sku: row.sku,
      image,
      color,
      unitPrice: unit,
      originalPrice: row.price,
      quantity: qty,
      lineTotal: unit * qty,
      stock: row.stock,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const { discount, amount: discountTotal } = evaluateDiscount(discountCode, subtotal);
  const afterDiscount = subtotal - discountTotal;

  const ship = settings.getSection('shipping');
  const shippingTotal =
    afterDiscount <= 0 || (ship.freeThreshold > 0 && afterDiscount >= toMinor(ship.freeThreshold))
      ? 0
      : toMinor(ship.flatRate);

  const tax = settings.getSection('tax');
  const rate = Number(tax.rate) || 0;
  // Inclusive tax (Indian MRP convention): tax is already inside prices; we report the included portion.
  const taxTotal = tax.inclusive
    ? Math.round(afterDiscount - afterDiscount / (1 + rate / 100))
    : Math.round((afterDiscount * rate) / 100);
  const total = afterDiscount + shippingTotal + (tax.inclusive ? 0 : taxTotal);

  return {
    lines,
    problems,
    discount,
    totals: { subtotal, discountTotal, shippingTotal, taxTotal, total },
    tax: { label: tax.label, rate, inclusive: Boolean(tax.inclusive) },
    shipping: { freeThreshold: ship.freeThreshold, estimatedDelivery: ship.estimatedDelivery },
  };
}

function quoteDTO(quote) {
  return {
    items: quote.lines.map((l) => ({
      productId: l.productId,
      slug: l.slug,
      name: l.name,
      image: l.image,
      color: l.color,
      quantity: l.quantity,
      unitPrice: toMajor(l.unitPrice),
      originalPrice: toMajor(l.originalPrice),
      lineTotal: toMajor(l.lineTotal),
      stock: l.stock,
    })),
    problems: quote.problems,
    discountCode: quote.discount?.code || null,
    discountDescription: quote.discount?.description || null,
    subtotal: toMajor(quote.totals.subtotal),
    discountTotal: toMajor(quote.totals.discountTotal),
    shippingTotal: toMajor(quote.totals.shippingTotal),
    taxTotal: toMajor(quote.totals.taxTotal),
    total: toMajor(quote.totals.total),
    tax: quote.tax,
    shipping: quote.shipping,
    paymentMethods: payments.availableMethods(toMajor(quote.totals.total)),
  };
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

/**
 * Resolve the customer record for an order/registration.
 * Signed-in shoppers always map to the customer linked to their account (even if they type a different
 * contact email at checkout); guests are matched by email.
 */
function upsertCustomer({ email, name, phone, userId }) {
  if (userId) {
    const linked = get('SELECT id FROM customers WHERE user_id = ?', userId);
    if (linked) {
      // The account profile is authoritative for registered customers; checkout only fills a missing phone.
      run('UPDATE customers SET phone = COALESCE(phone, ?) WHERE id = ?', phone || null, linked.id);
      return linked.id;
    }
  }
  const existing = get('SELECT * FROM customers WHERE email = ?', email);
  if (existing) {
    const linkUser = userId && existing.user_id == null ? userId : existing.user_id;
    run(
      'UPDATE customers SET name = ?, phone = COALESCE(?, phone), user_id = ? WHERE id = ?',
      name,
      phone || null,
      linkUser,
      existing.id,
    );
    return existing.id;
  }
  const res = run(
    'INSERT INTO customers (email, name, phone, user_id) VALUES (?, ?, ?, ?)',
    email,
    name,
    phone || null,
    userId || null,
  );
  return Number(res.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Order lifecycle
// ---------------------------------------------------------------------------

function addEvent(orderId, { type = 'status', status = null, message, isPublic = true, userId = null }) {
  run(
    'INSERT INTO order_events (order_id, type, status, message, is_public, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    orderId,
    type,
    status,
    message,
    isPublic ? 1 : 0,
    userId,
  );
}

/** Place an order: re-price, validate stock, decrement inventory, and record everything atomically. */
function placeOrder(input, user) {
  return transaction(() => {
    const quote = priceCart({ items: input.items, discountCode: input.discountCode });
    if (quote.problems.length) {
      throw new HttpError(409, 'Some items in your cart need attention', { problems: quote.problems });
    }
    payments.assertMethodAvailable(input.paymentMethod, toMajor(quote.totals.total));

    const customerId = upsertCustomer({
      email: input.email,
      name: input.customerName,
      phone: input.phone,
      userId: user?.id,
    });

    let orderNumber = generateOrderNumber();
    while (get('SELECT id FROM orders WHERE order_number = ?', orderNumber)) orderNumber = generateOrderNumber();

    const t = quote.totals;
    const res = run(
      `INSERT INTO orders (order_number, customer_id, user_id, email, customer_name, phone, shipping_address,
        subtotal, discount_total, shipping_total, tax_total, total, discount_code, status, payment_method,
        payment_status, customer_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending', ?)`,
      orderNumber,
      customerId,
      user?.id || null,
      input.email,
      input.customerName,
      input.phone,
      JSON.stringify(input.shippingAddress),
      t.subtotal,
      t.discountTotal,
      t.shippingTotal,
      t.taxTotal,
      t.total,
      quote.discount?.code || null,
      input.paymentMethod,
      input.customerNote || null,
    );
    const orderId = Number(res.lastInsertRowid);

    for (const l of quote.lines) {
      run(
        `INSERT INTO order_items (order_id, product_id, name, sku, image, color, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        orderId,
        l.productId,
        l.name,
        l.sku,
        l.image,
        l.color,
        l.unitPrice,
        l.quantity,
        l.lineTotal,
      );
      // Conditional decrement guards against races between concurrent checkouts.
      const upd = run(
        'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?',
        l.quantity,
        now(),
        l.productId,
        l.quantity,
      );
      if (Number(upd.changes) !== 1) throw conflict(`${l.name} just sold out. Please update your cart.`);
      const after = get('SELECT stock FROM products WHERE id = ?', l.productId).stock;
      products.recordMovement({
        productId: l.productId,
        change: -l.quantity,
        stockAfter: after,
        reason: 'order',
        note: orderNumber,
        orderId,
      });
    }

    if (quote.discount) run('UPDATE discounts SET used_count = used_count + 1 WHERE id = ?', quote.discount.id);
    addEvent(orderId, {
      status: 'pending',
      message:
        input.paymentMethod === 'cod' ? 'Order placed, pay on delivery' : 'Order placed, awaiting online payment',
    });
    return { orderId, orderNumber, total: t.total };
  });
}

function restock(order, reason, userId) {
  const items = all('SELECT product_id, quantity FROM order_items WHERE order_id = ?', order.id);
  for (const it of items) {
    if (!it.product_id) continue;
    const p = get('SELECT stock FROM products WHERE id = ?', it.product_id);
    if (!p) continue;
    run('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?', it.quantity, now(), it.product_id);
    products.recordMovement({
      productId: it.product_id,
      change: it.quantity,
      stockAfter: p.stock + it.quantity,
      reason,
      note: order.order_number,
      orderId: order.id,
      userId,
    });
  }
}

function updateStatus(orderId, { status, note, carrier, trackingNumber, cancelReason, restockItems = true }, userId) {
  return transaction(() => {
    const order = get('SELECT * FROM orders WHERE id = ?', orderId);
    if (!order) throw notFound('Order not found');
    if (status === order.status) {
      // Allow updating tracking info without a status change.
      if (carrier !== undefined || trackingNumber !== undefined) {
        run(
          'UPDATE orders SET carrier = ?, tracking_number = ?, updated_at = ? WHERE id = ?',
          carrier ?? order.carrier,
          trackingNumber ?? order.tracking_number,
          now(),
          orderId,
        );
        addEvent(orderId, { type: 'note', message: 'Tracking details updated', userId });
      }
      return getOrder(orderId, { admin: true });
    }
    if (!allowedTransitions(order).includes(status)) {
      throw badRequest(`An order that is ${order.status} cannot be marked as ${status}`);
    }
    if (status === 'shipped' && !(trackingNumber || order.tracking_number)) {
      throw badRequest('Add a tracking number before marking the order as shipped', {
        fields: { trackingNumber: 'Required when shipping' },
      });
    }

    const sets = ['status = ?', 'updated_at = ?'];
    const params = [status, now()];
    if (carrier !== undefined) {
      sets.push('carrier = ?');
      params.push(carrier || null);
    }
    if (trackingNumber !== undefined) {
      sets.push('tracking_number = ?');
      params.push(trackingNumber || null);
    }
    if (status === 'cancelled') {
      sets.push('cancel_reason = ?');
      params.push(cancelReason || null);
      if (order.payment_status === 'pending' && order.payment_method === 'razorpay') {
        sets.push("payment_status = 'failed'");
      }
    }
    if (status === 'delivered' && order.payment_method === 'cod' && order.payment_status === 'pending') {
      sets.push("payment_status = 'paid'");
    }
    run(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, ...params, orderId);

    if (status === 'cancelled' && restockItems) restock(order, 'cancellation', userId);

    let message = STATUS_MESSAGES[status];
    if (status === 'shipped') {
      const tn = trackingNumber || order.tracking_number;
      const c = carrier || order.carrier;
      message = `Order shipped${c ? ` via ${c}` : ''}${tn ? ` · Tracking ${tn}` : ''}`;
    }
    if (status === 'cancelled' && cancelReason) message += `: ${cancelReason}`;
    addEvent(orderId, { status, message, userId });
    if (note) addEvent(orderId, { type: 'note', message: note, isPublic: false, userId });
    return getOrder(orderId, { admin: true });
  });
}

/**
 * Refund an order (full or partial). Online payments are refunded through Razorpay; COD/manual refunds are
 * recorded so the books stay correct.
 */
async function refund(orderId, { amount, reason, restockItems }, userId) {
  const order = get('SELECT * FROM orders WHERE id = ?', orderId);
  if (!order) throw notFound('Order not found');
  if (order.payment_status !== 'paid' && order.payment_status !== 'partially_refunded') {
    throw badRequest('Only paid orders can be refunded');
  }
  const remaining = order.total - order.refunded_amount;
  const amountMinor = amount != null ? toMinor(amount) : remaining;
  if (amountMinor <= 0 || amountMinor > remaining) {
    throw badRequest(`Refund amount must be between ₹1 and ₹${toMajor(remaining)}`, {
      fields: { amount: 'Invalid amount' },
    });
  }

  let gatewayNote = 'Recorded as a manual refund';
  if (order.payment_method === 'razorpay' && order.payment_txn_id) {
    if (!payments.razorpayEnabled()) throw badRequest('Razorpay is not configured, so the refund cannot be issued');
    const r = await payments.refundRazorpayPayment({ paymentId: order.payment_txn_id, amountMinor });
    gatewayNote = `Razorpay refund ${r.id}`;
  }

  return transaction(() => {
    const refunded = order.refunded_amount + amountMinor;
    const full = refunded >= order.total;
    run(
      `UPDATE orders SET refunded_amount = ?, payment_status = ?, status = ?, updated_at = ? WHERE id = ?`,
      refunded,
      full ? 'refunded' : 'partially_refunded',
      full ? 'refunded' : order.status,
      now(),
      orderId,
    );
    if (full && restockItems && !['cancelled'].includes(order.status)) restock(order, 'refund', userId);
    addEvent(orderId, {
      type: 'refund',
      status: full ? 'refunded' : null,
      message: `${full ? 'Refunded' : 'Partially refunded'} ₹${toMajor(amountMinor).toLocaleString('en-IN')}${
        reason ? `: ${reason}` : ''
      }`,
      userId,
    });
    addEvent(orderId, { type: 'note', message: gatewayNote, isPublic: false, userId });
    return getOrder(orderId, { admin: true });
  });
}

function markPaid(orderId, { txnId }, userId) {
  return transaction(() => {
    const order = get('SELECT * FROM orders WHERE id = ?', orderId);
    if (!order) throw notFound('Order not found');
    if (order.payment_status === 'paid') return getOrder(orderId, { admin: true });
    if (['cancelled', 'refunded'].includes(order.status)) throw badRequest('Cannot mark a cancelled order as paid');
    run(
      "UPDATE orders SET payment_status = 'paid', payment_txn_id = COALESCE(?, payment_txn_id), updated_at = ? WHERE id = ?",
      txnId || null,
      now(),
      orderId,
    );
    addEvent(orderId, { type: 'payment', message: 'Payment received', userId });
    return getOrder(orderId, { admin: true });
  });
}

function orderDTO(o, { admin = false, items, events } = {}) {
  const dto = {
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    email: o.email,
    customerName: o.customer_name,
    phone: o.phone,
    shippingAddress: parseJson(o.shipping_address, {}),
    subtotal: toMajor(o.subtotal),
    discountTotal: toMajor(o.discount_total),
    shippingTotal: toMajor(o.shipping_total),
    taxTotal: toMajor(o.tax_total),
    total: toMajor(o.total),
    refundedAmount: toMajor(o.refunded_amount),
    discountCode: o.discount_code,
    carrier: o.carrier,
    trackingNumber: o.tracking_number,
    customerNote: o.customer_note,
    cancelReason: o.cancel_reason,
    itemCount: o.item_count ?? undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
  if (items) {
    dto.items = items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      slug: i.slug || null,
      name: i.name,
      sku: i.sku,
      image: i.image,
      color: i.color,
      unitPrice: toMajor(i.unit_price),
      quantity: i.quantity,
      lineTotal: toMajor(i.line_total),
    }));
  }
  if (events) {
    dto.events = events.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      message: e.message,
      isPublic: Boolean(e.is_public),
      by: admin ? e.user_name || null : undefined,
      createdAt: e.created_at,
    }));
  }
  if (admin) {
    Object.assign(dto, {
      customerId: o.customer_id,
      userId: o.user_id,
      paymentRef: o.payment_ref,
      paymentTxnId: o.payment_txn_id,
      internalNote: o.internal_note,
      allowedTransitions: allowedTransitions(o),
    });
  }
  return dto;
}

function getOrder(idOrNumber, { admin = false } = {}) {
  const isId = typeof idOrNumber === 'number';
  const o = get(`SELECT * FROM orders WHERE ${isId ? 'id' : 'order_number'} = ?`, idOrNumber);
  if (!o) throw notFound('Order not found');
  const items = all(
    `SELECT oi.*, p.slug FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY oi.id`,
    o.id,
  );
  const events = all(
    `SELECT e.*, u.name AS user_name FROM order_events e LEFT JOIN users u ON u.id = e.user_id
     WHERE e.order_id = ? ${admin ? '' : 'AND e.is_public = 1'} ORDER BY e.created_at, e.id`,
    o.id,
  );
  return orderDTO(o, { admin, items, events });
}

module.exports = {
  STATUSES,
  allowedTransitions,
  priceCart,
  quoteDTO,
  placeOrder,
  updateStatus,
  refund,
  markPaid,
  getOrder,
  orderDTO,
  addEvent,
  upsertCustomer,
  evaluateDiscount,
};
