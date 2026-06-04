const express = require('express');
const router = express.Router();

// POST /webhook - receives Mesh Connect webhook events
router.post('/webhook', (req, res) => {
  console.log('=== Mesh Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('=============================');

  res.status(200).json({ received: true });
});

module.exports = router;
