let serverPromise;

module.exports = async (req, res) => {
  if (!serverPromise) {
    serverPromise = import('../dist/angular-bookstore1/server/server.mjs').then(module => module.app());
  }

  const server = await serverPromise;
  return server(req, res);
};
