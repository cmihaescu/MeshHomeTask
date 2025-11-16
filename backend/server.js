const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (store.getUserByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };

    store.addUser(user);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    store.addRefreshToken(refreshToken, user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    store.addRefreshToken(refreshToken, user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const userId = store.getUserIdByRefreshToken(refreshToken);
    if (!userId) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        store.removeRefreshToken(refreshToken);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      const user = store.getUserById(userId);
      if (!user) {
        return res.status(403).json({ error: 'User not found' });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      store.removeRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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

// Purchase product
app.post('/api/purchase', authenticateToken, (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid product ID and quantity are required' });
    }

    const product = store.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const totalAmount = product.price * quantity;
    const transaction = {
      id: uuidv4(),
      userId: req.user.id,
      productId,
      productName: product.name,
      quantity,
      pricePerUnit: product.price,
      totalAmount,
      createdAt: new Date().toISOString()
    };

    store.addTransaction(transaction);
    store.updateProductStock(productId, -quantity);

    res.status(201).json({
      message: 'Purchase successful',
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = store.getTransactionsByUserId(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = store.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
