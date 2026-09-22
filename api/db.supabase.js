function createDb() {
  const { createClient } = require('@supabase/supabase-js');

  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const bucket = process.env.SUPABASE_BOOKS_BUCKET || 'book-images';

  async function selectAll(table, orderColumn) {
    const { data, error } = await client.from(table).select('*').order(orderColumn, { ascending: true });

    if (error) {
      throw new Error(`Failed to read ${table}: ${error.message}`);
    }

    return data;
  }

  async function upsertAll(table, rows, conflictColumn) {
    const { error } = await client.from(table).upsert(rows, { onConflict: conflictColumn });

    if (error) {
      throw new Error(`Failed to save ${table}: ${error.message}`);
    }
  }

  return {
    getBooks: () => selectAll('books', 'id'),
    saveBooks: books => upsertAll('books', books, 'id'),
    getOrders: () => selectAll('orders', 'order_id'),
    saveOrders: orders => upsertAll('orders', orders, 'order_id'),
    getStore: async () => {
      const { data, error } = await client.from('store').select('*').eq('id', 1).single();

      if (error) {
        throw new Error(`Failed to read store: ${error.message}`);
      }

      return data;
    },
    getUsers: () => selectAll('users', 'id'),
    saveUsers: users => upsertAll('users', users, 'id'),
    getContactMails: () => selectAll('contact_mails', 'id'),
    saveContactMails: mails => upsertAll('contact_mails', mails, 'id'),
    getPages: () => selectAll('pages', 'id'),
    uploadBookImage: async ({ filename, buffer, contentType }) => {
      const { error } = await client.storage.from(bucket).upload(filename, buffer, {
        contentType,
        upsert: true
      });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      const { data } = client.storage.from(bucket).getPublicUrl(filename);

      return { path: data.publicUrl };
    }
  };
}

module.exports = { createDb };
