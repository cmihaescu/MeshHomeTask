// In-memory store for users, tokens, and transactions
class Store {
  constructor() {
    this.users = new Map();
    this.tokens = new Map(); // Maps refresh tokens to user IDs
    this.transactions = [];
    this.walletAddresses = new Map(); // Maps user IDs to their wallet addresses
    this.products = [
      {
        id: 1,
        name: "Classic Running Shoes",
        category: "shoes",
        price: 89.99,
        description: "Comfortable running shoes for daily training",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        stock: 25
      },
      {
        id: 2,
        name: "Leather Sneakers",
        category: "shoes",
        price: 129.99,
        description: "Premium leather sneakers for casual wear",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        stock: 15
      },
      {
        id: 3,
        name: "Athletic Training Shoes",
        category: "shoes",
        price: 109.99,
        description: "High-performance training shoes",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
        stock: 30
      },
      {
        id: 4,
        name: "Cotton T-Shirt",
        category: "clothing",
        price: 24.99,
        description: "100% organic cotton t-shirt",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        stock: 50
      },
      {
        id: 5,
        name: "Denim Jeans",
        category: "clothing",
        price: 79.99,
        description: "Classic fit denim jeans",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        stock: 40
      },
      {
        id: 6,
        name: "Hooded Sweatshirt",
        category: "clothing",
        price: 59.99,
        description: "Warm and comfortable hoodie",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
        stock: 35
      },
      {
        id: 7,
        name: "Sports Jacket",
        category: "clothing",
        price: 149.99,
        description: "Water-resistant sports jacket",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        stock: 20
      },
      {
        id: 8,
        name: "Casual Loafers",
        category: "shoes",
        price: 94.99,
        description: "Comfortable slip-on loafers",
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400",
        stock: 18
      },
      {
        id: 9,
        name: "Chino Pants",
        category: "clothing",
        price: 69.99,
        description: "Versatile chino pants for any occasion",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
        stock: 45
      },
      {
        id: 10,
        name: "High-Top Sneakers",
        category: "shoes",
        price: 119.99,
        description: "Stylish high-top sneakers",
        image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400",
        stock: 22
      }
    ];
  }

  // User methods
  addUser(user) {
    this.users.set(user.email, user);
  }

  getUserByEmail(email) {
    return this.users.get(email);
  }

  getUserById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  // Token methods
  addRefreshToken(token, userId) {
    this.tokens.set(token, userId);
  }

  getUserIdByRefreshToken(token) {
    return this.tokens.get(token);
  }

  removeRefreshToken(token) {
    this.tokens.delete(token);
  }

  // Transaction methods
  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  getTransactionsByUserId(userId) {
    return this.transactions.filter(t => t.userId === userId);
  }

  getAllTransactions() {
    return this.transactions;
  }

  // Product methods
  getProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  updateProductStock(productId, quantity) {
    const product = this.getProductById(productId);
    if (product) {
      product.stock += quantity;
      return true;
    }
    return false;
  }

  // Wallet address methods
  getWalletAddresses(userId) {
    return this.walletAddresses.get(userId) || [];
  }

  setWalletAddresses(userId, addresses) {
    this.walletAddresses.set(userId, addresses);
  }

  addWalletAddress(userId, address) {
    const addresses = this.getWalletAddresses(userId);
    addresses.push(address);
    this.walletAddresses.set(userId, addresses);
  }

  removeWalletAddress(userId, addressId) {
    const addresses = this.getWalletAddresses(userId);
    const filtered = addresses.filter(addr => addr.id !== addressId);
    this.walletAddresses.set(userId, filtered);
  }
}

module.exports = new Store();
