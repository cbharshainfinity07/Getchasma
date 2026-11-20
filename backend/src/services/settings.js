const { get, run, all } = require('../db');
const { parseJson } = require('../lib/util');

// Defaults are merged under whatever is stored, so new keys roll out without migrations.
// Money values in settings are in major units (rupees) because they are edited directly by admins.
const DEFAULTS = {
  store: {
    name: 'GetChasma',
    tagline: 'Perfect glasses for your unique style',
    email: 'info@getchasma.com',
    phone: '+91 97403 10101',
    whatsapp: '919740310101',
    address: 'Kalaburagi, Karnataka, India',
    instagram: 'https://www.instagram.com/chasma._com/',
    facebook: 'https://www.facebook.com/chasma.fb/',
    currency: 'INR',
    announcement: 'Free shipping on orders above ₹1,999 · 7-day easy returns',
  },
  branding: {
    logo: '/logo.webp',
    accentColor: '#D4FF3F',
    heroEyebrow: 'Up To 15% Off',
    heroTitle: 'Perfect Glasses For Your Unique Style',
  },
  shipping: {
    flatRate: 99,
    freeThreshold: 1999,
    estimatedDelivery: '3-6 business days',
    shipsTo: 'India',
  },
  tax: {
    label: 'GST',
    rate: 18,
    inclusive: true,
  },
  payments: {
    codEnabled: true,
    codMaxOrder: 15000,
    razorpayEnabled: true,
  },
  inventory: {
    defaultLowStockThreshold: 5,
  },
  testimonials: [],
};

const SECTIONS = Object.keys(DEFAULTS);

function getSection(key) {
  const row = get('SELECT value FROM settings WHERE key = ?', key);
  const stored = parseJson(row?.value, null);
  if (Array.isArray(DEFAULTS[key])) return stored ?? DEFAULTS[key];
  return { ...DEFAULTS[key], ...(stored || {}) };
}

function getAll() {
  const out = {};
  for (const key of SECTIONS) out[key] = getSection(key);
  return out;
}

function setSection(key, value) {
  if (!SECTIONS.includes(key)) throw new Error(`Unknown settings section: ${key}`);
  const merged = Array.isArray(DEFAULTS[key]) ? value : { ...getSection(key), ...value };
  run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(merged),
  );
  return merged;
}

function hasSection(key) {
  return Boolean(all('SELECT key FROM settings WHERE key = ?', key).length);
}

module.exports = { DEFAULTS, SECTIONS, getSection, getAll, setSection, hasSection };
