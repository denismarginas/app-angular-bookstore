const { Pool, types } = require('pg');
const { put, list } = require('@vercel/blob');

types.setTypeParser(1082, value => value);

function toNumber(value) {
  return value === null || value === undefined ? value : Number(value);
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return JSON.parse(value);
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value);
}

function createBlobUrlResolver() {
  let cache = null;

  return async function resolveImage(value) {
    if (!value || isAbsoluteUrl(value)) return value;

    if (!process.env.BLOB_READ_WRITE_TOKEN) return value;

    if (!cache) {
      cache = list({ prefix: 'books/' })
        .then(result => {
          const map = new Map();

          for (const blob of result.blobs) {
            map.set(blob.pathname, blob.url);
          }

          return map;
        })
        .catch(() => new Map());
    }

    const map = await cache;
    return map.get(value) || value;
  };
}

function sanitizeConnectionString(connectionString) {
  if (!connectionString) return connectionString;

  try {
    const url = new URL(connectionString);

    url.searchParams.delete('sslmode');
    url.searchParams.delete('sslrootcert');
    url.searchParams.delete('sslcert');
    url.searchParams.delete('sslkey');
    url.searchParams.delete('uselibpqcompat');

    return url.toString();
  } catch (err) {
    return connectionString;
  }
}

function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    author: row.author,
    price: toNumber(row.price),
    sale_price: row.sale_price === null ? null : toNumber(row.sale_price),
    date_published: row.date_published,
    quantity: row.quantity,
    in_stock: row.in_stock,
    description: row.description || '',
    feature_image: row.feature_image || '',
    images: toArray(row.images)
  };
}

function mapOrder(row) {
  return {
    order_id: row.order_id,
    status: row.status,
    date: row.date,
    customer: {
      first_name: row.customer_first_name,
      last_name: row.customer_last_name,
      email: row.customer_email,
      phone: row.customer_phone
    },
    address: {
      address_line: row.address_line,
      city: row.city,
      state: row.state || '',
      postal_code: row.postal_code,
      country: row.country
    },
    store: {
      name: row.store_name,
      address: row.store_address || '',
      cui: row.store_cui,
      email: row.store_email,
      phone: row.store_phone
    },
    items: toArray(row.items),
    shipping: {
      id: row.shipping_id,
      name: row.shipping_name,
      price: toNumber(row.shipping_price)
    },
    payment: {
      id: row.payment_id,
      name: row.payment_name
    },
    order_total: toNumber(row.order_total)
  };
}

function mapUser(row) {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    role: row.role,
    address: {
      address_line: row.address_line || '',
      city: row.city || '',
      state: row.state || '',
      postal_code: row.postal_code || '',
      country: row.country || ''
    }
  };
}

function mapContactMail(row) {
  return {
    id: row.id,
    date: row.date instanceof Date ? row.date.toISOString() : row.date,
    subject: row.subject || '',
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone || '',
    email: row.email,
    order_id: row.order_id || '',
    message: row.message
  };
}

function normalizeNewlines(value) {
  if (!value) return value;
  return value.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
}

function mapPage(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: normalizeNewlines(row.content)
  };
}

