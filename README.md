# Demo Shop - Shoes & Clothing

A full-stack e-commerce demo application built with React and Node.js, featuring shopping cart, checkout, Mesh Connect cryptocurrency payment integration, user authentication, wallet management, and real-time portfolio tracking.

## Features

- Browse 10 products (shoes and clothing)
- Shopping cart with quantity management
- User authentication and profile management
- Checkout with Mesh Connect crypto payment integration
- Wallet address management (add/remove multiple wallets)
- Real-time cryptocurrency portfolio tracking with performance metrics
- Order confirmation with portfolio display
- Transaction history viewing
- In-memory data storage
- Full Mesh Connect API client integration

## Tech Stack

### Backend
- Node.js
- Express.js
- Mesh Connect API Client (custom implementation)
- In-memory store for data persistence

### Frontend
- React 18
- React Router for navigation
- Context API for cart and authentication state management
- Mesh Connect Web Link SDK (@meshconnect/web-link-sdk)
- Vite for fast development
- LocalStorage for cart and auth persistence

## Project Structure

```
MeshHomeTask/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server with all API routes
│   ├── store.js           # In-memory data store (users, tokens, wallets, orders)
│   ├── meshClient.js      # Mesh Connect API client
│   ├── .env.example       # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico    # Application favicon
│   ├── .env.example       # Frontend environment variables
│   ├── .gitignore
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── contexts/
│       │   ├── CartContext.jsx    # Shopping cart state management
│       │   └── AuthContext.jsx    # Authentication state management
│       └── components/
│           ├── Navbar.jsx         # Navigation with cart badge and auth
│           ├── Shop.jsx           # Product listing page
│           ├── Cart.jsx           # Shopping cart page
│           ├── Checkout.jsx       # Checkout with Mesh integration
│           ├── Confirmation.jsx   # Order confirmation with portfolio display
│           ├── Account.jsx        # Account/wallet management page
│           ├── Profile.jsx        # User profile component
│           ├── Auth.jsx           # Login/signup component
│           ├── Transactions.jsx   # Transaction history component
│           └── MeshWidget.jsx     # Mesh Connect widget
├── README.md
├── API_DOCUMENTATION.md   # Complete API reference
└── MESH_CSP_FIX.md        # CSP troubleshooting guide
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MeshHomeTask
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up backend environment variables:
```bash
cp .env.example .env
# Edit .env and add your Mesh Connect credentials:
# MESH_CLIENT_ID=your_client_id_here
# MESH_CLIENT_SECRET=your_client_secret_here
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

5. Set up frontend environment variables:
```bash
cp .env.example .env
# Edit .env and add your Mesh Connect Client ID:
# VITE_MESH_CLIENT_ID=your_client_id_here
```

### Running the Application

1. Start the backend server (from the `backend` directory):
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

2. In a new terminal, start the frontend development server (from the `frontend` directory):
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Health
- `GET /api/health` - Health check endpoint

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders

### Portfolio
- `GET /api/v1/holdings/portfolio/:userId` - Get user's cryptocurrency portfolio with performance metrics

### Wallet Management
- `GET /api/wallet-addresses/:userId` - Get user's wallet addresses
- `POST /api/wallet-addresses` - Add a new wallet address
- `DELETE /api/wallet-addresses/:userId/:addressId` - Delete a wallet address

### Mesh Connect
- `POST /api/mesh/payment-link` - Generate link token for Mesh SDK
- `POST /api/v1/holdings/portfolio` - Get account portfolio
- `GET /api/mesh/holdings/:accountId` - Get account holdings
- `GET /api/mesh/transactions/:accountId` - Get account transactions

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Usage

1. **Authentication** (Optional):
   - Click "Login" in the navbar to create an account or sign in
   - Authenticated users can manage wallets and view portfolio

2. **Browse Products**: View the 10 available products on the shop page

3. **Add to Cart**: Select quantity and click "Add to Cart"

4. **View Cart**: Click the cart icon in the navbar (shows item count badge)

