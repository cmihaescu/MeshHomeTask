import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import TransferSelectionRow from './TransferSelectionRow';

const EMPTY_SELECTION = { networkId: '', symbol: '', address: '' };

// Load the persisted combo list; migrate the legacy single-selection key
// (meshTransferSelection) into a one-entry list the first time.
const loadSelections = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('meshTransferSelections'));
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch {
    // fall through to the legacy key
  }
  try {
    const legacy = JSON.parse(localStorage.getItem('meshTransferSelection'));
    if (legacy && legacy.networkId) return [legacy];
  } catch {
    // fall through to the empty default
  }
  return [{ ...EMPTY_SELECTION }];
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  // Network + token + (optional) destination address combos, persisted so
  // other flows (e.g. checkout / the Mesh widget) can read them. The whole
  // section is optional — combos the shopper provides become the link token's
  // transferOptions.toAddresses; none provided means the backend default.
  const [transferSelections, setTransferSelections] = useState(loadSelections);

  const persistSelections = (selections) => {
    setTransferSelections(selections);
    localStorage.setItem('meshTransferSelections', JSON.stringify(selections));
    // The single-selection key is superseded by the list; drop it so a stale
    // value can't resurface after the migration in loadSelections.
    localStorage.removeItem('meshTransferSelection');
  };

  const handleSelectionChange = (index, selection) => {
    persistSelections(
      transferSelections.map((s, i) => (i === index ? selection : s))
    );
  };

  const handleAddSelection = () => {
    persistSelections([...transferSelections, { ...EMPTY_SELECTION }]);
  };

  const handleRemoveSelection = (index) => {
    persistSelections(transferSelections.filter((_, i) => i !== index));
  };

  const additionalSelections = transferSelections.slice(1);

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
        <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '16px' }}>
          Payment network &amp; token <span style={{ fontWeight: 'normal', color: '#666' }}>(optional)</span>
        </h3>
        <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '15px' }}>
          Optionally choose the network(s) and crypto token(s) you'll use to pay at checkout.
          If you skip this, a default is used.
        </p>
        <TransferSelectionRow
          value={transferSelections[0]}
          onChange={(selection) => handleSelectionChange(0, selection)}
        />

        <button
          onClick={handleAddSelection}
          className="btn btn-secondary"
          style={{ marginTop: '15px' }}
        >
          + Add another network &amp; token
        </button>
      </div>

      {/* Every combo added beyond the first shows up here, below the payment
          network & token section, each removable on its own. */}
      {additionalSelections.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '16px' }}>
            Additional networks &amp; tokens
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '15px' }}>
            These are offered alongside the selection above as ways to pay at checkout.
          </p>
          <div style={{ display: 'grid', gap: '20px' }}>
            {additionalSelections.map((selection, i) => (
              <div
                key={i + 1}
                style={{ borderTop: i > 0 ? '1px solid #eee' : 'none', paddingTop: i > 0 ? '20px' : 0 }}
              >
                <TransferSelectionRow
                  value={selection}
                  onChange={(next) => handleSelectionChange(i + 1, next)}
                  onRemove={() => handleRemoveSelection(i + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
