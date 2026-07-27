// Vercel serverless entry point.
// All /api/* and /webhook* requests are rewritten here (see vercel.json) and
// handled by the same Express app used for local/Render deployments.
const app = require('../backend/server');

module.exports = app;
