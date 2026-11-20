const jwt = require('jsonwebtoken');
const config = require('../config');
const { get } = require('../db');
const { unauthorized, forbidden } = require('../lib/errors');

// Admin and storefront sessions use separate cookies so they never interfere with each other.
const COOKIES = {
  admin: 'gc_admin_session',
  customer: 'gc_session',
};

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
  };
}

function issueSession(res, user, scope) {
  const token = jwt.sign({ sub: user.id, role: user.role, scope }, config.jwtSecret, {
    expiresIn: `${config.sessionDays}d`,
  });
  res.cookie(COOKIES[scope], token, cookieOptions());
}

function clearSession(res, scope) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIES[scope], opts);
}

function readUser(req, scope) {
  const token = req.cookies?.[COOKIES[scope]];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.scope !== scope) return null;
    const user = get(
      'SELECT id, email, name, phone, role, is_active FROM users WHERE id = ?',
      payload.sub,
    );
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

/** Requires a signed-in admin/staff user. Optionally restrict to specific roles. */
function requireAdmin(...roles) {
  const allowed = roles.length ? roles : ['admin', 'staff'];
  return (req, res, next) => {
    const user = readUser(req, 'admin');
    if (!user || !['admin', 'staff'].includes(user.role)) return next(unauthorized());
    if (!allowed.includes(user.role)) return next(forbidden());
    req.user = user;
    next();
  };
}

/** Requires a signed-in storefront customer. */
function requireCustomer(req, res, next) {
  const user = readUser(req, 'customer');
  if (!user) return next(unauthorized('Please sign in to continue'));
  req.user = user;
  next();
}

/** Attaches the customer if signed in, but never blocks. */
function optionalCustomer(req, res, next) {
  req.user = readUser(req, 'customer');
  next();
}

module.exports = { issueSession, clearSession, requireAdmin, requireCustomer, optionalCustomer };
