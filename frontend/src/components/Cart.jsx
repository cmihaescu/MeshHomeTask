import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import NetworkTokenSelector from './NetworkTokenSelector';
import { useNetworkAddress } from '../hooks/useNetworkAddress';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  // Network + token + (optional) destination address, persisted so other flows
  // (e.g. checkout / the Mesh widget) can read it.
  const [transferSelection, setTransferSelection] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('meshTransferSelection')) || { networkId: '', symbol: '', address: '' };
    } catch {
      return { networkId: '', symbol: '', address: '' };
    }
  });

  // Whether the backend already has a receiving address for this network/token.
  const { configured, loading: addressLoading } = useNetworkAddress(
    transferSelection.networkId,
    transferSelection.symbol
  );
  // Prompt for an address only once we know none is configured for the selection.
  const needsAddress = !!transferSelection.networkId && !addressLoading && !configured;

  const persistSelection = (selection) => {
    setTransferSelection(selection);
    localStorage.setItem('meshTransferSelection', JSON.stringify(selection));
  };

  // Network/token changed — clear any previously entered address so it can't
  // leak across networks (a stale address would be invalid on the new chain).
  const handleSelectionChange = ({ networkId, symbol }) => {
    persistSelection({ networkId, symbol, address: '' });
  };

  const handleAddressChange = (e) => {
    persistSelection({ ...transferSelection, address: e.target.value });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <h2>Shopping Cart</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            Your cart is empty
          </p>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Shopping Cart</h2>
        <button onClick={clearCart} className="btn btn-secondary">
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              gap: '20px',
              backgroundColor: '#fff',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                    {item.category}
                  </div>
                  <h3 style={{ margin: '5px 0', fontSize: '18px' }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '20px',
                    height: '30px',
                  }}
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="quantity-input"
                    style={{ width: '80px' }}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    ${item.price.toFixed(2)} each
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer network + token selection (populated from the cached Mesh networks list) */}
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '16px' }}>Payment network &amp; token</h3>
        <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '15px' }}>
          Choose the network and crypto token you'll use to pay at checkout.
        </p>
        <NetworkTokenSelector value={transferSelection} onChange={handleSelectionChange} />

        {/* Shown only when the selected network/token has no merchant address
            configured on the backend — the shopper must supply a destination
            address that's valid for the chosen chain. */}
        {needsAddress && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
              Destination address
            </label>
            <input
              type="text"
              value={transferSelection.address || ''}
              onChange={handleAddressChange}
              placeholder="Enter the receiving address for this network"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '12px', color: '#856404', marginTop: '6px', marginBottom: 0 }}>
              No receiving address is configured for this network, so the payment will be sent to the
              address you enter here. Make sure it's valid for the selected network.
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Total: ${getCartTotal().toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              {cartItems.length} item(s) in cart
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/" className="btn btn-secondary">
              Continue Shopping
            </Link>
            <button onClick={handleCheckout} className="btn btn-primary">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
