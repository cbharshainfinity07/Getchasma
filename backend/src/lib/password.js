const bcrypt = require('bcryptjs');

const ROUNDS = 12;
let dummyHash;

const hash = (plain) => bcrypt.hash(plain, ROUNDS);

/** Compare a password; when the user doesn't exist we still hash, so timing doesn't reveal valid emails. */
async function verify(plain, storedHash) {
  if (!storedHash) {
    dummyHash ||= bcrypt.hashSync('timing-equaliser', ROUNDS);
    await bcrypt.compare(plain, dummyHash);
    return false;
  }
  return bcrypt.compare(plain, storedHash);
}

module.exports = { hash, verify };
