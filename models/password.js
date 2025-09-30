import bcrypt from 'bcryptjs';

function hash(password) {
  const rounds = getNumberOfHashingRounds();
  return bcrypt.hash(password, rounds);
}

function getNumberOfHashingRounds() {
  return process.env.NODE_ENV === 'production' ? 14 : 1;
}

async function compare(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

const password = {
  hash,
  compare
}

export default password;