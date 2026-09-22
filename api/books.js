const { asyncHandler } = require('./async-handler');

function registerBookRoutes(app, db) {
  app.get('/api/books/search', asyncHandler(async (req, res) => {
    const q = (req.query.q || '').toString().trim().toLowerCase();

    if (!q) {
      res.json([]);
      return;
    }

    const books = await db.getBooks();
    const results = books.filter(
      book =>
        book.title.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q)
    );

    res.json(results);
  }));

  app.get('/api/books', asyncHandler(async (req, res) => {
    res.json(await db.getBooks());
  }));

  app.get('/api/books/:idOrSlug', asyncHandler(async (req, res) => {
    const books = await db.getBooks();
    const param = req.params.idOrSlug;

    let book = books.find(item => item.slug === param);

    if (!book) {
      const id = Number(param);

      if (!Number.isNaN(id)) {
        book = books.find(item => item.id === id);
      }
    }

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    res.json(book);
  }));
}

module.exports = { registerBookRoutes };
