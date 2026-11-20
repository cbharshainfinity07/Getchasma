const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Load backend/.env if present (Node >= 21 built-in, no dotenv dependency needed).
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set (min 32 chars) in production.');
  }
  // Development fallback: random per-process secret (sessions reset on restart).
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET not set — using a temporary secret. Sessions will reset on restart.');
}

const rootDir = path.join(__dirname, '..');

const config = {
  isProduction,
  port: Number(process.env.PORT) || 5001,
  jwtSecret,
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  databaseFile: path.resolve(rootDir, process.env.DATABASE_FILE || 'data/getchasma.db'),
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads'),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 5,
  // Comma-separated list of allowed browser origins for CORS (dev server is proxied, so usually not needed).
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  publicUrl: process.env.PUBLIC_URL || '',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'Store Admin',
  },
};

config.razorpay.enabled = Boolean(config.razorpay.keyId && config.razorpay.keySecret);

module.exports = config;
