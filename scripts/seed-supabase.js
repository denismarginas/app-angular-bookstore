require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const dbDir = path.join(__dirname, '..', 'src', 'assets', 'demo-db');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dbDir, name), 'utf-8'));
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file before running this script.');
    process.exit(1);
  }

  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const books = readJson('books.json');
  const orders = readJson('orders.json');
  const store = readJson('store.json');
  const users = readJson('users.json');
  const pages = readJson('pages.json');
  const contactMails = readJson('contact-mails.json');

  const tasks = [
    ['books', books, 'id'],
    ['orders', orders, 'order_id'],
    ['store', [{ id: 1, ...store }], 'id'],
    ['users', users, 'id'],
    ['pages', pages, 'id'],
    ['contact_mails', contactMails, 'id']
  ];

  for (const [table, rows, conflictColumn] of tasks) {
    if (!rows.length) {
      console.log(`Skipping ${table} (nothing to import)`);
      continue;
    }

    const { error } = await client.from(table).upsert(rows, { onConflict: conflictColumn });

    if (error) {
      console.error(`Failed to import ${table}:`, error.message);
      process.exit(1);
    }

    console.log(`Imported ${rows.length} row(s) into ${table}`);
  }

  console.log('Done.');
}

main();
