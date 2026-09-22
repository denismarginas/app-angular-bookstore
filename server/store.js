const { asyncHandler } = require('./async-handler');

function registerStoreRoutes(app, db) {
  app.get('/api/store', asyncHandler(async (req, res) => {
    res.json(await db.getStore());
  }));
}

module.exports = { registerStoreRoutes };