function createDb(options = {}) {
  const pool = new Pool({
    connectionString: sanitizeConnectionString(options.connectionString || process.env.POSTGRES_URL),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000
  });

  const resolveImage = createBlobUrlResolver();

  async function getBooks() {
    const { rows } = await pool.query('SELECT * FROM books ORDER BY id');
    const books = rows.map(mapBook);

    await Promise.all(books.map(async book => {
      book.feature_image = await resolveImage(book.feature_image);
      book.images = await Promise.all(book.images.map(resolveImage));
    }));

    return books;
  }

  async function saveBooks(books) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const book of books) {
        await client.query(
          `INSERT INTO books (id, title, slug, author, price, sale_price, date_published, quantity, in_stock, description, feature_image, images)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             slug = EXCLUDED.slug,
             author = EXCLUDED.author,
             price = EXCLUDED.price,
             sale_price = EXCLUDED.sale_price,
             date_published = EXCLUDED.date_published,
             quantity = EXCLUDED.quantity,
             in_stock = EXCLUDED.in_stock,
             description = EXCLUDED.description,
             feature_image = EXCLUDED.feature_image,
             images = EXCLUDED.images`,
          [
            book.id,
            book.title,
            book.slug,
            book.author,
            book.price,
            book.sale_price === undefined ? null : book.sale_price,
            book.date_published,
            book.quantity,
            book.in_stock,
            book.description || '',
            book.feature_image || '',
            JSON.stringify(book.images || [])
          ]
        );
      }

      const ids = books.map(book => book.id);

      if (ids.length > 0) {
        await client.query('DELETE FROM books WHERE id != ALL($1)', [ids]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async function getOrders() {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY order_id');
    return rows.map(mapOrder);
  }

  async function saveOrders(orders) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const order of orders) {
        await client.query(
          `INSERT INTO orders (
             order_id, status, date,
             customer_first_name, customer_last_name, customer_email, customer_phone,
             address_line, city, state, postal_code, country,
             store_name, store_address, store_cui, store_email, store_phone,
             items,
             shipping_id, shipping_name, shipping_price,
             payment_id, payment_name,
             order_total
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
           ON CONFLICT (order_id) DO UPDATE SET
             status = EXCLUDED.status,
             date = EXCLUDED.date,
             customer_first_name = EXCLUDED.customer_first_name,
             customer_last_name = EXCLUDED.customer_last_name,
             customer_email = EXCLUDED.customer_email,
             customer_phone = EXCLUDED.customer_phone,
             address_line = EXCLUDED.address_line,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             postal_code = EXCLUDED.postal_code,
             country = EXCLUDED.country,
             store_name = EXCLUDED.store_name,
             store_address = EXCLUDED.store_address,
             store_cui = EXCLUDED.store_cui,
             store_email = EXCLUDED.store_email,
             store_phone = EXCLUDED.store_phone,
             items = EXCLUDED.items,
             shipping_id = EXCLUDED.shipping_id,
             shipping_name = EXCLUDED.shipping_name,
             shipping_price = EXCLUDED.shipping_price,
             payment_id = EXCLUDED.payment_id,
             payment_name = EXCLUDED.payment_name,
             order_total = EXCLUDED.order_total`,
          [
            order.order_id,
            order.status,
            order.date,
            order.customer.first_name,
            order.customer.last_name,
            order.customer.email,
            order.customer.phone,
            order.address.address_line,
            order.address.city,
            order.address.state || '',
            order.address.postal_code,
            order.address.country,
            order.store.name,
            order.store.address || '',
            order.store.cui,
            order.store.email,
            order.store.phone,
            JSON.stringify(order.items || []),
            order.shipping.id,
            order.shipping.name,
            order.shipping.price,
            order.payment.id,
            order.payment.name,
            order.order_total
          ]
        );
      }

      const ids = orders.map(order => order.order_id);

      if (ids.length > 0) {
        await client.query('DELETE FROM orders WHERE order_id != ALL($1)', [ids]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async function getStore() {
    const { rows } = await pool.query('SELECT * FROM store ORDER BY id LIMIT 1');
    const row = rows[0];

    if (!row) return null;

    return {
      name: row.name,
      address: row.address || '',
      cui: row.cui,
      email: row.email,
      phone: row.phone || ''
    };
  }

  async function getUsers() {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    return rows.map(mapUser);
  }

  async function saveUsers(users) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const user of users) {
        await client.query(
          `INSERT INTO users (id, email, password, first_name, last_name, phone, role, address_line, city, state, postal_code, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             password = EXCLUDED.password,
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             phone = EXCLUDED.phone,
             role = EXCLUDED.role,
             address_line = EXCLUDED.address_line,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             postal_code = EXCLUDED.postal_code,
             country = EXCLUDED.country`,
          [
            user.id,
            user.email,
            user.password,
            user.first_name,
            user.last_name,
            user.phone,
            user.role,
            user.address?.address_line || '',
            user.address?.city || '',
            user.address?.state || '',
            user.address?.postal_code || '',
            user.address?.country || ''
          ]
        );
      }

      const ids = users.map(user => user.id);

      if (ids.length > 0) {
        await client.query('DELETE FROM users WHERE id != ALL($1)', [ids]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async function getContactMails() {
    const { rows } = await pool.query('SELECT * FROM contact_mails ORDER BY id');
    return rows.map(mapContactMail);
  }

  async function saveContactMails(mails) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const mail of mails) {
        await client.query(
          `INSERT INTO contact_mails (id, date, subject, first_name, last_name, phone, email, order_id, message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
             date = EXCLUDED.date,
             subject = EXCLUDED.subject,
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             order_id = EXCLUDED.order_id,
             message = EXCLUDED.message`,
          [
            mail.id,
            mail.date,
            mail.subject || '',
            mail.first_name,
            mail.last_name,
            mail.phone || '',
            mail.email,
            mail.order_id || '',
            mail.message
          ]
        );
      }

      const ids = mails.map(mail => mail.id);

      if (ids.length > 0) {
        await client.query('DELETE FROM contact_mails WHERE id != ALL($1)', [ids]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async function getPages() {
    const { rows } = await pool.query('SELECT * FROM pages ORDER BY id');
    return rows.map(mapPage);
  }

  async function uploadBookImage({ filename, buffer, contentType }) {
    const blob = await put(`books/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });

    return { path: blob.url };
  }

  return {
    getBooks,
    saveBooks,
    getOrders,
    saveOrders,
    getStore,
    getUsers,
    saveUsers,
    getContactMails,
    saveContactMails,
    getPages,
    uploadBookImage
  };
}

module.exports = { createDb };
