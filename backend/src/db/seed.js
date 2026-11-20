/**
 * Seeds the catalogue (categories + products) and default settings.
 * Safe to re-run: existing records (matched by slug / SKU) are left untouched.
 *
 *   npm run seed
 *
 * No orders, customers or analytics are seeded — those only come from real activity.
 */
const { get, run, transaction } = require('./index');
const { ensureAdmin } = require('./bootstrap');
const settings = require('../services/settings');
const products = require('../services/products');

const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

const CATEGORIES = [
  {
    name: 'Sunglasses',
    slug: 'sunglasses',
    description: 'Polarised and UV400 lenses in frames built for the Indian sun.',
    image: U('1473496169904-658ba7c44d8a', 1200),
  },
  {
    name: 'Eyeglasses',
    slug: 'eyeglasses',
    description: 'Lightweight optical frames, ready for your prescription.',
    image: U('1574258495973-f010dfbb5371', 900),
  },
  {
    name: 'Blue Light',
    slug: 'blue-light',
    description: 'Screen-ready lenses that cut glare and digital eye strain.',
    image: U('1625591342274-013866180475', 900),
  },
  {
    name: 'Performance',
    slug: 'performance',
    description: 'Wraparound sport shields engineered for speed and grip.',
    image: '/3d-glasses.png',
  },
];

const C = {
  black: { name: 'Black', hex: '#111111' },
  gold: { name: 'Gold', hex: '#C9A54C' },
  silver: { name: 'Silver', hex: '#B8BCC2' },
  tortoise: { name: 'Tortoise', hex: '#6B3F1D' },
  rose: { name: 'Rose Gold', hex: '#D9A08B' },
  clear: { name: 'Crystal', hex: '#E6E2DA' },
  amber: { name: 'Amber', hex: '#E0752D' },
  pink: { name: 'Blush', hex: '#E9B8C0' },
  navy: { name: 'Navy', hex: '#1F2A44' },
  graphite: { name: 'Graphite', hex: '#4A4D52' },
  white: { name: 'White', hex: '#F4F4F2' },
};

