const { get, run } = require('./index');
const config = require('../config');
const password = require('../lib/password');

/**
 * Make sure at least one admin account exists. Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD in
 * backend/.env and are only used when no admin exists yet — afterwards change the password in the dashboard.
 */
async function ensureAdmin() {
  const existing = get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (existing) return;
  const { email, password: plain, name } = config.admin;
  if (!email || !plain) {
    console.warn(
      '[bootstrap] No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env and restart to create one.',
    );
    return;
  }
  if (plain.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters');
  const taken = get('SELECT id, role FROM users WHERE email = ?', email);
  if (taken) {
    run("UPDATE users SET role = 'admin', password_hash = ?, is_active = 1 WHERE id = ?", await password.hash(plain), taken.id);
  } else {
    run("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')", email, await password.hash(plain), name);
  }
  console.log(`[bootstrap] Created admin account for ${email}`);
}

module.exports = { ensureAdmin };
