const { HttpError } = require('../lib/errors');
const config = require('../config');

function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, ...(err.details || {}) } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON body' } });
  }
  // SQLite constraint violations -> 409 with a readable message
  if (err?.code === 'ERR_SQLITE_ERROR' && /UNIQUE constraint failed/i.test(err.message)) {
    const column = err.message.split('.').pop().trim();
    const FRIENDLY = { email: 'email', sku: 'SKU', code: 'code', slug: 'URL slug' };
    console.warn('[conflict]', err.message);
    if (FRIENDLY[column]) {
      return res.status(409).json({
        error: { message: `This ${FRIENDLY[column]} is already in use`, fields: { [column]: 'Already in use' } },
      });
    }
    return res.status(409).json({ error: { message: 'This conflicts with an existing record. Please try again.' } });
  }
  console.error('[error]', err);
  res.status(500).json({
    error: { message: 'Something went wrong on our side. Please try again.', ...(config.isProduction ? {} : { debug: err?.message }) },
  });
}

module.exports = { notFoundHandler, errorHandler };
