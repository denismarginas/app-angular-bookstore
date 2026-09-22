const fs = require('fs');
const path = require('path');

function createDb(dbDir) {
  const booksFile = path.join(dbDir, 'books.json');
  const ordersFile = path.join(dbDir, 'orders.json');
  const storeFile = path.join(dbDir, 'store.json');
  const usersFile = path.join(dbDir, 'users.json');
  const contactMailsFile = path.join(dbDir, 'contact-mails.json');
  const pagesFile = path.join(dbDir, 'pages.json');
  const booksImagesDir = path.join(dbDir, '..', 'img', 'books');

  function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  return {
    getBooks: () => readJson(booksFile),
    saveBooks: books => writeJson(booksFile, books),
    getOrders: () => readJson(ordersFile),
    saveOrders: orders => writeJson(ordersFile, orders),
    getStore: () => readJson(storeFile),
    getUsers: () => readJson(usersFile),
    saveUsers: users => writeJson(usersFile, users),
    getContactMails: () => readJson(contactMailsFile),
    saveContactMails: mails => writeJson(contactMailsFile, mails),
    getPages: () => readJson(pagesFile),
    uploadBookImage: ({ filename, buffer }) => {
      fs.mkdirSync(booksImagesDir, { recursive: true });

      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      let finalName = filename;
      let counter = 2;

      while (fs.existsSync(path.join(booksImagesDir, finalName))) {
        finalName = `${base}-${counter}${ext}`;
        counter += 1;
      }

      fs.writeFileSync(path.join(booksImagesDir, finalName), buffer);

      return { path: `src/assets/img/books/${finalName}` };
    }
  };
}

module.exports = { createDb };
