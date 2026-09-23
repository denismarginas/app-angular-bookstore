const path = require('path');
const { asyncHandler } = require('./async-handler');

const ORDER_STATUSES = ['In progress', 'Shipping', 'Complete', 'Canceled', 'Returned'];
const USER_ROLES = ['Customer', 'Admin'];

function toPublicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function findAdmin(db, adminId) {
  const users = await db.getUsers();
  return users.find(user => user.id === adminId && user.role === 'Admin') || null;
}

function getAdminId(req) {
  const raw = req.body && req.body.admin_id !== undefined ? req.body.admin_id : req.query.admin_id;
  return Number(raw);
}

async function requireAdmin(db, req, res) {
  const admin = await findAdmin(db, getAdminId(req));

  if (!admin) {
    res.status(403).json({ message: 'Admin access required' });
    return null;
  }

  return admin;
}

function slugify(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(books, base, excludeId) {
  const root = base || 'book';
  let slug = root;
  let counter = 2;

  while (books.some(book => book.slug === slug && book.id !== excludeId)) {
    slug = `${root}-${counter}`;
    counter += 1;
  }

  return slug;
}

function validateOrderPayload(body) {
  const { customer, address, items, shipping, payment } = body || {};

  if (!customer || !customer.first_name || !customer.last_name || !customer.email || !customer.phone) {
    return 'Customer first name, last name, email and phone are required';
  }

  if (!address || !address.address_line || !address.city || !address.postal_code || !address.country) {
    return 'Address line, city, postal code and country are required';
  }

  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one order item is required';
  }

  for (const item of items) {
    if (!item || typeof item.id !== 'number' || !item.quantity || item.quantity < 1) {
      return 'Each item needs a book and a quantity of at least 1';
    }
  }

  if (!shipping || !shipping.id || !shipping.name || typeof shipping.price !== 'number') {
    return 'A shipping method is required';
  }

  if (!payment || !payment.id || !payment.name) {
    return 'A payment method is required';
  }

  return null;
}

async function buildOrderItems(db, items, res) {
  const books = await db.getBooks();
  const orderItems = [];

  for (const item of items) {
    const book = books.find(candidate => candidate.id === item.id);

    if (!book) {
      res.status(400).json({ message: `Book ${item.id} not found` });
      return null;
    }

    const price = book.sale_price ?? book.price;

    orderItems.push({
      id: book.id,
      title: book.title,
      quantity: item.quantity,
      price,
      total_price: price * item.quantity
    });
  }

  return orderItems;
}

