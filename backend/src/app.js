const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config');
require('./db'); // opens the database and applies the schema
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow the storefront to load /uploads images
    contentSecurityPolicy: false, // API only; the SPA sets its own CSP at the edge in production
  }),
);
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Uploaded images (product photos, category images). Never executed, served with long cache.
app.use(
  '/uploads',
  express.static(config.uploadDir, {
    maxAge: '30d',
    immutable: true,
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }),
);

app.get('/api/status', (req, res) => res.json({ ok: true, message: 'GetChasma API is running' }));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/account', require('./routes/account'));
app.use('/api', require('./routes/store'));
app.use('/api', notFoundHandler);

// Serve the built storefront + admin SPA from the same origin whenever a build exists
// (always the case on Render; in local dev the Vite server is used instead).
const dist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
