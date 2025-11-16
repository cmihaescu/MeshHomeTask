# Demo Shop - Shoes & Clothing

A full-stack e-commerce demo application built with React and Node.js, featuring authentication, product browsing, and purchase functionality.

## Features

- User authentication (register, login, logout, JWT tokens with refresh)
- Browse 10 products (shoes and clothing)
- Purchase products with quantity selection
- View transaction history
- User profile management
- In-memory data storage

## Tech Stack

### Backend
- Node.js
- Express.js
- JWT for authentication
- bcryptjs for password hashing
- In-memory store for data persistence

### Frontend
- React 18
- React Router for navigation
- Context API for state management
- Vite for fast development

## Project Structure

```
MeshHomeTask/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server with all API routes
│   └── store.js           # In-memory data store
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── contexts/
│       │   └── AuthContext.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── Auth.jsx
│           ├── Shop.jsx
│           ├── Transactions.jsx
│           └── Profile.jsx
└── README.md
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

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
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

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Transactions
- `POST /api/purchase` - Purchase a product (protected)
- `GET /api/transactions` - Get user transactions (protected)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Products**: View the 10 available products on the shop page
3. **Purchase**: Select quantity and click "Buy Now" (requires login)
4. **View Orders**: Check your purchase history in "My Orders"
5. **Profile**: View your user information

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

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Access tokens (15min expiry)
- Refresh tokens (7 days expiry)
- Protected API routes

## Future Enhancements

- Migrate to SQLite/PostgreSQL for persistent storage
- Add product categories and filtering
- Implement shopping cart
- Add payment integration
- Deploy to Vercel/Netlify (frontend) and Heroku/Vercel Functions (backend)
- Add product search functionality
- Implement admin panel for product management

## Development Notes

- The application uses in-memory storage, so all data is lost when the server restarts
- For production, consider implementing a proper database
- Update JWT secrets in environment variables before deployment
- CORS is enabled for all origins in development - restrict in production

## License

MIT

## Author

Demo Shop Application
