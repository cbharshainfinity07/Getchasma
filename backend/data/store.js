const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_CATEGORIES = [
  { id: "sun-glass", name: "Sun Glass", description: "UV400 protection eyewear for bright outdoor aesthetics", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop" },
  { id: "eye-glasses", name: "Eye Glasses", description: "Crystal-clear optical frames for daily work and reading", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop" },
  { id: "women", name: "Women", description: "Elegant, lightweight designer frames tailored for women", image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=600&auto=format&fit=crop" },
  { id: "men", name: "Men", description: "Bold, masculine silhouettes built from durable materials", image: "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop" },
  { id: "blue-light", name: "Blue Light Screen", description: "Protect your eyes from digital screen fatigue", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600&auto=format&fit=crop" }
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Aviator Gold",
    category: "Sun Glass",
    categoryId: "sun-glass",
    gender: "Unisex",
    price: 3499,
    originalPrice: 4499,
    stock: 24,
    rating: 4.9,
    reviewsCount: 142,
    isDealOfDay: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop"
    ],
    description: "The timeless Aviator style refined with ultra-lightweight gold titanium frame and polarized teardrop lenses with 100% UV400 shield.",
    specs: {
      "Frame Material": "Aerospace Grade Titanium",
      "Lens": "Polarized UV400 Category 3",
      "Fit": "Medium to Large",
      "Weight": "19g"
    }
  },
  {
    id: 2,
    name: "Retro Square Matte Black",
    category: "Eye Glasses",
    categoryId: "eye-glasses",
    gender: "Men",
    price: 2499,
    originalPrice: 3299,
    stock: 18,
    rating: 4.8,
    reviewsCount: 89,
    isDealOfDay: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop"
    ],
    description: "A bold modern architectural square frame finished in velvet matte black acetate. Ideal for prescription lenses or everyday statement eyewear.",
    specs: {
      "Frame Material": "Handcrafted Acetate",
      "Lens": "Anti-reflective Optical Clear",
      "Fit": "Standard Medium",
      "Weight": "24g"
    }
  },
  {
    id: 3,
    name: "Round Tortoise Artisan",
    category: "Sun Glass",
    categoryId: "sun-glass",
    gender: "Women",
    price: 2999,
    originalPrice: 3799,
    stock: 12,
    rating: 4.7,
    reviewsCount: 65,
    isDealOfDay: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop"
    ],
    description: "Vintage-inspired circular silhouette in a rich amber Havana tortoise pattern with gradient brown polarized lenses.",
    specs: {
      "Frame Material": "Italian Mazzucchelli Acetate",
      "Lens": "Gradient Tint UV400",
      "Fit": "Small to Medium",
      "Weight": "22g"
    }
  },
  {
    id: 4,
    name: "Minimalist Titanium Rimless",
    category: "Eye Glasses",
    categoryId: "eye-glasses",
    gender: "Unisex",
    price: 3899,
    originalPrice: 4899,
    stock: 9,
    rating: 4.9,
    reviewsCount: 112,
    isDealOfDay: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600&auto=format&fit=crop"
    ],
    description: "Near-weightless rimless construction with flexible beta-titanium temples. Designed for effortless all-day focus.",
    specs: {
      "Frame Material": "Beta-Titanium Alloy",
      "Lens": "Impact-resistant Polycarbonate",
      "Fit": "Universal Flexible",
      "Weight": "11g"
    }
  },
  {
    id: 5,
    name: "Cat-Eye Emerald Riviera",
    category: "Women",
    categoryId: "women",
    gender: "Women",
    price: 3299,
    originalPrice: 4199,
    stock: 15,
    rating: 4.8,
    reviewsCount: 77,
    isDealOfDay: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=600&auto=format&fit=crop"
    ],
    description: "Sculpted subtle upsweep silhouette with jewel tones. Enhances cheekbones and delivers unmistakable French Riviera glamour.",
    specs: {
      "Frame Material": "Cellulose Acetate & Brass Hinges",
      "Lens": "Smoked Gray 100% UV",
      "Fit": "Medium",
      "Weight": "25g"
    }
  },
  {
    id: 6,
    name: "Urban Wayfarer Polarized",
    category: "Men",
    categoryId: "men",
    gender: "Men",
    price: 2799,
    originalPrice: 3599,
    stock: 30,
    rating: 4.9,
    reviewsCount: 204,
    isDealOfDay: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop"
    ],
    description: "The rugged, sharp urban wayfarer designed with 5-barrel German hinges and glare-cutting polarized dark green lenses.",
    specs: {
      "Frame Material": "Reinforced Matte Nylon",
      "Lens": "Polarized Anti-Glare",
      "Fit": "Large",
      "Weight": "27g"
    }
  },
  {
    id: 7,
    name: "Cybershield Blue-Light Blocker",
    category: "Blue Light Screen",
    categoryId: "blue-light",
    gender: "Unisex",
    price: 2199,
    originalPrice: 2899,
    stock: 45,
    rating: 4.9,
    reviewsCount: 310,
    isDealOfDay: false,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=600&auto=format&fit=crop"
    ],
    description: "Engineered specifically for developers, designers, and gamers. Blocks 45% of harmful blue light without yellow color distortion.",
    specs: {
      "Frame Material": "TR90 Memory Polymer",
      "Lens": "Blue-Blocker Hydrophobic Coated",
      "Fit": "Medium",
      "Weight": "16g"
    }
  },
  {
    id: 8,
    name: "Aurelia Signature Aviator",
    category: "Sun Glass",
    categoryId: "sun-glass",
    gender: "Unisex",
    price: 3999,
    originalPrice: 4999,
    stock: 8,
    rating: 5.0,
    reviewsCount: 54,
    isDealOfDay: true,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    description: "GetChasma's flagship masterpiece. Hand-forged titanium double-bridge frame with custom micro-etched temple details.",
    specs: {
      "Frame Material": "Japanese Grade-1 Titanium",
      "Lens": "High-Definition Polarized Mineral Glass",
      "Fit": "Precision Engineered Medium",
      "Weight": "18g"
    }
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-7819",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    customer: {
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98201 44123",
      address: "Flat 402, Skyline Residency, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038"
    },
    items: [
      { id: 1, name: "Classic Aviator Gold", price: 3499, quantity: 1, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop" },
      { id: 7, name: "Cybershield Blue-Light Blocker", price: 2199, quantity: 1, image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=600&auto=format&fit=crop" }
    ],
    subtotal: 5698,
    discount: 500,
    shipping: 0,
    total: 5198,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "processing", // pending, processing, shipped, delivered, cancelled
    trackingNumber: "EXP-IN-893241"
  },
  {
    id: "ORD-7818",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    customer: {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 97123 90812",
      address: "B-12, Greenwoods Villa, Koregaon Park",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001"
    },
    items: [
      { id: 5, name: "Cat-Eye Emerald Riviera", price: 130, quantity: 1, image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=600&auto=format&fit=crop" }
    ],
    subtotal: 130,
    discount: 0,
    shipping: 0,
    total: 130,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "shipped",
    trackingNumber: "EXP-IN-889104"
  },
  {
    id: "ORD-7817",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    customer: {
      name: "Rahul Verma",
      email: "rahul.v@example.com",
      phone: "+91 99881 23456",
      address: "74, Golf Links Society",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110003"
    },
    items: [
      { id: 6, name: "Urban Wayfarer Polarized", price: 105, quantity: 2, image: "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop" }
    ],
    subtotal: 210,
    discount: 20,
    shipping: 0,
    total: 190,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "delivered",
    trackingNumber: "EXP-IN-872199"
  },
  {
    id: "ORD-7816",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago
    customer: {
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 94440 55123",
      address: "22, Besant Road, Alwarpet",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600018"
    },
    items: [
      { id: 2, name: "Retro Square Matte Black", price: 95, quantity: 1, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop" }
    ],
    subtotal: 95,
    discount: 0,
    shipping: 0,
    total: 95,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    status: "pending",
    trackingNumber: "EXP-IN-893902"
  }
];

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        products: INITIAL_PRODUCTS,
        categories: INITIAL_CATEGORIES,
        orders: INITIAL_ORDERS,
        nextProductId: 9,
        nextOrderNum: 7820
      };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json:", err);
    return {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      nextProductId: 9,
      nextOrderNum: 7820
    };
  }
}

