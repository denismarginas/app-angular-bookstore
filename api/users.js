const { asyncHandler } = require('./async-handler');

function toPublicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function registerUserRoutes(app, db) {
  app.post('/api/register', asyncHandler(async (req, res) => {
    const { email, password, first_name, last_name, phone } = req.body || {};

    if (!email || !password || !first_name || !last_name || !phone) {
      res.status(400).json({ message: 'All fields are required' });
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
      role: 'Customer',
      address: {
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
      }
    };

    users.push(user);
    await db.saveUsers(users);

    res.status(201).json(toPublicUser(user));
  }));

  app.post('/api/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    const users = await db.getUsers();
    const user = users.find(candidate => candidate.email.toLowerCase() === (email || '').toLowerCase());

    if (!user || user.password !== password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.json(toPublicUser(user));
  }));

  app.put('/api/users/:id', asyncHandler(async (req, res) => {
    const users = await db.getUsers();
    const user = users.find(candidate => candidate.id === Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { first_name, last_name, phone, address } = req.body || {};

    if (first_name !== undefined) {
      user.first_name = first_name;
    }

    if (last_name !== undefined) {
      user.last_name = last_name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (address !== undefined) {
      user.address = { ...user.address, ...address };
    }

    await db.saveUsers(users);

    res.json(toPublicUser(user));
  }));
}

module.exports = { registerUserRoutes };
