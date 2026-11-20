const express = require('express');
const rateLimit = require('express-rate-limit');
const { get, run, now } = require('../../db');
const { validate } = require('../../middleware/validate');
const { issueSession, clearSession, requireAdmin } = require('../../middleware/auth');
const { unauthorized, badRequest } = require('../../lib/errors');
const password = require('../../lib/password');
const S = require('../../lib/schemas');

const router = express.Router();

// Strict limiter on admin login to slow down credential stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' } },
});

const shape = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

router.post('/login', loginLimiter, validate(S.login), async (req, res) => {
  const user = get("SELECT * FROM users WHERE email = ? AND role IN ('admin', 'staff')", req.body.email);
  const ok = await password.verify(req.body.password, user?.password_hash);
  if (!user || !ok || !user.is_active) throw unauthorized('Incorrect email or password');
  run('UPDATE users SET last_login_at = ? WHERE id = ?', now(), user.id);
  issueSession(res, user, 'admin');
  res.json({ user: shape(user) });
});

router.post('/logout', (req, res) => {
  clearSession(res, 'admin');
  res.json({ ok: true });
});

router.get('/me', requireAdmin(), (req, res) => res.json({ user: shape(req.user) }));

router.put('/password', requireAdmin(), validate(S.changePassword), async (req, res) => {
  const u = get('SELECT password_hash FROM users WHERE id = ?', req.user.id);
  if (!(await password.verify(req.body.currentPassword, u.password_hash))) {
    throw badRequest('Current password is incorrect', { fields: { currentPassword: 'Incorrect password' } });
  }
  if (req.body.newPassword.length < 10) {
    throw badRequest('Admin passwords need at least 10 characters', { fields: { newPassword: 'Use at least 10 characters' } });
  }
  run('UPDATE users SET password_hash = ? WHERE id = ?', await password.hash(req.body.newPassword), req.user.id);
  res.json({ ok: true });
});

module.exports = router;
