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
  const [paymentMethod, setPaymentMethod] = useState('mesh'); // 'mesh' or 'manual'
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
      return;
    }

    // Initialize Mesh Link SDK
    const link = createLink({
      clientId: import.meta.env.VITE_MESH_CLIENT_ID,
      onIntegrationConnected: (payload) => {
        console.log("Connected!", payload);
        // TODO: Send payload to backend to verify and create order
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

      // Clear cart and show success
      setOrderComplete(true);
      setIsLoading(false);
      clearCart();

      alert('Order completed successfully! Order ID: ' + order.orderId);

      // Redirect to shop after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Failed to complete order. Please try again.');
      setIsLoading(false);
    }
  };

  const handleMeshPayment = async () => {
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

  const handleManualOrder = async () => {
    // For testing purposes - create order without payment
    try {
      setIsLoading(true);
      const orderData = {
        items: cartItems,
        total: getCartTotal(),
        paymentMethod: 'manual',
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

      // Clear cart and show success
      setOrderComplete(true);
      setIsLoading(false);
      clearCart();

      alert('Order placed successfully! Order ID: ' + order.orderId);

      // Redirect to shop after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Failed to complete order. Please try again.');
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
                value="mesh"
                checked={paymentMethod === 'mesh'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Pay with Mesh Connect (Crypto)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="manual"
                checked={paymentMethod === 'manual'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Manual Order (Testing)</span>
            </label>
          </div>

          {paymentMethod === 'mesh' && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
              <h4 style={{ marginTop: 0 }}>Mesh Connect Payment</h4>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Link Token (from Postman):
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
                onClick={handleMeshPayment}
                disabled={isLoading || !linkToken.trim()}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Processing...' : 'Connect Wallet & Pay'}
              </button>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                You'll be redirected to Mesh Connect to complete your payment securely.
              </p>
            </div>
          )}

          {paymentMethod === 'manual' && (
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
              <h4 style={{ marginTop: 0 }}>Manual Order (Testing Only)</h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                This will create an order without payment processing. Use this for testing purposes only.
              </p>
              <button
                onClick={handleManualOrder}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Processing...' : 'Place Order'}
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
