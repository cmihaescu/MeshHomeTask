// Vercel serverless entry point.
//
// Exposes the Express backend as a single serverless function. Every /api/* and
// /webhook request is rewritten to this file by vercel.json; the original URL
// path is preserved, so the app's existing routes (/api/products, /webhook, ...)
// match unchanged.
//
// NOTE: the backend keeps all state (users, tokens, transactions, wallet
// addresses) in an in-memory Store. Serverless instances are ephemeral and not
// shared, so that state resets on cold starts and is not consistent across
// concurrent invocations. For durable state, back the Store with a database
// (e.g. Vercel KV / Postgres).
module.exports = require('../backend/server.js');
