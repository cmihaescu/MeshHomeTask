const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const store = require('./store');
const MeshClient = require('./meshClient');
const { resolveToAddress } = require('./networkAddresses');
const webhookRouter = require('./webhook');
const webhookBadRequestRouter = require('./webhook-bad-request-duplicate-response');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 8080;
const CoinIntegrationId="47624467-e52e-4938-a41a-7926b6c27acf"

// Default Mesh environment when the client doesn't specify one
const DEFAULT_MESH_ENV = (process.env.MESH_ENV || 'sandbox').toLowerCase();
// Default Link account configuration when the client doesn't specify one
const DEFAULT_LINK_VERSION = (process.env.MESH_LINK_VERSION || 'v2').toLowerCase();

// Resolve the active Mesh credentials/URL for the requested environment and
// Link account version. The frontend sends `env` ('sandbox' | 'production') and
// `linkVersion` ('v1' | 'v2') with each Mesh call; anything other than
// 'production'/'v1' falls back to sandbox/v2 respectively.
//
// The client ID varies by Link version; the client secret varies by both
// environment and Link version. Versioned vars fall back to the legacy
// non-versioned names so an unconfigured version still works.
function resolveMeshConfig(env, linkVersion) {
  const isProd = String(env || DEFAULT_MESH_ENV).toLowerCase() === 'production';
  const version = String(linkVersion || DEFAULT_LINK_VERSION).toLowerCase() === 'v1' ? 'v1' : 'v2';
  const V = version.toUpperCase(); // 'V1' | 'V2'

  const clientId =
    process.env[`MESH_CLIENT_ID_${V}`] || process.env.MESH_CLIENT_ID;

  const secretBase = isProd ? 'MESH_CLIENT_SECRET_PRODUCTION' : 'MESH_CLIENT_SECRET_SANDBOX';
  const clientSecret =
    process.env[`${secretBase}_${V}`] || process.env[secretBase];

  // API URL is shared across Link versions (only the account changes).
  const apiUrl = isProd
    ? process.env.MESH_API_URL_PRODUCTION
    : process.env.MESH_API_URL_SANDBOX;

  return { env: isProd ? 'production' : 'sandbox', linkVersion: version, clientId, clientSecret, apiUrl };
}

// Build a MeshClient for the requested environment and Link version
const meshClientFor = (env, linkVersion) => new MeshClient(resolveMeshConfig(env, linkVersion));

// In-memory cache for the (static) supported networks, keyed by env.
// The list rarely changes, so we only hit Mesh once per env per server run.
const networksCache = {};

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Mesh webhook
app.use(webhookRouter);
app.use(webhookBadRequestRouter);

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

