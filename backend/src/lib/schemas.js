const { z } = require('zod');

const trimmed = (max = 200) => z.string().trim().max(max);
const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v));
const money = z.coerce.number({ message: 'Enter a valid amount' }).min(0, 'Must be 0 or more').max(10_000_000);
const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(160);
const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number');
const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v.startsWith('/uploads/') || v.startsWith('/') || /^https:\/\//.test(v), 'Invalid image URL');
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #1A1A1A');

// ---------------------------------------------------------------- auth
const login = z.object({ email, password: z.string().min(1, 'Password is required').max(200) });
const register = z.object({
  name: trimmed(120).min(2, 'Enter your name'),
  email,
  phone: phone.optional().or(z.literal('')).transform((v) => v || null),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
});
const profile = z.object({
  name: trimmed(120).min(2, 'Enter your name'),
  phone: phone.optional().or(z.literal('')).transform((v) => v || null),
});
const changePassword = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(200),
});

// ---------------------------------------------------------------- catalogue
const color = z.object({ name: trimmed(40).min(1, 'Colour name required'), hex });

const productBase = z.object({
  name: trimmed(120).min(2, 'Product name is required'),
  slug: trimmed(80).optional(),
  tagline: optionalText(160),
  description: optionalText(5000),
  price: money.refine((v) => v > 0, 'Price must be greater than 0'),
  salePrice: z.preprocess((v) => (v === '' || v === undefined ? null : v), money.nullable()),
  categoryId: z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().int().positive().nullable()),
  material: optionalText(60),
  frameShape: optionalText(60),
  gender: z.enum(['men', 'women', 'unisex']).default('unisex'),
  colors: z.array(color).max(12).default([]),
  sku: trimmed(40)
    .min(2, 'SKU is required')
    .regex(/^[A-Za-z0-9._-]+$/, 'Letters, numbers, dot, dash and underscore only')
    .transform((v) => v.toUpperCase()),
  stock: z.coerce.number().int('Whole numbers only').min(0, 'Cannot be negative').max(1_000_000),
  lowStockThreshold: z.coerce.number().int().min(0).max(10_000).default(5),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  images: z.array(z.object({ url: imageUrl, alt: optionalText(160) })).max(12).default([]),
});

const saleCheck = (d, ctx) => {
  if (d.salePrice != null && d.price != null && d.salePrice >= d.price) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Discount price must be lower than the original price' });
  }
  if (d.status === 'published' && d.images && d.images.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['images'], message: 'Add at least one image before publishing' });
  }
};
const productCreate = productBase.superRefine(saleCheck);
const productUpdate = productBase.partial().superRefine(saleCheck);

const productStatus = z.object({ status: z.enum(['draft', 'published', 'archived']) });

const category = z.object({
  name: trimmed(80).min(2, 'Category name is required'),
  slug: trimmed(80).optional(),
  description: optionalText(500),
  image: imageUrl.optional().nullable().or(z.literal('')).transform((v) => v || null),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
});

const stockAdjust = z
  .object({
    mode: z.enum(['add', 'remove', 'set']),
    quantity: z.coerce.number().int('Whole numbers only').min(0).max(1_000_000),
    reason: z.enum(['restock', 'adjustment', 'correction']).default('adjustment'),
    note: optionalText(300),
  })
  .refine((d) => d.mode === 'set' || d.quantity > 0, { path: ['quantity'], message: 'Enter a quantity above 0' });

// ---------------------------------------------------------------- checkout
const cartItem = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(10),
  color: z.string().trim().max(40).optional().nullable(),
});

const quote = z.object({
  items: z.array(cartItem).min(1, 'Your cart is empty').max(50),
  discountCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => v || null),
});

const address = z.object({
  line1: trimmed(160).min(3, 'Enter your street address'),
  line2: optionalText(160),
  city: trimmed(80).min(2, 'Enter your city'),
  state: trimmed(80).min(2, 'Enter your state'),
  postalCode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  country: trimmed(60).default('India'),
});

const checkout = quote.extend({
  customerName: trimmed(120).min(2, 'Enter your full name'),
  email,
  phone,
  shippingAddress: address,
  paymentMethod: z.enum(['cod', 'razorpay'], { message: 'Choose a payment method' }),
  customerNote: optionalText(500),
});