function writeDB(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

// Products
function getProducts({ category, search, sort } = {}) {
  const db = readDB();
  let results = [...db.products];

  if (category && category !== 'all') {
    const catLower = category.toLowerCase().replace(/[-_ ]/g, '');
    results = results.filter(p => {
      const pCat = (p.category || '').toLowerCase().replace(/[-_ ]/g, '');
      const pCatId = (p.categoryId || '').toLowerCase().replace(/[-_ ]/g, '');
      const pGender = (p.gender || '').toLowerCase();
      return pCat === catLower || pCatId === catLower || pGender === catLower;
    });
  }

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (sort) {
    if (sort === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      results.sort((a, b) => b.id - a.id);
    }
  }

  return results;
}

function getProductById(id) {
  const db = readDB();
  return db.products.find(p => p.id === Number(id));
}

function createProduct(productData) {
  const db = readDB();
  const newId = db.nextProductId || (Math.max(0, ...db.products.map(p => p.id)) + 1);
  db.nextProductId = newId + 1;

  const newProduct = {
    id: newId,
    name: productData.name || "Untitled Eyewear",
    category: productData.category || "Sun Glass",
    categoryId: (productData.category || "sun-glass").toLowerCase().replace(/\s+/g, '-'),
    gender: productData.gender || "Unisex",
    price: Number(productData.price) || 99,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : Math.round((Number(productData.price) || 99) * 1.25),
    stock: productData.stock !== undefined ? Number(productData.stock) : 20,
    rating: productData.rating || 4.8,
    reviewsCount: productData.reviewsCount || 1,
    isDealOfDay: Boolean(productData.isDealOfDay),
    isFeatured: Boolean(productData.isFeatured),
    image: productData.image || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
    images: productData.images && productData.images.length ? productData.images : [productData.image || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"],
    description: productData.description || "Premium eyewear handcrafted for ultimate comfort and crystal clear vision.",
    specs: productData.specs || {
      "Frame Material": "Handcrafted Acetate",
      "Lens": "Polarized UV400",
      "Fit": "Standard Medium",
      "Weight": "20g"
    }
  };

  db.products.unshift(newProduct);
  writeDB(db);
  return newProduct;
}

function updateProduct(id, updates) {
  const db = readDB();
  const index = db.products.findIndex(p => p.id === Number(id));
  if (index === -1) return null;

  const existing = db.products[index];
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    originalPrice: updates.originalPrice !== undefined ? Number(updates.originalPrice) : existing.originalPrice,
    stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
    isDealOfDay: updates.isDealOfDay !== undefined ? Boolean(updates.isDealOfDay) : existing.isDealOfDay,
    isFeatured: updates.isFeatured !== undefined ? Boolean(updates.isFeatured) : existing.isFeatured,
  };

  db.products[index] = updated;
  writeDB(db);
  return updated;
}

function deleteProduct(id) {
  const db = readDB();
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== Number(id));
  if (db.products.length !== initialLen) {
    writeDB(db);
    return true;
  }
  return false;
}

