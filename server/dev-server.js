const path = require('path');
const express = require('express');
const { registerApiRoutes } = require('./routes');

const app = express();
const PORT = process.env.API_PORT || 3000;
const dbDir = path.join(__dirname, '..', 'src', 'assets', 'demo-db');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

registerApiRoutes(app, dbDir);

app.listen(PORT, () => {
  console.log(`Book Store API listening on http://localhost:${PORT}`);
});
