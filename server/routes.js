const express = require('express');
const { createDb } = require('./db-factory');
const { registerBookRoutes } = require('./books');
const { registerOrderRoutes } = require('./orders');
const { registerStoreRoutes } = require('./store');
const { registerUserRoutes } = require('./users');
const { registerContactRoutes } = require('./contact');
const { registerPageRoutes } = require('./pages');
const { registerAdminRoutes } = require('./admin');

function registerApiRoutes(app, dbDir) {
  const db = createDb(dbDir);

  app.use(express.json({ limit: '15mb' }));

  registerBookRoutes(app, db);
  registerOrderRoutes(app, db);
  registerStoreRoutes(app, db);
  registerUserRoutes(app, db);
  registerContactRoutes(app, db);
  registerPageRoutes(app, db);
  registerAdminRoutes(app, db);
}

module.exports = { registerApiRoutes };