5. **Checkout**: Proceed to checkout from the cart page

6. **Payment**:
   - Option 1: Pay with Mesh Connect (cryptocurrency)
   - Option 2: Manual order (for testing without payment)

7. **Mesh Payment Flow**:
   - Paste link token from Postman (or use backend API to generate)
   - Click "Connect Wallet & Pay"
   - Complete payment in Mesh Connect modal
   - Order is automatically created upon successful payment
   - Redirected to confirmation page with portfolio display

8. **Wallet Management** (Authenticated users):
   - Navigate to "Account" page from navbar
   - Add wallet addresses manually
   - View connected wallets
   - Remove wallets as needed

9. **Portfolio Tracking**:
   - View real-time portfolio on confirmation page after purchase
   - See total portfolio value, cost basis, and performance percentage
   - View individual cryptocurrency positions with:
     - Amount held
     - Market value
     - Cost basis
     - Portfolio percentage
     - Total return and return percentage

## Products Available

1. Classic Running Shoes - $50.00
2. Leather Sneakers - $129.99
3. Athletic Training Shoes - $109.99
4. Cotton T-Shirt - $24.99
5. Denim Jeans - $79.99
6. Hooded Sweatshirt - $59.99
7. Sports Jacket - $149.99
8. Casual Loafers - $94.99
9. Chino Pants - $69.99
10. High-Top Sneakers - $119.99

## Mesh Connect Integration

This application integrates with [Mesh Connect](https://meshconnect.com/) for cryptocurrency payment processing and portfolio management.

### Features

- Link token generation via backend API
- Wallet/exchange connection modal
- Transfer execution and status tracking
- Account holdings and transaction retrieval
- Real-time portfolio aggregation with performance metrics
- Mesh token storage and management
- Multi-wallet support
- Comprehensive API client for all Mesh endpoints

### Setup

1. Sign up at https://dashboard.meshconnect.com/
2. Get your Client ID and Client Secret
3. Add credentials to `.env` files (backend and frontend)
4. **Important**: Whitelist your domain in Mesh dashboard to avoid CSP errors
   - See [MESH_CSP_FIX.md](./MESH_CSP_FIX.md) for troubleshooting

### Testing Without Mesh

You can test the application without Mesh credentials:
- Use the "Manual Order" option at checkout
- This creates orders without payment processing

## Future Enhancements

- Migrate to SQLite/PostgreSQL for persistent storage
- Add product categories and filtering
- Add product search functionality
- Implement admin panel for product and order management
- Enhance user authentication with password hashing (bcrypt) and JWT
- Implement email notifications for orders and transactions
- Add inventory management and stock tracking
- Add transaction history page for all user purchases
- Implement portfolio charts and historical performance tracking
- Add multi-currency support
- Implement real-time price updates via WebSocket
- Add push notifications for price alerts
- Deploy to production (Vercel/Railway/etc.)

## Development Notes

- The application uses in-memory storage, so all data is lost when the server restarts
- In-memory stores include: users, auth tokens, wallet addresses, Mesh tokens, orders, and transactions
- For production, consider implementing a proper database (PostgreSQL, MongoDB, etc.)
- CORS is enabled for all origins in development - restrict in production
- Mesh Connect requires domain whitelisting - see MESH_CSP_FIX.md
- Cart data and authentication persists in localStorage (survives page refresh)
- User authentication is simple (no password hashing) - implement proper auth for production
- Portfolio data structure includes:
  - `portfolioCostBasis`: Total initial investment
  - `actualPortfolioPerformance`: Overall portfolio performance percentage
  - `cryptocurrenciesValue`: Total value of all crypto holdings
  - `cryptocurrencyPositions`: Array of individual positions with metrics
    - `symbol`, `name`, `amount`, `marketValue`, `costBasis`, `portfolioPercentage`
    - `totalReturn`, `returnPercentage`, `lastPrice`

## License

MIT

## Author

Demo Shop Application
