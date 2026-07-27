import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import MeshSDK from './MeshSDK';
import MeshSDKPostmanLink from './MeshSDKPostmanLink.jsx';
import { ButtonLink } from './ui/Button';
import { Receipt } from './ui/Receipt';

const PAYMENT_METHODS = [
  { id: 'crypto', label: 'Pay with Mesh Connect (crypto)' },
  { id: 'manual-link', label: 'Pay with a manual link token' },
];

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  const [userId] = useState(() => {
    // Generate or retrieve a user ID
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      console.log('user Id set from checkout page');
      localStorage.setItem('userId', id);
    }
    return id;
  });

  return (
    <div className="container">
      <div className="page-head">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-grid">
        <div>
          <Receipt title="Order summary">
            {cartItems.map((item) => (
              <Receipt.Row
                key={item.id}
                label={item.name}
                detail={`${item.quantity} × $${item.price.toFixed(2)}`}
                value={`$${(item.price * item.quantity).toFixed(2)}`}
              />
            ))}
            <Receipt.Divider />
            <Receipt.Total value={`$${getCartTotal().toFixed(2)}`} />
            <Receipt.Note>awaiting settlement · Mesh Connect</Receipt.Note>
          </Receipt>
        </div>

        <section aria-label="Payment method">
          <fieldset style={{ border: 'none' }}>
            <legend className="eyebrow" style={{ marginBottom: '0.7rem' }}>
              Payment method
            </legend>
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={
                  paymentMethod === method.id ? 'radio-row radio-row--active' : 'radio-row'
                }
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{method.label}</span>
              </label>
            ))}
          </fieldset>

          {paymentMethod === 'crypto' ? (
            <MeshSDK userId={userId} transferType={'payment'} />
          ) : (
            <MeshSDKPostmanLink />
          )}
        </section>
      </div>

      <div className="confirm-actions">
        <ButtonLink to="/cart" variant="secondary">
          Back to cart
        </ButtonLink>
      </div>
    </div>
  );
};

export default Checkout;