// Categories
function getCategories() {
  const db = readDB();
  return db.categories;
}

function createCategory(catData) {
  const db = readDB();
  const id = (catData.id || catData.name).toLowerCase().replace(/\s+/g, '-');
  const newCat = {
    id,
    name: catData.name,
    description: catData.description || "",
    image: catData.image || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"
  };
  db.categories.push(newCat);
  writeDB(db);
  return newCat;
}

// Orders
function getOrders({ status, search, email } = {}) {
  const db = readDB();
  let results = [...db.orders];

  if (email) {
    const targetEmail = email.toLowerCase().trim();
    results = results.filter(o => o.customer && o.customer.email && o.customer.email.toLowerCase() === targetEmail);
  }

  if (status && status !== 'all') {
    if (status === 'requests' || status === 'cancellation_requests') {
      results = results.filter(o => o.cancellationRequested && o.cancellationRequest?.status === 'pending');
    } else if (status === 'returns') {
      results = results.filter(o => o.returnRequest || (o.status && o.status.startsWith('return_')) || o.status === 'refunded' || o.refundStatus === 'refunded');
    } else {
      results = results.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }
  }

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(o => 
      o.id.toLowerCase().includes(q) ||
      (o.customer && (
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q)
      )) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  }

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return results;
}

function getOrderById(id) {
  const db = readDB();
  return db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
}