const razorpayVerify = z.object({
  orderNumber: z.string().trim().max(40),
  razorpayOrderId: z.string().trim().max(80),
  razorpayPaymentId: z.string().trim().max(80),
  razorpaySignature: z.string().trim().max(200),
});

const trackOrder = z.object({ orderNumber: z.string().trim().toUpperCase().max(40), email });

// ---------------------------------------------------------------- orders (admin)
const orderStatus = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  note: optionalText(500),
  carrier: optionalText(60),
  trackingNumber: optionalText(80),
  cancelReason: optionalText(300),
  restockItems: z.boolean().default(true),
});
const orderRefund = z.object({
  amount: z.preprocess((v) => (v === '' || v == null ? undefined : v), money.optional()),
  reason: optionalText(300),
  restockItems: z.boolean().default(false),
});
const orderNote = z.object({ note: trimmed(1000).min(1, 'Note cannot be empty') });

// ---------------------------------------------------------------- discounts
const discount = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'At least 3 characters')
      .max(30)
      .regex(/^[A-Z0-9_-]+$/, 'Letters, numbers, dash and underscore only'),
    description: optionalText(200),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().positive('Must be greater than 0'),
    minOrder: money.default(0),
    maxUses: z.preprocess((v) => (v === '' || v == null ? null : v), z.coerce.number().int().positive().nullable()),
    startsAt: z.preprocess((v) => (v === '' ? null : v), z.string().datetime({ offset: true }).nullable().optional()),
    endsAt: z.preprocess((v) => (v === '' ? null : v), z.string().datetime({ offset: true }).nullable().optional()),
    isActive: z.boolean().default(true),
  })
  .superRefine((d, ctx) => {
    if (d.type === 'percentage' && d.value > 90) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Percentage discounts are capped at 90%' });
    }
    if (d.startsAt && d.endsAt && d.endsAt <= d.startsAt) {
      ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'End date must be after the start date' });
    }
  });

// ---------------------------------------------------------------- settings
const settingsSchemas = {
  store: z.object({
    name: trimmed(80).min(2),
    tagline: optionalText(160),
    email,
    phone: trimmed(30),
    whatsapp: optionalText(20),
    address: trimmed(300),
    instagram: optionalText(300),
    facebook: optionalText(300),
    currency: z.literal('INR').default('INR'),
    announcement: optionalText(160),
  }),
  branding: z.object({
    logo: imageUrl,
    accentColor: hex,
    heroEyebrow: trimmed(60),
    heroTitle: trimmed(120).min(4),
  }),
  shipping: z.object({
    flatRate: money,
    freeThreshold: money,
    estimatedDelivery: trimmed(80),
    shipsTo: trimmed(80),
  }),
  tax: z.object({
    label: trimmed(20).min(1),
    rate: z.coerce.number().min(0).max(50),
    inclusive: z.boolean(),
  }),
  payments: z.object({
    codEnabled: z.boolean(),
    codMaxOrder: money,
    razorpayEnabled: z.boolean(),
  }),
  inventory: z.object({ defaultLowStockThreshold: z.coerce.number().int().min(0).max(1000) }),
  testimonials: z
    .array(
      z.object({
        name: trimmed(80).min(1),
        location: optionalText(80),
        quote: trimmed(400).min(5),
        rating: z.coerce.number().int().min(1).max(5).default(5),
        product: optionalText(80),
      }),
    )
    .max(12),
};

const staffUser = z.object({
  name: trimmed(120).min(2, 'Enter a name'),
  email,
  role: z.enum(['admin', 'staff']),
  password: z.string().min(10, 'Use at least 10 characters').max(200),
});

const newsletter = z.object({ email });

module.exports = {
  login,
  register,
  profile,
  changePassword,
  productCreate,
  productUpdate,
  productStatus,
  category,
  stockAdjust,
  quote,
  checkout,
  razorpayVerify,
  trackOrder,
  orderStatus,
  orderRefund,
  orderNote,
  discount,
  settingsSchemas,
  staffUser,
  newsletter,
};
