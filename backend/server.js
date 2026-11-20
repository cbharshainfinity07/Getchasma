const config = require('./src/config');
const app = require('./src/app');
const { ensureAdmin } = require('./src/db/bootstrap');
const { seedIfEmpty } = require('./src/db/seed');

ensureAdmin()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(config.port, () => {
      console.log(`GetChasma API running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