function createOrder(orderData) {
  const db = readDB();
  const orderNum = db.nextOrderNum || 7820;
  db.nextOrderNum = orderNum + 1;

  const isCod = orderData.paymentMethod === "Cash on Delivery";
  const newOrder = {
    id: `ORD-${orderNum}`,
    createdAt: new Date().toISOString(),
    customer: orderData.customer || {
      name: "Guest Shopper",
      email: "guest@example.com",
      phone: "+91 90000 00000",
      address: "123 High Street",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001"
    },
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal) || 0,
    discount: Number(orderData.discount) || 0,
    shipping: Number(orderData.shipping) || 0,
    total: Number(orderData.total) || 0,
    paymentMethod: orderData.paymentMethod || "UPI",
    paymentStatus: isCod ? (orderData.paymentDetails?.codCollected ? "Paid" : "Pending") : "Paid",
    codPaymentCollected: isCod ? Boolean(orderData.paymentDetails?.codCollected || orderData.codPaymentCollected) : false,
    paymentDetails: {
      method: orderData.paymentMethod || "UPI",
      upiUtr: orderData.paymentDetails?.upiUtr || orderData.paymentDetails?.utrNumber || orderData.upiUtr || '',
      utrNumber: orderData.paymentDetails?.upiUtr || orderData.paymentDetails?.utrNumber || orderData.upiUtr || '',
      cardLast4: orderData.paymentDetails?.cardLast4 || orderData.cardLast4 || '',
      cardNetwork: orderData.paymentDetails?.cardNetwork || orderData.cardNetwork || '',
      cardholderName: orderData.paymentDetails?.cardholderName || '',
      txnId: orderData.paymentDetails?.txnId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentStatus: isCod ? (orderData.paymentDetails?.codCollected ? "Paid" : "Pending") : "Paid",
      codCollected: Boolean(orderData.paymentDetails?.codCollected || orderData.codPaymentCollected),
      codPaymentCollected: Boolean(orderData.paymentDetails?.codCollected || orderData.codPaymentCollected),
      codCollectedAt: orderData.paymentDetails?.codCollected ? new Date().toISOString() : null
    },
    deliveryPartner: orderData.deliveryPartner || {
      carrier: "BlueDart Express",
      awbNumber: `BD-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingUrl: "https://track.bluedart.com/",
      status: "Manifested",
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString()
    },
    status: "pending",
    trackingNumber: `EXP-IN-${Math.floor(100000 + Math.random() * 900000)}`
  };

  if (Array.isArray(orderData.items)) {
    orderData.items.forEach(cartItem => {
      const p = db.products.find(prod => prod.id === Number(cartItem.id));
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) - (cartItem.quantity || 1));
      }
    });
  }

  db.orders.unshift(newOrder);
  writeDB(db);
  return newOrder;
}

function updateOrderStatus(id, status, cancellationReason = null) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  if (order.status === 'cancelled' || order.cancellationRequest?.status === 'approved') {
    throw new Error(`Order ${id} is permanently cancelled and its lifecycle cannot be reactivated or altered.`);
  }

  if (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') {
    throw new Error(`Order ${id} has been refunded and its lifecycle is permanently closed.`);
  }

  if (order.status === 'delivered' && status !== 'delivered' && !status.startsWith('return_') && status !== 'refunded') {
    throw new Error(`Order ${id} has already been marked as Delivered. Its lifecycle is finalized and cannot be manually modified unless the customer requests a return or replacement.`);
  }

  order.status = status;
  if (status === 'delivered') {
    order.paymentStatus = 'Paid';
    order.deliveredAt = order.deliveredAt || new Date().toISOString();
  } else if (status === 'cancelled') {
    order.cancelledAt = new Date().toISOString();
    order.cancellationReason = cancellationReason || order.cancellationReason || 'Cancelled by customer or store administrator';
    if (order.paymentMethod === 'Cash on Delivery') {
      order.codPaymentCollected = false;
      if (order.paymentDetails) {
        order.paymentDetails.codCollected = false;
        order.paymentDetails.codPaymentCollected = false;
      }
      order.paymentStatus = 'Cancelled';
    }
  }
  writeDB(db);
  return order;
}

function cancelOrder(id, reason = 'Cancelled by customer') {
  return updateOrderStatus(id, 'cancelled', reason);
}

function requestOrderCancellation(id, reason = 'Customer requested cancellation') {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;
  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw new Error(`Cannot request cancellation for an order that is already ${order.status}`);
  }

  order.cancellationRequested = true;
  order.previousStatus = order.status;
  order.cancellationRequest = {
    reason,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  writeDB(db);
  return order;
}

function reviewOrderCancellation(id, { action, denialReason = '' }) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  if (action === 'approve') {
    const wasDispatched = order.previousStatus === 'shipped' || order.status === 'shipped' || order.deliveryPartner?.status === 'Shipped';
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    order.cancellationReason = order.cancellationRequest?.reason || 'Approved customer cancellation request';
    order.cancellationRequested = false;

    // Configure refund details for prepaid orders (UPI / Card)
    const isPrepaid = order.paymentMethod === 'UPI' || order.paymentMethod === 'Card' || order.paymentMethod === 'Credit Card' || order.paymentMethod === 'Debit Card';
    if (isPrepaid) {
      order.refundStatus = 'pending_gateway_refund';
      if (!order.refundDetails) {
        order.refundDetails = {
          status: wasDispatched ? 'awaiting_return_arrival' : 'ready_for_gateway_refund',
          amount: Number(order.total || 0),
          destination: order.paymentMethod === 'UPI'
            ? `Original UPI (UTR: ${order.paymentDetails?.upiUtr || 'Linked'})`
            : `Original Card (•••• ${order.paymentDetails?.cardLast4 || '****'})`
        };
      } else {
        order.refundDetails.status = wasDispatched ? 'awaiting_return_arrival' : 'ready_for_gateway_refund';
      }
    }

    const rtoAwb = wasDispatched ? `RTO-BD-${Math.floor(1000000 + Math.random() * 9000000)}` : null;
    order.cancellationRequest = {
      ...order.cancellationRequest,
      status: 'approved',
      resolvedAt: new Date().toISOString(),
      wasDispatched: Boolean(wasDispatched),
      returnAwb: rtoAwb,
      carrier: wasDispatched ? 'BlueDart Reverse Express (RTO)' : null,
      returnShipmentStatus: wasDispatched ? 'in_transit' : 'received_at_warehouse',
      receivedAtWarehouse: wasDispatched ? false : true,
      receivedAtWarehouseTime: wasDispatched ? null : new Date().toISOString(),
      history: wasDispatched ? [
        {
          status: 'RTO Initiated / In-Transit Consignment Recalled',
          timestamp: new Date().toISOString(),
          location: 'Courier Network Hub',
          description: `Consignment ${rtoAwb} recalled for Return-To-Origin back to central warehouse.`
        },
        {
          status: 'In Transit to Warehouse',
          timestamp: new Date().toISOString(),
          location: 'Regional Transit Facility',
          description: 'Package in reverse transit to Central Optics Facility.'
        }
      ] : [
        {
          status: 'Order Cancelled & Restocked in Warehouse',
          timestamp: new Date().toISOString(),
          location: 'Central Optics Facility',
          description: 'Package was not dispatched. Restocked directly in warehouse.'
        }
      ]
    };

    if (order.paymentMethod === 'Cash on Delivery') {
      order.codPaymentCollected = false;
      if (order.paymentDetails) {
        order.paymentDetails.codCollected = false;
        order.paymentDetails.codPaymentCollected = false;
      }
      order.paymentStatus = 'Cancelled';
    }

    // Restore inventory
    if (Array.isArray(order.items)) {
      order.items.forEach(cartItem => {
        const p = db.products.find(prod => prod.id === Number(cartItem.id));
        if (p) {
          p.stock = (p.stock || 0) + (cartItem.quantity || 1);
        }
      });
    }
  } else if (action === 'deny') {
    order.cancellationRequested = false;
    if (order.status === 'cancelled' && order.previousStatus) {
      order.status = order.previousStatus;
      delete order.cancelledAt;
      delete order.cancellationReason;
    }
    order.cancellationRequest = {
      ...order.cancellationRequest,
      status: 'denied',
      deniedAt: new Date().toISOString(),
      denialReason: denialReason || 'Optical lenses already in precision cutting lab. Order cannot be cancelled.'
    };
  }

  writeDB(db);
  return order;
}

function toggleCodPayment(id, collected) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  if (order.status === 'cancelled' || order.cancellationRequest?.status === 'approved') {
    throw new Error(`Order ${id} is cancelled. Cash collection cannot be altered for cancelled orders.`);
  }

  if (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') {
    throw new Error(`Order ${id} has been refunded. Cash collection status cannot be altered.`);
  }

  const isCollected = Boolean(collected);
  if (!order.paymentDetails) {
    order.paymentDetails = { method: order.paymentMethod || 'Cash on Delivery' };
  }
  order.codPaymentCollected = isCollected;
  order.paymentDetails.codCollected = isCollected;
  order.paymentDetails.codPaymentCollected = isCollected;
  order.paymentDetails.codCollectedAt = isCollected ? new Date().toISOString() : null;
  order.paymentStatus = isCollected ? 'Paid' : 'Pending';

  writeDB(db);
  return order;
}

function requestOrderReturn(id, { reason, description, photos = [], refundPreference }) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  if (order.status !== 'delivered' && order.status !== 'return_rejected') {
    throw new Error(`Returns are only accepted for delivered orders. Current status: ${order.status}`);
  }

  if (order.returnRequest && order.returnRequest.status === 'pending') {
    throw new Error('A return request is already undergoing inspection for this order.');
  }

  // Determine refund destination based on original payment method
  let refundDetails = {
    status: 'not_initiated',
    amount: order.total || 0,
    requestedAt: new Date().toISOString()
  };

  const methodUpper = (order.paymentMethod || '').toUpperCase();
  const isCod = methodUpper.includes('CASH') || methodUpper.includes('COD') || methodUpper.includes('DELIVERY');
  const isDigitalPayment = !isCod;

  if (isDigitalPayment) {
    // Strictly locked to original payment source
    if (methodUpper.includes('UPI')) {
      const utr = order.paymentDetails?.upiUtr || order.paymentDetails?.utrNumber || 'Linked Account';
      refundDetails.refundMethod = 'original_source';
      refundDetails.destination = `Original UPI Source (UTR: ${utr})`;
      refundDetails.payoutType = 'UPI Direct Reversal';
    } else {
      const cardLast4 = order.paymentDetails?.cardLast4 || '****';
      const network = order.paymentDetails?.cardNetwork || 'Card';
      refundDetails.refundMethod = 'original_source';
      refundDetails.destination = `Original ${network} Card (•••• ${cardLast4})`;
      refundDetails.payoutType = 'Card Gateway Reversal';
    }
  } else {
    // Cash on Delivery (COD) - uses customer submitted payout choice
    if (refundPreference?.method === 'upi' && refundPreference?.upiId) {
      refundDetails.refundMethod = 'upi';
      refundDetails.destination = `UPI: ${refundPreference.upiId.trim()}`;
      refundDetails.payoutDetails = { upiId: refundPreference.upiId.trim() };
      refundDetails.payoutType = 'Direct UPI Transfer';
    } else if ((refundPreference?.method === 'bank_transfer' || refundPreference?.method === 'bank') && refundPreference?.bankDetails) {
      const b = refundPreference.bankDetails;
      refundDetails.refundMethod = 'bank_transfer';
      refundDetails.destination = `Bank Transfer: ${b.bankName || 'Bank'} (A/C •••• ${String(b.accountNumber || '').slice(-4)})`;
      refundDetails.payoutDetails = {
        accountHolder: b.accountHolder || '',
        bankName: b.bankName || '',
        accountNumber: b.accountNumber || '',
        ifsc: b.ifsc || ''
      };
      refundDetails.payoutType = 'IMPS/NEFT Direct Bank Transfer';
    } else if (refundPreference?.method === 'store_credit') {
      refundDetails.refundMethod = 'store_credit';
      refundDetails.destination = 'Maison Store Credit Wallet (+5% Bonus)';
      refundDetails.payoutType = 'Maison Store Credit';
    } else {
      refundDetails.refundMethod = 'upi';
      refundDetails.destination = refundPreference?.upiId ? `UPI: ${refundPreference.upiId}` : 'Awaiting Customer Payout Details';
      refundDetails.payoutDetails = refundPreference?.upiId ? { upiId: refundPreference.upiId } : {};
      refundDetails.payoutType = 'Pending Customer Detail';
    }
  }

  order.status = 'return_requested';
  order.refundStatus = 'not_initiated';
  order.refundDetails = refundDetails;

  order.returnRequest = {
    reason: reason || 'Optical defect / Fit issue',
    description: description || 'Customer reported an issue with the delivered eyewear.',
    photos: Array.isArray(photos) ? photos : [],
    requestedAt: new Date().toISOString(),
    status: 'pending',
    refundPreference: refundDetails
  };

  writeDB(db);
  return order;
}

function reviewOrderReturn(id, { action, denialReason = '' }) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  if (!order.returnRequest) {
    throw new Error(`Order ${id} does not have an active return request to review.`);
  }

  if (action === 'approve') {
    const awb = `RET-BD-${Math.floor(1000000 + Math.random() * 9000000)}`;
    order.status = 'return_approved';
    order.refundStatus = 'pending_gateway_refund';
    if (!order.refundDetails) {
      order.refundDetails = {
        status: 'awaiting_return_arrival',
        amount: Number(order.total || 0),
        destination: order.paymentMethod === 'UPI'
          ? `Original UPI (UTR: ${order.paymentDetails?.upiUtr || 'Linked'})`
          : order.paymentMethod === 'Card'
          ? `Original Card (•••• ${order.paymentDetails?.cardLast4 || '****'})`
          : 'Customer Designated Payout Destination'
      };
    } else {
      order.refundDetails.status = 'awaiting_return_arrival';
    }

    order.returnRequest = {
      ...order.returnRequest,
      status: 'approved',
      resolvedAt: new Date().toISOString(),
      returnAwb: awb,
      returnTrackingNumber: awb,
      carrier: 'BlueDart Reverse Express',
      returnShipmentStatus: 'in_transit',
      receivedAtWarehouse: false,
      receivedAtWarehouseTime: null,
      history: [
        {
          status: 'Return Approved & Reverse Consignment Generated',
          timestamp: new Date().toISOString(),
          location: 'Central Optics Facility',
          description: `Consignment AWB ${awb} assigned for reverse logistics pickup.`
        },
        {
          status: 'In Transit to Warehouse',
          timestamp: new Date().toISOString(),
          location: `${order.customer?.city || 'Local Delivery'} Hub`,
          description: 'Package in reverse transit to Central Optics Warehouse facility.'
        }
      ]
    };

    // Restore inventory
    if (Array.isArray(order.items)) {
      order.items.forEach(cartItem => {
        const p = db.products.find(prod => prod.id === Number(cartItem.id));
        if (p) {
          p.stock = (p.stock || 0) + (cartItem.quantity || 1);
        }
      });
    }
  } else if (action === 'deny') {
    order.status = 'return_denied';
    order.returnRequest = {
      ...order.returnRequest,
      status: 'denied',
      resolvedAt: new Date().toISOString(),
      denialReason: denialReason || 'Defect inspection could not be verified from submitted imagery.'
    };
  }

  writeDB(db);
  return order;
}

function confirmReturnReceivedAtWarehouse(id, { notes = '', condition = 'Pristine / Verified' } = {}) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  const now = new Date().toISOString();

  // If returnRequest exists
  if (order.returnRequest) {
    order.returnRequest.returnShipmentStatus = 'received_at_warehouse';
    order.returnRequest.receivedAtWarehouse = true;
    order.returnRequest.receivedAtWarehouseTime = now;
    order.returnRequest.warehouseNotes = notes || 'Eyewear package received back at central warehouse and verified by optical inspection team.';
    order.returnRequest.itemCondition = condition;
    if (!order.returnRequest.history) order.returnRequest.history = [];
    order.returnRequest.history.push({
      status: 'Delivered to Warehouse & Quality Verified',
      timestamp: now,
      location: 'Central Optics Facility (Bengaluru)',
      description: `Inbound return package confirmed received. Condition: ${condition}. Optical frame verified. Refund station unlocked.`
    });
  }

  // If cancellationRequest exists
  if (order.cancellationRequest) {
    order.cancellationRequest.returnShipmentStatus = 'received_at_warehouse';
    order.cancellationRequest.receivedAtWarehouse = true;
    order.cancellationRequest.receivedAtWarehouseTime = now;
    order.cancellationRequest.warehouseNotes = notes || 'Inbound RTO consignment confirmed received at warehouse.';
    if (!order.cancellationRequest.history) order.cancellationRequest.history = [];
    order.cancellationRequest.history.push({
      status: 'RTO Package Received at Warehouse',
      timestamp: now,
      location: 'Central Optics Facility (Bengaluru)',
      description: 'Dispatched package safely returned to origin warehouse. Refund station unlocked.'
    });
  }

  if (order.refundDetails) {
    order.refundDetails.status = 'ready_for_gateway_refund';
  }

  writeDB(db);
  return order;
}

function processOrderRefund(id, { refundAmount, gatewayProvider = 'Razorpay Instant Payouts', notes = '' }) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  // Safeguard: For online prepaid orders (UPI / Card), physical product must be received at warehouse
  const isPrepaid = order.paymentMethod === 'UPI' || order.paymentMethod === 'Card' || order.paymentMethod === 'Credit Card' || order.paymentMethod === 'Debit Card';
  
  if (isPrepaid) {
    if (order.returnRequest && order.returnRequest.status === 'approved' && !order.returnRequest.receivedAtWarehouse) {
      throw new Error(`Cannot process refund for order ${id}. Return shipment is in transit and must be verified as received at the warehouse before refund can be initiated.`);
    }
    if (order.cancellationRequest && order.cancellationRequest.status === 'approved' && order.cancellationRequest.wasDispatched && !order.cancellationRequest.receivedAtWarehouse) {
      throw new Error(`Cannot process refund for order ${id}. Inbound RTO consignment is in transit and must be received at the warehouse before refund can be initiated.`);
    }
  }

  const amt = Number(refundAmount || order.total || 0);
  const refundId = `rfnd_rzp_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;

  const currentDetails = order.refundDetails || {};
  const destination = currentDetails.destination || (
    order.paymentMethod === 'UPI'
      ? `Original UPI (UTR: ${order.paymentDetails?.upiUtr || 'Linked'})`
      : order.paymentMethod === 'Card'
      ? `Original Card (•••• ${order.paymentDetails?.cardLast4 || '****'})`
      : 'Customer Designated Payout Destination'
  );

  order.refundStatus = 'refunded';
  order.refundDetails = {
    ...currentDetails,
    status: 'refunded',
    amount: amt,
    destination: destination,
    gatewayProvider: gatewayProvider,
    gatewayRefundId: refundId,
    refundedAt: new Date().toISOString(),
    notes: notes || 'Gateway refund initiated and confirmed via automated payment gateway settlement.'
  };

  if (order.returnRequest) {
    order.returnRequest.refundStatus = 'refunded';
    order.returnRequest.refundedAt = new Date().toISOString();
    order.returnRequest.gatewayRefundId = refundId;
  }

  // Always mark order status as refunded
  order.status = 'refunded';

  writeDB(db);
  return order;
}

function getReturnStats() {
  const db = readDB();
  const orders = db.orders || [];

  const returnOrders = orders.filter(o => o.returnRequest || (o.status && o.status.startsWith('return_')) || o.status === 'refunded');
  const total = returnOrders.length;
  const pending = returnOrders.filter(o => o.status === 'return_requested' || o.returnRequest?.status === 'pending').length;
  const approved = returnOrders.filter(o => o.returnRequest?.status === 'approved' || o.status === 'return_approved' || o.status === 'refunded').length;
  const denied = returnOrders.filter(o => o.returnRequest?.status === 'denied').length;

  return { total, pending, approved, denied };
}

function updateDeliveryPartnerStatus(id, partnerData) {
  const db = readDB();
  const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  if (!order) return null;

  order.deliveryPartner = {
    ...(order.deliveryPartner || {}),
    ...partnerData,
    updatedAt: new Date().toISOString()
  };

  if (partnerData.status === 'Delivered' && order.status !== 'delivered') {
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    if (order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
      if (order.paymentDetails) {
        order.paymentDetails.codCollected = true;
        order.paymentDetails.codCollectedAt = new Date().toISOString();
      }
    }
  }

  writeDB(db);
  return order;
}

// Dashboard Analytics
function getStats() {
  const db = readDB();
  const orders = db.orders;
  const products = db.products;

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const activeProducts = products.length;
  const lowStockCount = products.filter(p => (p.stock || 0) <= 10).length;
  const aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const topProducts = products.slice(0, 4).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    stock: p.stock,
    soldCount: Math.floor((p.reviewsCount || 50) * 1.8),
    revenue: Math.floor((p.reviewsCount || 50) * 1.8 * p.price)
  }));

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    activeProducts,
    lowStockCount,
    averageOrderValue: Math.round(aov * 100) / 100,
    recentOrders,
    topProducts
  };
}

