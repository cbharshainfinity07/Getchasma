const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health / Status
app.get('/api/status', (req, res) => {
  res.json({ message: "GetChasma Backend API is running smoothly!" });
});

// Analytics & Dashboard Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = store.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Products API
app.get('/api/products', (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const products = store.getProducts({ category, search, sort });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Product name and price are required" });
    }
    const newProduct = store.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const updated = store.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const success = store.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Categories API
app.get('/api/categories', (req, res) => {
  try {
    const categories = store.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const newCat = store.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Orders API
app.get('/api/orders', (req, res) => {
  try {
    const { status, search, email } = req.query;
    const orders = store.getOrders({ status, search, email });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = store.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: "Order items cannot be empty" });
    }
    const newOrder = store.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const updated = store.updateOrderStatus(req.params.id, status, cancellationReason);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update order status" });
  }
});

app.post('/api/orders/:id/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const updated = store.cancelOrder(req.params.id, reason);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

app.post('/api/orders/:id/cancel-request', (req, res) => {
  try {
    const { reason } = req.body;
    const updated = store.requestOrderCancellation(req.params.id, reason);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit cancellation request" });
  }
});

app.post('/api/orders/:id/cancellation-review', (req, res) => {
  try {
    const { action, denialReason } = req.body;
    if (!action || (action !== 'approve' && action !== 'deny')) {
      return res.status(400).json({ error: "Valid action ('approve' or 'deny') is required" });
    }
    const updated = store.reviewOrderCancellation(req.params.id, { action, denialReason });
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to review cancellation request" });
  }
});

// COD Payment Collection Toggle
app.patch('/api/orders/:id/cod-payment', (req, res) => {
  try {
    const { collected } = req.body;
    const updated = store.toggleCodPayment(req.params.id, collected);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update COD payment status" });
  }
});

// Customer Return Request with Mandatory Photos, Description & Refund Preference
app.post('/api/orders/:id/return-request', (req, res) => {
  try {
    const { reason, description, photos, refundPreference } = req.body;
    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: "Detailed description is mandatory (minimum 5 characters)." });
    }
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: "At least one inspection photo is mandatory for return processing." });
    }
    const updated = store.requestOrderReturn(req.params.id, { reason, description, photos, refundPreference });
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to submit return request" });
  }
});

// Admin Return Review (Approve / Deny)
app.post('/api/orders/:id/return-review', (req, res) => {
  try {
    const { action, denialReason } = req.body;
    if (!action || (action !== 'approve' && action !== 'deny')) {
      return res.status(400).json({ error: "Valid action ('approve' or 'deny') is required" });
    }
    const updated = store.reviewOrderReturn(req.params.id, { action, denialReason });
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to review return request" });
  }
});

// Admin Confirm Inbound Return / RTO Received at Warehouse
app.post('/api/orders/:id/return-receive', (req, res) => {
  try {
    const { notes, condition } = req.body;
    const updated = store.confirmReturnReceivedAtWarehouse(req.params.id, { notes, condition });
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to confirm warehouse return receipt" });
  }
});

// Admin Process Payment Gateway Refund
app.post('/api/orders/:id/refund', (req, res) => {
  try {
    const { refundAmount, gatewayProvider, notes } = req.body;
    const updated = store.processOrderRefund(req.params.id, { refundAmount, gatewayProvider, notes });
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to process gateway refund" });
  }
});

// Return Statistics for Admin
app.get('/api/orders/returns/stats', (req, res) => {
  try {
    const stats = store.getReturnStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch return statistics" });
  }
});

// Delivery Partner Status Update
app.patch('/api/orders/:id/delivery-partner', (req, res) => {
  try {
    const updated = store.updateDeliveryPartnerStatus(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update delivery partner status" });
  }
});

// Coupons API
app.get('/api/coupons', (req, res) => {
  try {
    const displayOnly = req.query.display === 'true';
    const coupons = store.getCoupons({ displayOnly });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

app.post('/api/coupons', (req, res) => {
  try {
    const { code, discountValue } = req.body;
    if (!code || discountValue === undefined) {
      return res.status(400).json({ error: "Coupon code and discount value are required" });
    }
    const created = store.createCoupon(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

app.put('/api/coupons/:id', (req, res) => {
  try {
    const updated = store.updateCoupon(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

app.patch('/api/coupons/:id/display', (req, res) => {
  try {
    const explicit = req.body && req.body.displayOnSite !== undefined ? req.body.displayOnSite : undefined;
    const updated = store.toggleCouponDisplay(req.params.id, explicit);
    if (!updated) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle coupon display" });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    const success = store.deleteCoupon(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, subtotal, orderTotal } = req.body;
    const amount = Number(subtotal !== undefined ? subtotal : (orderTotal !== undefined ? orderTotal : 0));
    const result = store.validateCoupon(code, amount);
    if (!result.valid) {
      return res.status(400).json({
        valid: false,
        error: result.message,
        message: result.message
      });
    }
    res.json({
      valid: true,
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      calculatedDiscount: result.discountAmount,
      discountAmount: result.discountAmount,
      description: result.coupon.description,
      coupon: result.coupon,
      message: result.message
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

// Customer Auth & Luxury Accounts API
app.post('/api/users/register', (req, res) => {
  try {
    const { name, email, password, phone, address, city, state, pincode } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    const user = store.registerUser({ name, email, password, phone, address, city, state, pincode });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});

app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const user = store.loginUser(email, password);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: err.message || "Invalid credentials." });
  }
});

app.get('/api/users/profile/:id', (req, res) => {
  try {
    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

app.put('/api/users/profile/:id', (req, res) => {
  try {
    const updated = store.updateUserProfile(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

app.post('/api/users/:id/membership', (req, res) => {
  try {
    const { plan, durationYears } = req.body;
    const updated = store.updateUserMembership(req.params.id, { plan, durationYears });
    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update membership." });
  }
});

// Serve frontend static build in production if available
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`GetChasma Server is running on port ${PORT}`);
});

