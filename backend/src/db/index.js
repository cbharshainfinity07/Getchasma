const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });

const db = new DatabaseSync(config.databaseFile);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

/**
 * Run `fn` inside a transaction. node:sqlite is synchronous, so this is atomic.
 * Re-entrant: nested calls join the outer transaction.
 */
let depth = 0;
function transaction(fn) {
  if (depth > 0) return fn();
  db.exec('BEGIN IMMEDIATE');
  depth += 1;
  try {
    const result = fn();
    depth -= 1;
    db.exec('COMMIT');
    return result;
  } catch (err) {
    depth -= 1;
    db.exec('ROLLBACK');
    throw err;
  }
}

const stmtCache = new Map();
/** Prepared statement cache. */
function q(sql) {
  let stmt = stmtCache.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    stmtCache.set(sql, stmt);
  }
  return stmt;
}

const all = (sql, ...params) => q(sql).all(...params);
const get = (sql, ...params) => q(sql).get(...params);
const run = (sql, ...params) => q(sql).run(...params);

const now = () => new Date().toISOString();

module.exports = { db, transaction, all, get, run, now };
