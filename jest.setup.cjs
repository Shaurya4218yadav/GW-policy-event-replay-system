require('@testing-library/jest-dom');

// Node.js 18+ provides global fetch, but JSDOM might not expose it correctly in Jest.
// We use globalThis to access the native Node fetch.
if (typeof global.fetch === 'undefined') {
  global.fetch = globalThis.fetch;
  global.Request = globalThis.Request;
  global.Response = globalThis.Response;
  global.Headers = globalThis.Headers;
}
