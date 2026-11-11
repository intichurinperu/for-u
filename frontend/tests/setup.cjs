// Node 18 does not expose browser Web Crypto globally by default.
// Match the browser environment used by the application's domain models.
if (!globalThis.crypto) {
  globalThis.crypto = require('node:crypto').webcrypto;
}
