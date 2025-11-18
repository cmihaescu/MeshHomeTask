# Demo Shop - Shoes & Clothing

A full-stack e-commerce demo application built with React and Node.js, featuring shopping cart, checkout, and Mesh Connect cryptocurrency payment integration.

## Features

- Browse 10 products (shoes and clothing)
- Shopping cart with quantity management
- Checkout with Mesh Connect crypto payment integration
- Order management and tracking
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
- Context API for cart state management
- Mesh Connect Web Link SDK (@meshconnect/web-link-sdk)
- Vite for fast development

## Project Structure

```
MeshHomeTask/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server with all API routes
│   ├── store.js           # In-memory data store
│   ├── meshClient.js      # Mesh Connect API client
│   ├── .env.example       # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example       # Frontend environment variables
│   ├── .gitignore
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── contexts/
│       │   └── CartContext.jsx    # Shopping cart state
│       └── components/
│           ├── Navbar.jsx         # Navigation with cart badge
│           ├── Shop.jsx           # Product listing
│           ├── Cart.jsx           # Shopping cart
│           ├── Checkout.jsx       # Checkout with Mesh integration
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

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders

### Mesh Connect
- `POST /api/mesh/payment-link` - Generate link token for Mesh SDK
- `GET /api/mesh/holdings/:accountId` - Get account holdings
- `GET /api/mesh/transactions/:accountId` - Get account transactions
- `GET /api/mesh/auth/:accountId` - Get auth token
- `POST /api/mesh/transfer` - Execute a transfer
- `GET /api/mesh/transfer/:transferId` - Get transfer status

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Usage

1. **Browse Products**: View the 10 available products on the shop page
2. **Add to Cart**: Select quantity and click "Add to Cart"
3. **View Cart**: Click the cart icon in the navbar (shows item count badge)
4. **Checkout**: Proceed to checkout from the cart page
5. **Payment**:
   - Option 1: Pay with Mesh Connect (cryptocurrency)
   - Option 2: Manual order (for testing without payment)
6. **Mesh Payment Flow**:
   - Paste link token from Postman (or use backend API to generate)
   - Click "Connect Wallet & Pay"
   - Complete payment in Mesh Connect modal
   - Order is automatically created upon successful payment

## Products Available

1. Classic Running Shoes - $89.99
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

This application integrates with [Mesh Connect](https://meshconnect.com/) for cryptocurrency payment processing.

### Features

- Link token generation via backend API
- Wallet/exchange connection modal
- Transfer execution and status tracking
- Account holdings and transaction retrieval
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
- Implement admin panel for product management
- Add user authentication for order tracking
- Implement email notifications for orders
- Add inventory management
- Deploy to production (Vercel/Railway/etc.)

## Development Notes

- The application uses in-memory storage, so all data is lost when the server restarts
- For production, consider implementing a proper database
- CORS is enabled for all origins in development - restrict in production
- Mesh Connect requires domain whitelisting - see MESH_CSP_FIX.md
- Cart data persists in localStorage (survives page refresh)

## License

MIT

## Author

Demo Shop Application
