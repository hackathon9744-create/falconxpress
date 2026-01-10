console.warn("⚠ Redis disabled — using in-memory store");

module.exports = {
  async set() {},
  async get() {},
  async del() {}
};