const INITIAL_COUPONS = [
  {
    id: "cpn-1",
    code: "CHASMA15",
    description: "Get 15% Off on All Handcrafted Eyewear",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 0,
    displayOnSite: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cpn-2",
    code: "GOLD25",
    description: "Save 25% on Orders Above $100 with Gold Privilege",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 100,
    displayOnSite: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cpn-3",
    code: "FLAT30",
    description: "Flat $30 Discount on Premium Titanium Collection",
    discountType: "fixed",
    discountValue: 30,
    minOrderValue: 150,
    displayOnSite: false,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

function ensureCoupons(db) {
  if (!db.coupons || db.coupons.length === 0) {
    db.coupons = JSON.parse(JSON.stringify(INITIAL_COUPONS));
    writeDB(db);
  }
}

function getCoupons({ displayOnly = false } = {}) {
  const db = readDB();
  ensureCoupons(db);
  let list = [...db.coupons];
  if (displayOnly) {
    list = list.filter(c => c.isActive && c.displayOnSite);
  }
  return list;
}

function createCoupon(data) {
  const db = readDB();
  ensureCoupons(db);

  const newCoupon = {
    id: `cpn-${Date.now()}`,
    code: (data.code || '').trim().toUpperCase(),
    description: data.description || 'Promotional Discount',
    discountType: data.discountType || 'percentage',
    discountValue: Number(data.discountValue) || 10,
    minOrderValue: Number(data.minOrderValue) || 0,
    displayOnSite: Boolean(data.displayOnSite),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    createdAt: new Date().toISOString()
  };

  db.coupons.unshift(newCoupon);
  writeDB(db);
  return newCoupon;
}

function updateCoupon(id, updates) {
  const db = readDB();
  ensureCoupons(db);

  const index = db.coupons.findIndex(c => c.id === id || c.code === id.toUpperCase());
  if (index === -1) return null;

  db.coupons[index] = {
    ...db.coupons[index],
    ...updates,
    code: updates.code ? updates.code.trim().toUpperCase() : db.coupons[index].code,
    discountValue: updates.discountValue !== undefined ? Number(updates.discountValue) : db.coupons[index].discountValue,
    minOrderValue: updates.minOrderValue !== undefined ? Number(updates.minOrderValue) : db.coupons[index].minOrderValue,
    displayOnSite: updates.displayOnSite !== undefined ? Boolean(updates.displayOnSite) : db.coupons[index].displayOnSite,
    isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : db.coupons[index].isActive,
  };

  writeDB(db);
  return db.coupons[index];
}

function toggleCouponDisplay(id, explicitValue) {
  const db = readDB();
  ensureCoupons(db);

  const coupon = db.coupons.find(c => c.id === id || c.code === id.toUpperCase());
  if (!coupon) return null;

  if (explicitValue !== undefined) {
    coupon.displayOnSite = Boolean(explicitValue);
  } else {
    coupon.displayOnSite = !coupon.displayOnSite;
  }
  writeDB(db);
  return coupon;
}

function deleteCoupon(id) {
  const db = readDB();
  ensureCoupons(db);

  const initialLen = db.coupons.length;
  db.coupons = db.coupons.filter(c => c.id !== id && c.code !== id.toUpperCase());
  if (db.coupons.length !== initialLen) {
    writeDB(db);
    return true;
  }
  return false;
}

function validateCoupon(code, subtotal = 0) {
  const db = readDB();
  ensureCoupons(db);

  const cleanCode = (code || '').trim().toUpperCase();
  const coupon = db.coupons.find(c => c.code === cleanCode && c.isActive);

  if (!coupon) {
    return { valid: false, message: 'Invalid or expired coupon code.' };
  }

  if (subtotal < (coupon.minOrderValue || 0)) {
    return {
      valid: false,
      message: `Coupon requires a minimum order subtotal of $${coupon.minOrderValue.toFixed(2)}.`
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
  } else {
    discountAmount = Math.min(subtotal, coupon.discountValue);
  }

  return {
    valid: true,
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: `Coupon "${coupon.code}" applied! You save $${discountAmount.toFixed(2)}.`
  };
}

// User Accounts & Luxury VIP Membership
const INITIAL_USERS = [
  {
    id: "usr-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    password: "password123",
    phone: "+91 98765 43210",
    address: "Penthouse 4B, Skyview Luxury Enclave",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    isMember: true,
    membership: {
      tier: "Gold VIP",
      memberId: "GC-GOLD-7821",
      validUntil: "2027-09-10T00:00:00.000Z",
      plan: "Annual Pass",
      perks: [
        "Buy 1 Get 1 Free on all Eyewear & Sunglasses",
        "50% Off Premium Lenses (High-Index & Blue-Cut)",
        "Complimentary Anti-Glare & Anti-Scratch Coating",
        "Zero Shipping Fees & White-Glove VIP Express Courier",
        "Priority Concierge Support & Free Frame Fitting Kit"
      ]
    },
    createdAt: "2026-01-15T10:00:00.000Z"
  }
];

function ensureUsers(db) {
  if (!db.users || !Array.isArray(db.users)) {
    db.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    writeDB(db);
  }
}

function registerUser({ name, email, password, phone, address, city, state, pincode }) {
  const db = readDB();
  ensureUsers(db);

  const cleanEmail = (email || '').trim().toLowerCase();
  if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error("An account with this email address already exists.");
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: (name || 'Valued Customer').trim(),
    email: cleanEmail,
    password: password || 'chasma123',
    phone: phone || '',
    address: address || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    isMember: false,
    membership: null,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);
  
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

function loginUser(email, password) {
  const db = readDB();
  ensureUsers(db);

  const cleanEmail = (email || '').trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password. Please try again.");
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
}

function getUserById(id) {
  const db = readDB();
  ensureUsers(db);
  const user = db.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

function updateUserProfile(id, updates) {
  const db = readDB();
  ensureUsers(db);
  const user = db.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (!user) return null;

  if (updates.name) user.name = updates.name.trim();
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.address !== undefined) user.address = updates.address;
  if (updates.city !== undefined) user.city = updates.city;
  if (updates.state !== undefined) user.state = updates.state;
  if (updates.pincode !== undefined) user.pincode = updates.pincode;

  writeDB(db);
  const { password: _, ...safeUser } = user;
  return safeUser;
}

function updateUserMembership(id, { plan = '1-Year VIP Pass', durationYears = 1 } = {}) {
  const db = readDB();
  ensureUsers(db);
  const user = db.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (!user) return null;

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + durationYears);

  user.isMember = true;
  user.membership = {
    tier: "Gold VIP",
    memberId: `GC-GOLD-${Math.floor(1000 + Math.random() * 9000)}`,
    validUntil: expiry.toISOString(),
    plan: plan,
    activatedAt: new Date().toISOString(),
    perks: [
      "Buy 1 Get 1 Free on all Eyewear & Sunglasses",
      "50% Off Premium Lenses (High-Index & Blue-Cut)",
      "Complimentary Anti-Glare & Anti-Scratch Coating",
      "Zero Shipping Fees & White-Glove VIP Express Courier",
      "Priority Concierge Support & Free Frame Fitting Kit"
    ]
  };

  writeDB(db);
  const { password: _, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  requestOrderCancellation,
  reviewOrderCancellation,
  toggleCodPayment,
  requestOrderReturn,
  reviewOrderReturn,
  confirmReturnReceivedAtWarehouse,
  processOrderRefund,
  getReturnStats,
  updateDeliveryPartnerStatus,
  getStats,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponDisplay,
  deleteCoupon,
  validateCoupon,
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  updateUserMembership
};