// Mesh Connect: Generate Payment Link Token
app.post('/api/mesh/payment-link', async (req, res) => {
  try {
    const { userId, amount, transferType, env, linkVersion, selections, networkId, symbol, address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if(!userId) {
      return res.status(400).json({ error: 'No userId' });
    }

    const meshConfig = resolveMeshConfig(env, linkVersion);

    if (!meshConfig.clientId || !meshConfig.clientSecret) {
      return res.status(500).json({
        error: `Mesh Connect not configured for ${meshConfig.env} / Link ${meshConfig.linkVersion}. Please set the MESH_CLIENT_ID and client secret/API URL environment variables for this account.`
      });
    }

    const DEFAULT_NETWORK_ID = "aa883b03-120d-477c-a588-37c2afd3ca71"; // Base
    const DEFAULT_SYMBOL = "USDC";
    const DEFAULT_EVM_ADDRESS = "0x6A36e7e3682Ff903a0680Da2F8C5f2a34A3d3266";

    // Destination address resolution order (per combo):
    //   1. The per-network map in networkAddresses.js (valid for that chain)
    //   2. An address supplied in the request (shopper-provided at checkout when
    //      the selected network has no configured address)
    //   3. The default EVM receiving address (legacy fallback)
    const toAddressEntry = (combo) => ({
      networkId: combo.networkId,
      symbol: combo.symbol,
      address:
        resolveToAddress(combo.networkId, combo.symbol) ||
        combo.address ||
        DEFAULT_EVM_ADDRESS,
    });

    // The cart's network & token section is optional and multi-entry: every
    // provided combo becomes a toAddresses entry (alternative ways to pay).
    // No combos (and no legacy single selection) -> the EVM/USDC default.
    const providedSelections = Array.isArray(selections)
      ? selections.filter((s) => s && s.networkId && s.symbol)
      : [];

    let addresses;
    if (providedSelections.length > 0) {
      addresses = providedSelections.map(toAddressEntry);
    } else if (networkId) {
      // Legacy single-selection request shape (pre multi-combo clients).
      addresses = [toAddressEntry({ networkId, symbol: symbol || DEFAULT_SYMBOL, address })];
    } else {
      addresses = [toAddressEntry({ networkId: DEFAULT_NETWORK_ID, symbol: DEFAULT_SYMBOL })];
    }

    const requestBody = {
      userId: userId,
      restrictMultipleAccounts: true,
      transferOptions: {
        transferType:"deposit",
        toAddresses: addresses,
        isInclusiveFeeEnabled: false,
        // The full amount rides on transferOptions.amountInFiat (cart total for
        // payments, entered amount for deposits) — never on individual
        // toAddresses items.
        amountInFiat: amount
      }
    };
 console.log(`Link Created (${meshConfig.env}): `, JSON.stringify(requestBody))
    // Call Mesh API directly
    const response = await fetch(`${meshConfig.apiUrl}/api/v1/linktoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': meshConfig.clientId,
        'X-Client-Secret': meshConfig.clientSecret
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
app.get('/api/v1/holdings/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const meshConfig = resolveMeshConfig(req.query.env, req.query.linkVersion);

    if (!meshConfig.clientId || !meshConfig.clientSecret) {
      return res.status(500).json({
        error: `Mesh Connect not configured for ${meshConfig.env} / Link ${meshConfig.linkVersion}. Please set the MESH_CLIENT_ID and client secret/API URL environment variables for this account.`
      });
    }

    // Call Mesh API for portfolio
    const response = await fetch(`${meshConfig.apiUrl}/api/v1/holdings/portfolio?UserId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': meshConfig.clientId,
        'X-Client-Secret': meshConfig.clientSecret
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

// Mesh Connect: Get supported networks (and their tokens).
// Response is effectively static, so it's cached in-memory per env.
app.get('/api/mesh/networks', async (req, res) => {
  try {
    const meshConfig = resolveMeshConfig(req.query.env, req.query.linkVersion);

    if (!meshConfig.clientId || !meshConfig.clientSecret) {
      return res.status(500).json({
        error: `Mesh Connect not configured for ${meshConfig.env} / Link ${meshConfig.linkVersion}. Please set the MESH_CLIENT_ID and client secret/API URL environment variables for this account.`
      });
    }

    // Cache key is per-env and per-Link-version, since credentials differ.
    const cacheKey = `${meshConfig.env}:${meshConfig.linkVersion}`;
    if (networksCache[cacheKey]) {
      return res.json(networksCache[cacheKey]);
    }

    const response = await fetch(`${meshConfig.apiUrl}/api/v1/transfers/managed/networks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': meshConfig.clientId,
        'X-Client-Secret': meshConfig.clientSecret
      }
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Mesh API error (networks):', data);
      return res.status(response.status).json({
        error: 'Failed to fetch networks',
        details: data.message || data.error
      });
    }

    networksCache[cacheKey] = data;
    res.json(data);
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({
      error: 'Failed to fetch networks',
      details: error.message
    });
  }
});

// Mesh Connect: Does the selected network/token have a configured receiving
// address? The cart uses this to decide whether to prompt the shopper for a
// destination address. Network IDs are env-independent, so no env is needed.
app.get('/api/mesh/network-address', (req, res) => {
  const { networkId, symbol } = req.query;
  if (!networkId) {
    return res.status(400).json({ error: 'networkId is required' });
  }
  const resolved = resolveToAddress(networkId, symbol);
  res.json({ configured: !!resolved, address: resolved || null });
});

// Mesh Connect: Get Account Holdings
app.get('/api/mesh/holdings/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const holdings = await meshClientFor(req.query.env, req.query.linkVersion).getHoldings(accountId);
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
    const transactions = await meshClientFor(req.query.env, req.query.linkVersion).getTransactions(accountId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.message
    });
  }
});

// Mesh Token Management Endpoints

// Store Mesh tokens for a user
app.post('/api/mesh/store-tokens', (req, res) => {
  try {
    const { userId, accessToken, refreshToken } = req.body;

    if (!userId || !accessToken || !refreshToken) {
      return res.status(400).json({
        error: 'userId, accessToken, and refreshToken are required'
      });
    }

    store.setMeshTokens(userId, accessToken, refreshToken);

    res.status(200).json({
      message: 'Mesh tokens stored successfully'
    });
  } catch (error) {
    console.error('Error storing Mesh tokens:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Mesh tokens for a user
app.get('/api/mesh/tokens/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const tokens = store.getMeshTokens(userId);

    if (!tokens) {
      return res.status(404).json({ error: 'No tokens found for this user' });
    }

    res.json(tokens);
  } catch (error) {
    console.error('Error fetching Mesh tokens:', error);
    res.status(500).json({ error: 'Server error' });
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

// Serve frontend in production (when ../frontend/dist exists after build)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// Start server
app.listen(PORT, () => {
  const configured = (cfg) => !!(cfg.clientId && cfg.clientSecret && cfg.apiUrl);
  console.log(`Server running on port ${PORT}`);
  console.log(`Default Mesh environment: ${DEFAULT_MESH_ENV}`);
  console.log(`Default Link version: ${DEFAULT_LINK_VERSION}`);
  for (const version of ['v1', 'v2']) {
    console.log(`Mesh sandbox configured (Link ${version}): ${configured(resolveMeshConfig('sandbox', version))}`);
    console.log(`Mesh production configured (Link ${version}): ${configured(resolveMeshConfig('production', version))}`);
  }
  console.log(`\nTo receive webhooks from Mesh Connect, expose this server with ngrok:`);
  console.log(`  ngrok http ${PORT}`);
  console.log(`Then register the ngrok URL as: https://<your-id>.ngrok-free.app/webhook`);
});
