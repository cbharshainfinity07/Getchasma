/** Store settings and team (admin users) management. */
const express = require('express');
const { all, get, run } = require('../../db');
const { validate } = require('../../middleware/validate');
const { requireAdmin } = require('../../middleware/auth');
const { badRequest, conflict, notFound } = require('../../lib/errors');
const password = require('../../lib/password');
const S = require('../../lib/schemas');
const settings = require('../../services/settings');
const payments = require('../../services/payments');
const config = require('../../config');
const { z } = require('zod');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    ...settings.getAll(),
    integrations: {
      razorpayConfigured: config.razorpay.enabled,
      razorpayKeyId: config.razorpay.keyId ? `${config.razorpay.keyId.slice(0, 12)}…` : null,
    },
    paymentMethods: payments.availableMethods(null),
  });
});

router.put('/:section', requireAdmin('admin'), (req, res) => {
  const section = req.params.section;
  const schema = S.settingsSchemas[section];
  if (!schema) throw badRequest('Unknown settings section');
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const fields = {};
    for (const i of parsed.error.issues) fields[i.path.join('.')] ||= i.message;
    throw badRequest('Please check the highlighted fields', { fields });
  }
  res.json(settings.setSection(section, parsed.data));
});

// ------------------------------------------------------------------ team

const team = express.Router();
team.use(requireAdmin('admin'));

const userDTO = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: Boolean(u.is_active),
  lastLoginAt: u.last_login_at,
  createdAt: u.created_at,
});

team.get('/', (req, res) => {
  res.json(all("SELECT * FROM users WHERE role IN ('admin', 'staff') ORDER BY created_at").map(userDTO));
});

team.post('/', validate(S.staffUser), async (req, res) => {
  if (get('SELECT id FROM users WHERE email = ?', req.body.email)) {
    throw conflict('A user with this email already exists', { fields: { email: 'Already in use' } });
  }
  const r = run(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    req.body.email,
    await password.hash(req.body.password),
    req.body.name,
    req.body.role,
  );
  res.status(201).json(userDTO(get('SELECT * FROM users WHERE id = ?', r.lastInsertRowid)));
});

team.patch(
  '/:id',
  validate(z.object({ role: z.enum(['admin', 'staff']).optional(), isActive: z.boolean().optional() })),
  (req, res) => {
    const id = Number(req.params.id);
    const u = get("SELECT * FROM users WHERE id = ? AND role IN ('admin','staff')", id);
    if (!u) throw notFound('User not found');
    if (id === req.user.id) throw badRequest('You cannot change your own role or access');
    const role = req.body.role ?? u.role;
    const active = req.body.isActive ?? Boolean(u.is_active);
    if (u.role === 'admin' && (role !== 'admin' || !active)) {
      const admins = get("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND is_active = 1").n;
      if (admins <= 1) throw badRequest('At least one active admin is required');
    }
    run('UPDATE users SET role = ?, is_active = ? WHERE id = ?', role, active ? 1 : 0, id);
    res.json(userDTO(get('SELECT * FROM users WHERE id = ?', id)));
  },
);

module.exports = { settings: router, team };
