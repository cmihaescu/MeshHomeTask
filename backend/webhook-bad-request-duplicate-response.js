const express = require('express');
const router = express.Router();

// POST /webhook - returns "Duplicate request" response to all webhook calls
router.post('/webhook', (req, res) => {
  console.log('=== Mesh Webhook Received (Duplicate Response) ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('==================================================');

  res.set({
    'Server': 'nginx',
    'Connection': 'keep-alive',
    'Set-Cookie': 'AIOHTTP_SESSION=""; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/plain; charset=utf-8',
  });

  res.status(400).send('Duplicate request');
});

module.exports = router;