function registerAdminRoutes(app, db) {
  app.get('/api/admin/users', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    res.json((await db.getUsers()).map(toPublicUser));
  }));

  app.get('/api/admin/users/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const users = await db.getUsers();
    const user = users.find(candidate => candidate.id === Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(toPublicUser(user));
  }));

  app.post('/api/admin/users', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const { email, password, first_name, last_name, phone, role, address } = req.body || {};

    if (!email || !password || !first_name || !last_name || !phone) {
      res.status(400).json({ message: 'Email, password, first name, last name and phone are required' });
      return;
    }

    if (role && !USER_ROLES.includes(role)) {
      res.status(400).json({ message: `Role must be one of: ${USER_ROLES.join(', ')}` });
      return;
    }

    const users = await db.getUsers();

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;

    const user = {
      id: nextId,
      email,
      password,
      first_name,
      last_name,
      phone,
      role: role || 'Customer',
      address: {
        address_line: address?.address_line || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || ''
      }
    };

    users.push(user);
    await db.saveUsers(users);

    res.status(201).json(toPublicUser(user));
  }));

  app.put('/api/admin/users/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const users = await db.getUsers();
    const user = users.find(candidate => candidate.id === Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { email, password, first_name, last_name, phone, role, address } = req.body || {};

    if (email !== undefined) {
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      if (users.some(candidate => candidate.id !== user.id && candidate.email.toLowerCase() === email.toLowerCase())) {
        res.status(409).json({ message: 'An account with this email already exists' });
        return;
      }

      user.email = email;
    }

    if (password) {
      user.password = password;
    }

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;

    if (role !== undefined) {
      if (!USER_ROLES.includes(role)) {
        res.status(400).json({ message: `Role must be one of: ${USER_ROLES.join(', ')}` });
        return;
      }

      user.role = role;
    }

    if (address !== undefined) {
      user.address = { ...user.address, ...address };
    }

    await db.saveUsers(users);

    res.json(toPublicUser(user));
  }));

  app.delete('/api/admin/users/:id', asyncHandler(async (req, res) => {
    const admin = await requireAdmin(db, req, res);
    if (!admin) return;

    const targetId = Number(req.params.id);

    if (targetId === admin.id) {
      res.status(400).json({ message: 'You cannot delete your own account while logged in' });
      return;
    }

    const users = await db.getUsers();
    const user = users.find(candidate => candidate.id === targetId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await db.saveUsers(users.filter(candidate => candidate.id !== targetId));

    res.status(204).end();
  }));

  app.put('/api/admin/users/:id/role', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const { role } = req.body || {};

    if (!USER_ROLES.includes(role)) {
      res.status(400).json({ message: `Role must be one of: ${USER_ROLES.join(', ')}` });
      return;
    }

    const users = await db.getUsers();
    const user = users.find(candidate => candidate.id === Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.role = role;
    await db.saveUsers(users);

    res.json(toPublicUser(user));
  }));

  app.post('/api/admin/orders', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const validationError = validateOrderPayload(req.body);

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { customer, address, items, shipping, payment, status, date } = req.body;

    if (status && !ORDER_STATUSES.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
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

    const orderItems = await buildOrderItems(db, items, res);

    if (!orderItems) {
      return;
    }

    for (const item of orderItems) {
      const book = books.find(candidate => candidate.id === item.id);
      book.quantity = Math.max(0, book.quantity - item.quantity);
    }

    await db.saveBooks(books);

    const orders = await db.getOrders();
    const store = await db.getStore();
    const nextOrderId = orders.reduce((max, order) => Math.max(max, order.order_id), 100) + 1;
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

    const order = {
      order_id: nextOrderId,
      status: status || 'In progress',
      date: date || new Date().toISOString().slice(0, 10),
      customer,
      address,
      store,
      items: orderItems,
      shipping,
      payment,
      order_total: itemsTotal + shipping.price
    };

    orders.push(order);
    await db.saveOrders(orders);

    res.status(201).json(order);
  }));

  app.put('/api/admin/orders/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const orders = await db.getOrders();
    const order = orders.find(candidate => candidate.order_id === Number(req.params.id));

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const validationError = validateOrderPayload(req.body);

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { customer, address, items, shipping, payment, status, date } = req.body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
      return;
    }

    const orderItems = await buildOrderItems(db, items, res);

    if (!orderItems) {
      return;
    }

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

    order.status = status;
    order.date = date || order.date;
    order.customer = customer;
    order.address = address;
    order.items = orderItems;
    order.shipping = shipping;
    order.payment = payment;
    order.order_total = itemsTotal + shipping.price;

    await db.saveOrders(orders);

    res.json(order);
  }));

  app.put('/api/admin/orders/:id/status', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const { status } = req.body || {};

    if (!ORDER_STATUSES.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
      return;
    }

    const orders = await db.getOrders();
    const order = orders.find(candidate => candidate.order_id === Number(req.params.id));

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = status;
    await db.saveOrders(orders);

    res.json(order);
  }));

  app.delete('/api/admin/orders/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const orders = await db.getOrders();
    const order = orders.find(candidate => candidate.order_id === Number(req.params.id));

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    await db.saveOrders(orders.filter(candidate => candidate.order_id !== order.order_id));

    res.status(204).end();
  }));

  app.post('/api/admin/books', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const {
      slug,
      title,
      author,
      price,
      sale_price,
      date_published,
      quantity,
      in_stock,
      description,
      feature_image,
      images
    } = req.body || {};

    if (!title || !author || typeof price !== 'number' || !date_published) {
      res.status(400).json({ message: 'Title, author, price and date published are required' });
      return;
    }

    const books = await db.getBooks();
    const nextId = books.reduce((max, book) => Math.max(max, book.id), 0) + 1;
    const finalSlug = uniqueSlug(books, slugify(slug || title), nextId);

    const book = {
      id: nextId,
      slug: finalSlug,
      title,
      author,
      price,
      sale_price: sale_price === undefined ? null : sale_price,
      date_published,
      quantity: typeof quantity === 'number' ? quantity : 0,
      in_stock: typeof in_stock === 'boolean' ? in_stock : true,
      description: description || '',
      feature_image: feature_image || '',
      images: Array.isArray(images) ? images : []
    };

    books.push(book);
    await db.saveBooks(books);

    res.status(201).json(book);
  }));

  app.put('/api/admin/books/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const books = await db.getBooks();
    const book = books.find(candidate => candidate.id === Number(req.params.id));

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    const {
      slug,
      title,
      author,
      price,
      sale_price,
      date_published,
      quantity,
      in_stock,
      description,
      feature_image,
      images
    } = req.body || {};

    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (price !== undefined) book.price = price;
    if (sale_price !== undefined) book.sale_price = sale_price;
    if (date_published !== undefined) book.date_published = date_published;
    if (quantity !== undefined) book.quantity = quantity;
    if (in_stock !== undefined) book.in_stock = in_stock;
    if (description !== undefined) book.description = description;
    if (feature_image !== undefined) book.feature_image = feature_image;
    if (images !== undefined) book.images = images;

    if (slug !== undefined) {
      book.slug = uniqueSlug(books, slugify(slug || title || book.title), book.id);
    }

    await db.saveBooks(books);

    res.json(book);
  }));

  app.delete('/api/admin/books/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const books = await db.getBooks();
    const book = books.find(candidate => candidate.id === Number(req.params.id));

    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    await db.saveBooks(books.filter(candidate => candidate.id !== book.id));

    res.status(204).end();
  }));

  app.get('/api/admin/contact-mails', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const mails = await db.getContactMails();
    const sorted = [...mails].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(sorted);
  }));

  app.delete('/api/admin/contact-mails/:id', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const mails = await db.getContactMails();
    const mail = mails.find(candidate => candidate.id === Number(req.params.id));

    if (!mail) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    await db.saveContactMails(mails.filter(candidate => candidate.id !== mail.id));

    res.status(204).end();
  }));

  app.post('/api/admin/books/upload-image', asyncHandler(async (req, res) => {
    if (!(await requireAdmin(db, req, res))) return;

    const { filename, data } = req.body || {};

    if (!filename || !data) {
      res.status(400).json({ message: 'A filename and image data are required' });
      return;
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(data);

    if (!match) {
      res.status(400).json({ message: 'Image data must be a base64 data URL' });
      return;
    }

    const contentType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const ext = path.extname(filename) || '.webp';
    const baseName = slugify(path.basename(filename, path.extname(filename))) || 'image';
    const desiredName = `${baseName}${ext}`;

    const result = await db.uploadBookImage({ filename: desiredName, buffer, contentType });

    res.status(201).json(result);
  }));
}

module.exports = { registerAdminRoutes, ORDER_STATUSES, USER_ROLES };
