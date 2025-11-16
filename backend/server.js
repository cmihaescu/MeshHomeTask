const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const store = require('./store');
const MeshClient = require('./meshClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Mesh Client
const meshClient = new MeshClient({
  clientId: process.env.MESH_CLIENT_ID,
  clientSecret: process.env.MESH_CLIENT_SECRET,
  apiUrl: process.env.MESH_API_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = store.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = store.getProductById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order (replaces purchase endpoint)
app.post('/api/orders', (req, res) => {
  try {
    const { items, total, paymentMethod, meshPayload } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Validate stock for all items
    for (const item of items) {
      const product = store.getProductById(item.id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.name}. Available: ${product.stock}`
        });
      }
    }

    // Create order
    const order = {
      orderId: uuidv4(),
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        pricePerUnit: item.price,
        totalAmount: item.price * item.quantity,
      })),
      total,
      paymentMethod: paymentMethod || 'manual',
      meshPayload: meshPayload || null,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Update stock for all items
    for (const item of items) {
      store.updateProductStock(item.id, -item.quantity);
    }

    // Store order (using transaction storage for now)
    store.addTransaction(order);

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (public for now, could be filtered by session/user later)
app.get('/api/orders', (req, res) => {
  try {
    const orders = store.getAllTransactions();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mesh Connect: Generate Link Token
app.post('/api/mesh/link-token', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!meshClient.clientId || !meshClient.clientSecret) {
      return res.status(500).json({
        error: 'Mesh Connect not configured. Please set MESH_CLIENT_ID and MESH_CLIENT_SECRET environment variables.'
      });
    }

    const linkToken = await meshClient.createLinkToken({
      userId: userId || `anonymous_${uuidv4()}`,
    });

    res.json(linkToken);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({
      error: 'Failed to create link token',
      details: error.message
    });
  }
});

// Mesh Connect: Get Account Holdings
app.get('/api/mesh/holdings/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const holdings = await meshClient.getHoldings(accountId);
    res.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({
      error: 'Failed to fetch holdings',
      details: error.message
    });
  }
});

// Mesh Connect: Get Account Transactions
app.get('/api/mesh/transactions/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = await meshClient.getTransactions(accountId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

// Mesh Connect: Get Auth Token
app.get('/api/mesh/auth/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const authToken = await meshClient.getAuthToken(accountId);
    res.json(authToken);
  } catch (error) {
    console.error('Error fetching auth token:', error);
    res.status(500).json({
      error: 'Failed to fetch auth token',
      details: error.message
    });
  }
});

// Mesh Connect: Execute Transfer
app.post('/api/mesh/transfer', async (req, res) => {
  try {
    const transferParams = req.body;
    const transfer = await meshClient.executeTransfer(transferParams);
    res.json(transfer);
  } catch (error) {
    console.error('Error executing transfer:', error);
    res.status(500).json({
      error: 'Failed to execute transfer',
      details: error.message
    });
  }
});

// Mesh Connect: Get Transfer Status
app.get('/api/mesh/transfer/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    const status = await meshClient.getTransferStatus(transferId);
    res.json(status);
  } catch (error) {
    console.error('Error fetching transfer status:', error);
    res.status(500).json({
      error: 'Failed to fetch transfer status',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mesh Connect configured: ${!!(meshClient.clientId && meshClient.clientSecret)}`);
});
