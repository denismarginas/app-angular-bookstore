const { asyncHandler } = require('./async-handler');

function registerOrderRoutes(app, db) {
  app.get('/api/orders', asyncHandler(async (req, res) => {
    res.json(await db.getOrders());
  }));

  app.get('/api/orders/:id', asyncHandler(async (req, res) => {
    const orders = await db.getOrders();
    const order = orders.find(item => item.order_id === Number(req.params.id));

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(order);
  }));

  app.post('/api/orders', asyncHandler(async (req, res) => {
    const { customer, address, items, shipping, payment } = req.body || {};

    if (!customer || !address || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Invalid order payload' });
      return;
    }

    if (!shipping || !shipping.id || !shipping.name || typeof shipping.price !== 'number') {
      res.status(400).json({ message: 'A shipping method is required' });
      return;
    }

    if (!payment || !payment.id || !payment.name) {
      res.status(400).json({ message: 'A payment method is required' });
      return;
    }

    const books = await db.getBooks();

    for (const item of items) {
      const book = books.find(candidate => candidate.id === item.id);

      if (!book) {
        res.status(400).json({ message: `Book ${item.id} not found` });
        return;
      }

      if (!book.in_stock) {
        res.status(400).json({ message: `"${book.title}" is not available` });
        return;
      }
    }

    for (const item of items) {
      const book = books.find(candidate => candidate.id === item.id);
      book.quantity = Math.max(0, book.quantity - item.quantity);
    }

    await db.saveBooks(books);

    const orders = await db.getOrders();
    const store = await db.getStore();
    const nextOrderId = orders.reduce((max, order) => Math.max(max, order.order_id), 100) + 1;
    const itemsTotal = items.reduce((sum, item) => sum + item.total_price, 0);

    const order = {
      order_id: nextOrderId,
      status: 'In progress',
      date: new Date().toISOString().slice(0, 10),
      customer,
      address,
      store,
      items,
      shipping,
      payment,
      order_total: itemsTotal + shipping.price
    };

    orders.push(order);
    await db.saveOrders(orders);

    res.status(201).json(order);
  }));
}

module.exports = { registerOrderRoutes };
