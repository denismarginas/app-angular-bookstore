function createDb(dbDir) {
  const provider = (process.env.DB_PROVIDER || '').trim().toLowerCase();

  const usePostgres = provider === 'postgres'
    ? true
    : provider === 'local'
      ? false
      : Boolean(process.env.POSTGRES_URL);

  if (usePostgres) {
    const { createDb: createPostgresDb } = require('./db.postgres');
    return createPostgresDb();
  }

  const { createDb: createLocalDb } = require('./db');
  return createLocalDb(dbDir);
}

module.exports = { createDb };
