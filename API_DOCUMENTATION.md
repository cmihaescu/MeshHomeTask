# API Documentation

## Overview

This document describes the REST API endpoints for the Demo Shop application with Mesh Connect integration.

## Base URL

```
http://localhost:5000/api
```

---

## Products

### Get All Products

Returns a list of all available products.

**Endpoint:** `GET /products`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Classic Running Shoes",
    "category": "shoes",
    "price": 50.00,
    "description": "Comfortable running shoes...",
    "image": "https://...",
    "stock": 25
  }
]
```

### Get Single Product

Returns details of a specific product.

**Endpoint:** `GET /products/:id`

**Parameters:**
- `id` (number) - Product ID

**Response:**
```json
{
  "id": 1,
  "name": "Classic Running Shoes",
  "category": "shoes",
  "price": 89.99,
  "description": "Comfortable running shoes...",
  "image": "https://...",
  "stock": 25
}
```

---

## Orders

### Create Order

Creates a new order with the provided items.

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Classic Running Shoes",
      "price": 89.99,
      "quantity": 2
    }
  ],
  "total": 179.98,
  "paymentMethod": "mesh",
  "meshPayload": {
    "auth_token": "...",
    "integrationId": "...",
    "userId": "..."
  }
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": "uuid-here",
  "order": {
    "orderId": "uuid-here",
    "items": [...],
    "total": 179.98,
    "paymentMethod": "mesh",
    "status": "completed",
    "createdAt": "2025-11-16T..."
  }
}
```

**Notes:**
- Stock is automatically updated when an order is created
- Order validation checks stock availability before creation
- `meshPayload` is optional (for Mesh payment integration)

### Get All Orders

Returns all orders.

**Endpoint:** `GET /orders`

**Response:**
```json
[
  {
    "orderId": "uuid-here",
    "items": [...],
    "total": 179.98,
    "paymentMethod": "mesh",
    "status": "completed",
    "createdAt": "2025-11-16T..."
  }
]
```

---

## Mesh Connect Integration

### Generate Link Token

Generates a link token for initializing the Mesh Connect SDK.

**Endpoint:** `POST /mesh/link-token`

**Request Body:**
```json
{
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "linkToken": "link-token-here",
  "content": {
    "connectUrl": "https://...",
    "transferDestinationTokens": [...]
  }
}
```

**Usage:**
```javascript
const response = await fetch('/api/mesh/link-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user123' })
});
const { linkToken } = await response.json();
meshLink.openLink(linkToken);
```

### Get Account Holdings

Retrieves holdings/balances for a connected account.

**Endpoint:** `GET /mesh/holdings/:accountId`

**Parameters:**
- `accountId` (string) - Account ID from Mesh Connect

**Response:**
```json
{
  "holdings": [
    {
      "symbol": "BTC",
      "amount": "0.5",
      "value": 25000
    }
  ]
}
```

### Get Account Transactions

Retrieves transaction history for a connected account.

**Endpoint:** `GET /mesh/transactions/:accountId`

**Parameters:**
- `accountId` (string) - Account ID from Mesh Connect

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx-id",
      "type": "deposit",
      "amount": "0.1",
      "symbol": "BTC",
      "date": "2025-11-16T..."
    }
  ]
}
```

### Get Auth Token

Retrieves authentication token for a connected account.

**Endpoint:** `GET /mesh/auth/:accountId`

**Parameters:**
- `accountId` (string) - Account ID from Mesh Connect

**Response:**
```json
{
  "authToken": "token-here",
  "refreshToken": "refresh-token-here",
  "expiresAt": "2025-11-16T..."
}
```

### Execute Transfer

Executes a cryptocurrency transfer.

**Endpoint:** `POST /mesh/transfer`

**Request Body:**
```json
{
  "fromAccountId": "account-id",
  "toAddress": "wallet-address",
  "amount": "0.1",
  "symbol": "BTC"
}
```

**Response:**
```json
{
  "transferId": "transfer-id",
  "status": "pending",
  "fromAccountId": "account-id",
  "toAddress": "wallet-address",
  "amount": "0.1",
  "symbol": "BTC"
}
```

### Get Transfer Status

Checks the status of a transfer.

**Endpoint:** `GET /mesh/transfer/:transferId`

**Parameters:**
- `transferId` (string) - Transfer ID

**Response:**
```json
{
  "transferId": "transfer-id",
  "status": "completed",
  "amount": "0.1",
  "symbol": "BTC",
  "completedAt": "2025-11-16T..."
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=5000

# Mesh Connect API Configuration
MESH_CLIENT_ID=your_mesh_client_id_here
MESH_CLIENT_SECRET=your_mesh_client_secret_here
MESH_API_URL=https://integration-api.meshconnect.com
```

### Frontend (.env)

```bash
# Mesh Connect Configuration
VITE_MESH_CLIENT_ID=your_mesh_client_id_here
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here",
  "details": "Additional details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Mesh Connect Resources

- **Dashboard:** https://dashboard.meshconnect.com/
- **API Documentation:** https://docs.meshconnect.com/api-reference/
- **Web Link SDK:** https://docs.meshconnect.com/integrate/web-link

---

## Example: Complete Checkout Flow

### 1. User adds items to cart (frontend)

```javascript
addToCart(product, quantity);
```

### 2. User proceeds to checkout

Navigate to `/checkout`

### 3. Generate link token (optional - for dynamic token generation)

```javascript
const response = await fetch('/api/mesh/link-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user123' })
});
const { linkToken } = await response.json();
```

### 4. Open Mesh Connect widget

```javascript
meshLink.openLink(linkToken);
```

### 5. User completes payment

The `onIntegrationConnected` callback fires with payload

### 6. Create order

```javascript
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    total: getCartTotal(),
    paymentMethod: 'mesh',
    meshPayload: payload
  })
});
const { orderId } = await orderResponse.json();
```

### 7. Clear cart and redirect

```javascript
clearCart();
navigate('/');
```

---

## Notes

- No authentication is currently required for any endpoints
- Orders are stored in-memory and will be lost on server restart
- Stock levels are automatically updated when orders are created
- The Mesh Connect integration requires valid API credentials
