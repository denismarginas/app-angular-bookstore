const { asyncHandler } = require('./async-handler');

function registerContactRoutes(app, db) {
  app.post('/api/contact', asyncHandler(async (req, res) => {
    const { subject, first_name, last_name, phone, email, order_id, message } = req.body || {};

    if (!first_name || !last_name || !email || !message) {
      res.status(400).json({ message: 'First name, last name, email and message are required' });
      return;
    }

    const mails = await db.getContactMails();
    const nextId = mails.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const contactMail = {
      id: nextId,
      date: new Date().toISOString(),
      subject: subject || '',
      first_name,
      last_name,
      phone: phone || '',
      email,
      order_id: order_id || '',
      message
    };

    mails.push(contactMail);
    await db.saveContactMails(mails);

    res.status(201).json(contactMail);
  }));
}

module.exports = { registerContactRoutes };
