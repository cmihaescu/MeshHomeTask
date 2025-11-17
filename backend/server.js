const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const store = require('./store');
const MeshClient = require('./meshClient');
require('dotenv').config()

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

// Mesh Connect: Generate Payment Link Token
app.post('/api/mesh/payment-link', async (req, res) => {
  try {
    const { userId, amount, toAddresses } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!process.env.MESH_CLIENT_ID || !process.env.MESH_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Mesh Connect not configured. Please set MESH_CLIENT_ID and MESH_CLIENT_SECRET environment variables.'
      });
    }

    // Prepare toAddresses - if provided use those, otherwise use default
    const addresses = toAddresses && toAddresses.length > 0
      ? toAddresses.map(addr => ({
          networkId: addr.networkId,
          symbol: addr.symbol,
          address: addr.address,
          amount: amount // Set the checkout total as the amount
        }))
      : [{
          networkId: "e3c7fdd8-b1fc-4e51-85ae-bb276e075611",
          symbol: "USDC",
          address: "0x910aeb59ba75c8226a84e3c1b0db3b55a4ec2a40",
          amount: amount
        }];

    const requestBody = {
      userId: userId || uuidv4(),
      restrictMultipleAccounts: true,
      integrationId: process.env.MESH_INTEGRATION_ID,
      transferOptions: {
        transferType: "payment",
        toAddresses: addresses,
        isInclusiveFeeEnabled: false
      }
    };

    // Call Mesh API directly
    const response = await fetch(`${process.env.MESH_API_URL}/api/v1/linktoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': process.env.MESH_CLIENT_ID,
        'X-Client-Secret': process.env.MESH_CLIENT_SECRET
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mesh API error:', data);
      return res.status(response.status).json({
        error: 'Failed to create payment link',
        details: data.message || data.error
      });
    }

    res.json({
      linkToken: data.content?.linkToken,
      status: data.status,
      message: data.message
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({
      error: 'Failed to create payment link',
      details: error.message
    });
  }
});

// Mesh Connect: Get Portfolio by User ID
app.get('/api/mesh/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!process.env.MESH_CLIENT_ID || !process.env.MESH_CLIENT_SECRET) {
      return res.status(500).json({
        error: 'Mesh Connect not configured. Please set MESH_CLIENT_ID and MESH_CLIENT_SECRET environment variables.'
      });
    }

    // Call Mesh API for portfolio
    const response = await fetch(`${process.env.MESH_API_URL}/api/v1/holdings/portfolio?UserId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': process.env.MESH_CLIENT_ID,
        'X-Client-Secret': process.env.MESH_CLIENT_SECRET
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mesh API error:', data);
      return res.status(response.status).json({
        error: 'Failed to fetch portfolio',
        details: data.message || data.error
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      error: 'Failed to fetch portfolio',
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

// Wallet Address Management Endpoints

// Get wallet addresses for a user
app.get('/api/wallet-addresses/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = store.getWalletAddresses(userId);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add wallet address
app.post('/api/wallet-addresses', (req, res) => {
  try {
    const { userId, networkId, symbol, address } = req.body;

    if (!userId || !networkId || !symbol || !address) {
      return res.status(400).json({
        error: 'userId, networkId, symbol, and address are required'
      });
    }

    const walletAddress = {
      id: uuidv4(),
      networkId,
      symbol,
      address,
      createdAt: new Date().toISOString()
    };

    store.addWalletAddress(userId, walletAddress);

    res.status(201).json({
      message: 'Wallet address added successfully',
      address: walletAddress
    });
  } catch (error) {
    console.error('Error adding wallet address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete wallet address
app.delete('/api/wallet-addresses/:userId/:addressId', (req, res) => {
  try {
    const { userId, addressId } = req.params;
    store.removeWalletAddress(userId, addressId);
    res.json({ message: 'Wallet address deleted successfully' });
  } catch (error) {
    console.error('Error deleting wallet address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mesh Connect configured: ${!!(meshClient.clientId && meshClient.clientSecret)}`);
});
