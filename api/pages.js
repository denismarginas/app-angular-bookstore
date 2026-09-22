const { asyncHandler } = require('./async-handler');

function registerPageRoutes(app, db) {
  app.get('/api/pages', asyncHandler(async (req, res) => {
    res.json(await db.getPages());
  }));

  app.get('/api/pages/:slug', asyncHandler(async (req, res) => {
    const pages = await db.getPages();
    const page = pages.find(item => item.slug === req.params.slug);

    if (!page) {
      res.status(404).json({ message: 'Page not found' });
      return;
    }

    res.json(page);
  }));
}

module.exports = { registerPageRoutes };
