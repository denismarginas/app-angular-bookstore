function createDb(dbDir) {
  if (process.env.APP_ENV === 'production') {
    return require('./db.supabase').createDb();
  }

  return require('./db').createDb(dbDir);
}

module.exports = { createDb };
