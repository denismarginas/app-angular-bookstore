function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(err => {
      console.error(err);

      if (!res.headersSent) {
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
      }
    });
  };
}

module.exports = { asyncHandler };