// Prices in INR (major units). salePrice null = not discounted.
const PRODUCTS = [
  {
    name: 'Aurelia Aviator',
    tagline: 'Hand-finished titanium with G-15 lenses',
    category: 'sunglasses',
    price: 6499,
    salePrice: 5499,
    material: 'Titanium',
    frameShape: 'Aviator',
    gender: 'unisex',
    colors: [C.gold, C.silver],
    sku: 'GC-AUR-001',
    stock: 24,
    isFeatured: true,
    isBestseller: true,
    images: [U('1511499767150-a48a237f0083'), U('1473496169904-658ba7c44d8a')],
    description:
      'The Aurelia brings vintage aviation design to modern, featherweight comfort. A hand-polished titanium frame weighs just 18 g, while category-3 G-15 lenses deliver true-to-life colour and full UV400 protection.\n\nAdjustable silicone nose pads and spring hinges keep the fit secure from the morning commute to the late-evening drive.',
  },
  {
    name: 'Midnight Wayfarer',
    tagline: 'The everyday icon in polished black acetate',
    category: 'sunglasses',
    price: 3999,
    salePrice: 3399,
    material: 'Acetate',
    frameShape: 'Wayfarer',
    gender: 'unisex',
    colors: [C.black, C.tortoise],
    sku: 'GC-MDW-002',
    stock: 42,
    isFeatured: true,
    isBestseller: true,
    images: [U('1572635196237-14b3f281503f'), U('1473496169904-658ba7c44d8a')],
    description:
      'A timeless trapezoid silhouette cut from premium Italian acetate. Polarised lenses kill road and water glare, and five-barrel hinges are built to survive years of daily wear.',
  },
  {
    name: 'Coastline Round',
    tagline: 'Crystal acetate with warm brown lenses',
    category: 'sunglasses',
    price: 3499,
    salePrice: null,
    material: 'Acetate',
    frameShape: 'Round',
    gender: 'unisex',
    colors: [C.clear, C.tortoise],
    sku: 'GC-CST-003',
    stock: 18,
    isBestseller: true,
    images: [U('1577803645773-f96470509666')],
    description:
      'Soft, rounded lines in a translucent crystal frame. Brown gradient lenses boost contrast on bright days without dulling colour — made for beaches, road trips and long lunches.',
  },
  {
    name: 'Heritage Browline',
    tagline: 'Tortoise brow with a slim metal rim',
    category: 'eyeglasses',
    price: 2999,
    salePrice: 2499,
    material: 'Acetate & Metal',
    frameShape: 'Browline',
    gender: 'men',
    colors: [C.tortoise, C.black],
    sku: 'GC-HRB-004',
    stock: 30,
    isFeatured: true,
    images: [U('1574258495973-f010dfbb5371'), U('1591076482161-42ce6da69f67')],
    description:
      'A mid-century classic, re-engineered. The hand-polished acetate brow sits on a feather-light metal rim, ready for single-vision or progressive lenses.',
  },
  {
    name: 'Rosé Cat-Eye',
    tagline: 'Rose-gold metal with gradient lenses',
    category: 'sunglasses',
    price: 4299,
    salePrice: 3699,
    material: 'Metal',
    frameShape: 'Cat-Eye',
    gender: 'women',
    colors: [C.rose, C.gold],
    sku: 'GC-RSC-005',
    stock: 4,
    isFeatured: true,
    images: [U('1508296695146-257a814070b4'), U('1509695507497-903c140c43b0')],
    description:
      'An uplifted cat-eye that flatters every face. Rose-gold stainless steel and soft gradient lenses give a polished, effortless finish.',
  },
  {
    name: 'Blush Round Optical',
    tagline: 'Delicate pink metal for everyday clarity',
    category: 'eyeglasses',
    price: 2499,
    salePrice: null,
    material: 'Metal',
    frameShape: 'Round',
    gender: 'women',
    colors: [C.pink, C.gold],
    sku: 'GC-BLR-006',
    stock: 16,
    images: [U('1582142407894-ec85a1260a46')],
    description:
      'A soft blush rim and thin temples make this round optical frame almost weightless. Pairs beautifully with anti-glare or blue-cut lenses.',
  },
  {
    name: 'Studio Hexagon',
    tagline: 'Geometric black metal, double bridge',
    category: 'eyeglasses',
    price: 2799,
    salePrice: null,
    material: 'Metal',
    frameShape: 'Hexagon',
    gender: 'unisex',
    colors: [C.black, C.gold],
    sku: 'GC-STH-007',
    stock: 22,
    isBestseller: true,
    images: ['/1.jpg.webp', '/2.jpg.webp'],
    description:
      'Clean geometry with a double bridge and adjustable nose pads. A confident optical frame that works as hard at the studio as it does after hours.',
  },
  {
    name: 'Scholar Round',
    tagline: 'Thin silver wire, classic round lens',
    category: 'eyeglasses',
    price: 2199,
    salePrice: 1899,
    material: 'Stainless Steel',
    frameShape: 'Round',
    gender: 'unisex',
    colors: [C.silver, C.black],
    sku: 'GC-SCH-008',
    stock: 3,
    images: ['/3.jpg.webp', '/4.jpg.webp', U('1614715838608-dd527c46231d')],
    description:
      'Inspired by library reading rooms — a slim stainless-steel round frame with acetate temple tips for all-day comfort.',
  },
  {
    name: 'Clarity Blue Shield',
    tagline: 'Blue-cut lenses for long screen days',
    category: 'blue-light',
    price: 1999,
    salePrice: 1599,
    material: 'TR90',
    frameShape: 'Square',
    gender: 'unisex',
    colors: [C.black, C.navy],
    sku: 'GC-CBS-009',
    stock: 55,
    isBestseller: true,
    images: [U('1625591342274-013866180475')],
    description:
      'Flexible TR90 frame with premium blue-cut, anti-reflective lenses that filter harmful blue-violet light from laptops and phones. Zero-power lenses included — prescription-ready.',
  },
  {
    name: 'Wireframe Pantos',
    tagline: 'Featherweight titanium for focused work',
    category: 'blue-light',
    price: 3299,
    salePrice: null,
    material: 'Titanium',
    frameShape: 'Panto',
    gender: 'unisex',
    colors: [C.silver, C.gold],
    sku: 'GC-WFP-010',
    stock: 12,
    images: [U('1546180245-c59500ad14d0'), U('1614715838608-dd527c46231d')],
    description:
      'A refined panto shape in pure titanium with double-bridge detailing. Fitted with blue-cut, anti-glare lenses for crisp, comfortable focus.',
  },
  {
    name: 'Clubmaster Shade',
    tagline: 'Gradient grey lenses, half-rim attitude',
    category: 'sunglasses',
    price: 3799,
    salePrice: null,
    material: 'Acetate & Metal',
    frameShape: 'Browline',
    gender: 'men',
    colors: [C.black, C.gold],
    sku: 'GC-CLB-011',
    stock: 20,
    images: [U('1584036553516-bf83210aa16c')],
    description:
      'A bold acetate brow over gradient grey lenses. Sharp enough for the boardroom, relaxed enough for the weekend.',
  },
  {
    name: 'Exo Vision Sport',
    tagline: 'Wraparound shield with vented frame',
    category: 'performance',
    price: 5999,
    salePrice: 5099,
    material: 'TR90',
    frameShape: 'Shield',
    gender: 'unisex',
    colors: [C.graphite, C.black],
    sku: 'GC-EXO-012',
    stock: 14,
    isFeatured: true,
    images: ['/3d-glasses.png'],
    description:
      'Engineered for riders and runners. A single-piece shield lens offers a panoramic field of view, while airflow vents prevent fogging. Rubberised nose and temple grips hold steady at speed.',
  },
  {
    name: 'Sunset Tint Square',
    tagline: 'Translucent amber acetate, orange lenses',
    category: 'sunglasses',
    price: 3299,
    salePrice: null,
    material: 'Acetate',
    frameShape: 'Square',
    gender: 'unisex',
    colors: [C.amber],
    sku: 'GC-SUN-013',
    stock: 26,
    images: ['/hot-1.jpg', '/hot-2.jpg'],
    description:
      'A statement square frame in glowing amber acetate with tinted orange lenses. Warm, playful, and impossible to ignore.',
  },
  {
    name: 'Noir Slim Rectangle',
    tagline: 'Sleek black rectangles with dark lenses',
    category: 'sunglasses',
    price: 2999,
    salePrice: 2599,
    material: 'Acetate',
    frameShape: 'Rectangle',
    gender: 'women',
    colors: [C.black],
    sku: 'GC-NSR-014',
    stock: 0,
    images: ['/hot-5.jpg', U('1563903530908-afdd155d057a')],
    description:
      'The narrow, ’90s-inspired rectangle — cut in glossy black acetate with deep smoke lenses for a sharp editorial look.',
  },
  {
    name: 'Pilot Gold Mini',
    tagline: 'Compact gold frame with smoke lenses',
    category: 'sunglasses',
    price: 3599,
    salePrice: null,
    material: 'Metal',
    frameShape: 'Aviator',
    gender: 'men',
    colors: [C.gold, C.black],
    sku: 'GC-PGM-015',
    stock: 19,
    images: ['/hot-3.jpg', U('1511499767150-a48a237f0083')],
    description:
      'A compact take on the pilot — thin gold metal, small smoke lenses and a confident, minimalist profile.',
  },
  {
    name: 'Kitten Cat-Eye White',
    tagline: 'Retro white acetate with smoke lenses',
    category: 'sunglasses',
    price: 2799,
    salePrice: 2299,
    material: 'Acetate',
    frameShape: 'Cat-Eye',
    gender: 'women',
    colors: [C.white, C.black],
    sku: 'GC-KTW-016',
    stock: 9,
    images: [U('1522337094846-8a818192de1f')],
    description:
      'A sharp, retro cat-eye in glossy white acetate. Light, fun, and guaranteed to steal the frame in every photo.',
  },
];

