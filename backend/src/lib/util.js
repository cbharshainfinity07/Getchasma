const crypto = require('node:crypto');

/** Convert a major-unit amount (e.g. 1499.5 rupees) to integer minor units (paise). */
const toMinor = (major) => Math.round(Number(major) * 100);
/** Convert integer minor units to a major-unit number with 2-decimal precision. */
const toMajor = (minor) => (minor == null ? null : Math.round(minor) / 100);

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** Human-friendly unique order number, e.g. GC-24A7F3K9. */
function generateOrderNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `GC-${out}`;
}

/** Pagination helper: parses ?page & ?limit with sane bounds. */
function paginate(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

const bool = (v) => v === 1 || v === true || v === '1' || v === 'true';

module.exports = { toMinor, toMajor, slugify, parseJson, generateOrderNumber, paginate, bool };
