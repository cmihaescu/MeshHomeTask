import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLink } from "@meshconnect/web-link-sdk";
import { useCart } from '../contexts/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [meshLink, setMeshLink] = useState(null);
  const [linkToken, setLinkToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('crypto'); // 'crypto' or 'manual-link'
  const [orderComplete, setOrderComplete] = useState(false);
  const [userId, setUserId] = useState(() => {
    // Generate or retrieve a user ID
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('userId', id);
    }
    return id;
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
      return;
    }

    console.log("import.meta.env.VITE_MESH_CLIENT_ID", import.meta.env.VITE_MESH_CLIENT_ID)
    // Initialize Mesh Link SDK
    const link = createLink({
      clientId: import.meta.env.VITE_MESH_CLIENT_ID,
      onIntegrationConnected: (payload) => {
        console.log("Connected!", payload);

        // Store Mesh tokens if present
        if (payload.accessToken && payload.refreshToken) {
          storeMeshTokens(payload.accessToken, payload.refreshToken);
        }

        handleOrderCompletion(payload);
      },
      onExit: (error) => {
        if (error) {
          console.error("User closed or error:", error);
          setError(error.message || 'Payment connection failed');
        } else {
          console.log("User closed the widget");
        }
        setIsLoading(false);
      },
      onTransferFinished: (payload) => {
        console.log("Transfer result:", payload);
        handleOrderCompletion(payload);
      }
    });

    setMeshLink(link);
  }, [cartItems, navigate, orderComplete]);

  const storeMeshTokens = async (accessToken, refreshToken) => {
    try {
      // Store in localStorage
      localStorage.setItem('meshAccessToken', accessToken);
      localStorage.setItem('meshRefreshToken', refreshToken);

      // Send to backend to store with userId
      await fetch('/api/mesh/store-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accessToken,
          refreshToken,
        }),
      });

      console.log('Mesh tokens stored successfully');
    } catch (error) {
      console.error('Error storing Mesh tokens:', error);
    }
  };

  const handleOrderCompletion = async (meshPayload) => {
    try {
      // Create order in backend
      const orderData = {
        items: cartItems,
        total: getCartTotal(),
        paymentMethod: 'mesh',
        meshPayload: meshPayload,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      console.log('Order created:', order);

      // Clear cart and redirect to confirmation page
      setOrderComplete(true);
      setIsLoading(false);
      clearCart();

      // Redirect to confirmation page immediately
      navigate(`/confirmation?orderId=${order.orderId}`);
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Failed to complete order. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!meshLink) {
      setError('Mesh Link SDK not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Fetch saved wallet addresses
      const addressesResponse = await fetch(`/api/wallet-addresses/${userId}`);
      let walletAddresses = [];
      if (addressesResponse.ok) {
        walletAddresses = await addressesResponse.json();
      }

      // Create payment link token
      const response = await fetch('/api/mesh/payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: getCartTotal(),
          toAddresses: walletAddresses.length > 0 ? walletAddresses : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create payment link');
      }

      const data = await response.json();

      if (!data.linkToken) {
        throw new Error('No link token received from server');
      }

      // Open Mesh widget with the link token
      meshLink.openLink(data.linkToken);
    } catch (err) {
      console.error('Error initiating crypto payment:', err);
      setError(err.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  const handleManualLinkPayment = async () => {
    if (!linkToken.trim()) {
      setError('Please enter a link token');
      return;
    }

    if (!meshLink) {
      setError('Mesh Link SDK not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      meshLink.openLink(linkToken.trim());
    } catch (err) {
      console.error('Error opening link:', err);
      setError(err.message || 'Failed to open Mesh widget');
      setIsLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Order Completed!</h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Thank you for your purchase. Redirecting to shop...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        {/* Order Summary */}
        <div>
          <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '20px 0 0 0',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              <div>Total:</div>
              <div style={{ color: '#28a745' }}>${getCartTotal().toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 style={{ marginBottom: '20px' }}>Payment Method</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="crypto"
                checked={paymentMethod === 'crypto'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Pay with Mesh Connect (Crypto)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="manual-link"
                checked={paymentMethod === 'manual-link'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Pay with Manual Link Token</span>
            </label>
          </div>

          {paymentMethod === 'crypto' && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
              <h4 style={{ marginTop: 0 }}>Crypto Payment via Mesh Connect</h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Click the button below to generate a payment link and connect your crypto wallet.
                {userId && (
                  <>
                    <br />
                    <span style={{ fontSize: '12px', marginTop: '5px', display: 'block' }}>
                      You can manage your wallet addresses in the{' '}
                      <a href="/account" style={{ color: '#007bff', textDecoration: 'underline' }}>
                        Account page
                      </a>.
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={handleCryptoPayment}
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Generating Payment Link...' : 'Generate Payment Link & Pay'}
              </button>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                You'll be redirected to Mesh Connect to complete your payment securely.
              </p>
            </div>
          )}

          {paymentMethod === 'manual-link' && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
              <h4 style={{ marginTop: 0 }}>Pay with Link Token</h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Paste a link token generated from Postman or another source.
              </p>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Link Token:
                </label>
                <input
                  type="text"
                  value={linkToken}
                  onChange={(e) => setLinkToken(e.target.value)}
                  placeholder="Paste your link token here"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <button
                onClick={handleManualLinkPayment}
                disabled={isLoading || !linkToken.trim()}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Processing...' : 'Connect Wallet & Pay'}
              </button>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary">
          Back to Cart
        </button>
      </div>
    </div>
  );
};

export default Checkout;