// Sample testimonials so the homepage section has content on first run.
// Replace these with genuine customer reviews in Admin → Settings → Testimonials.
const SAMPLE_TESTIMONIALS = [
  {
    name: 'Ananya R.',
    location: 'Bengaluru',
    quote: 'The Aurelia Aviators feel incredibly light and the lenses are crystal clear. Packaging felt premium too.',
    rating: 5,
    product: 'Aurelia Aviator',
  },
  {
    name: 'Rahul M.',
    location: 'Kalaburagi',
    quote: 'Ordered blue-light glasses for work. Delivered in three days and the headaches after long screen hours are gone.',
    rating: 5,
    product: 'Clarity Blue Shield',
  },
  {
    name: 'Sneha K.',
    location: 'Pune',
    quote: 'Loved the try-before-you-buy style descriptions. The fit was exactly as described and returns were easy.',
    rating: 4,
    product: 'Rosé Cat-Eye',
  },
];

/** Seeds categories, products and sample testimonials. Idempotent. */
async function seed() {
  transaction(() => {
    const catIds = {};
    CATEGORIES.forEach((c, i) => {
      const existing = get('SELECT id FROM categories WHERE slug = ?', c.slug);
      if (existing) {
        catIds[c.slug] = existing.id;
        return;
      }
      const r = run(
        'INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)',
        c.name,
        c.slug,
        c.description,
        c.image,
        i,
      );
      catIds[c.slug] = Number(r.lastInsertRowid);
    });

    let created = 0;
    // Stagger creation dates so "New arrivals" has a meaningful order.
    PRODUCTS.forEach((p, i) => {
      if (get('SELECT id FROM products WHERE sku = ?', p.sku)) return;
      const dto = products.create(
        {
          ...p,
          categoryId: catIds[p.category],
          lowStockThreshold: 5,
          status: 'published',
          images: p.images.map((url) => ({ url, alt: p.name })),
          isFeatured: Boolean(p.isFeatured),
          isBestseller: Boolean(p.isBestseller),
        },
        null,
      );
      const created_at = new Date(Date.now() - (PRODUCTS.length - i) * 36 * 3600 * 1000).toISOString();
      run('UPDATE products SET created_at = ?, updated_at = ? WHERE id = ?', created_at, created_at, dto.id);
      created += 1;
    });

    if (!settings.hasSection('testimonials')) settings.setSection('testimonials', SAMPLE_TESTIMONIALS);
    console.log(`[seed] Categories: ${Object.keys(catIds).length}, new products: ${created}`);
  });
  await ensureAdmin();
}

/** Seed only when the catalogue is empty (fresh server / new disk). */
async function seedIfEmpty() {
  const { n } = get('SELECT COUNT(*) AS n FROM products');
  if (n === 0) {
    console.log('[seed] Empty catalogue detected, loading the starter catalogue');
    await seed();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seed, seedIfEmpty };
