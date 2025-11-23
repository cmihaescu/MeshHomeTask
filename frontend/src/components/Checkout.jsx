import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MeshSDK from './MeshSDK';
import MeshSDKPostmanLink from './MeshSDKPostmanLink.jsx';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('crypto'); // 'crypto' or 'manual-link'
  const [orderComplete, setOrderComplete] = useState(false);
  const [userId, setUserId] = useState(() => {
    // Generate or retrieve a user ID
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      console.log("user Id set from checkout page")
      localStorage.setItem('userId', id);
    }
    return id;
  });


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

          {paymentMethod === 'crypto' && <MeshSDK userId={userId} orderComplete={orderComplete}  transferType={"payment"}/>}

          {paymentMethod === 'manual-link' && <MeshSDKPostmanLink orderComplete={orderComplete} />       }
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
