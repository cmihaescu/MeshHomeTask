import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import NetworkTokenSelector from './NetworkTokenSelector';
import { useNetworkAddress } from '../hooks/useNetworkAddress';
import { Button, ButtonLink } from './ui/Button';
import { Field } from './ui/Field';
import { Receipt } from './ui/Receipt';

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
        <div className="page-head">
          <h1>Your cart</h1>
        </div>
        <div className="empty-state">
          <p>Nothing in the basket yet.</p>
          <ButtonLink to="/">Browse the shop</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-head">
        <h1>Your cart</h1>
        <Button variant="ghost" onClick={clearCart}>
          Clear cart
        </Button>
      </div>

      <ul className="cart-list">
        {cartItems.map((item) => (
          <li key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item__img" />
            <div className="cart-item__body">
              <div className="cart-item__top">
                <div>
                  <p className="eyebrow">{item.category}</p>
                  <h3 className="cart-item__name">{item.name}</h3>
                  <p className="cart-item__desc">{item.description}</p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  ×
                </button>
              </div>
              <div className="cart-item__bottom">
                <div className="cart-item__qty">
                  <label className="field__label" htmlFor={`cart-qty-${item.id}`}>
                    Qty
                  </label>
                  <input
                    id={`cart-qty-${item.id}`}
                    name={`cart-qty-${item.id}`}
                    autoComplete="off"
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <div className="cart-item__unit">${item.price.toFixed(2)} each</div>
                  <div className="cart-item__line-total">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Transfer network + token selection (populated from the cached Mesh networks list) */}
      <section className="panel" aria-label="Payment network and token">
        <h2 className="panel__title">Payment network &amp; token</h2>
        <p className="panel__sub">
          Choose the network and crypto token you&rsquo;ll use to pay at checkout.
        </p>
        <NetworkTokenSelector value={transferSelection} onChange={handleSelectionChange} />

        {/* Shown only when the selected network/token has no merchant address
            configured on the backend — the shopper must supply a destination
            address that's valid for the chosen chain. */}
        {needsAddress ? (
          <div style={{ marginTop: '1rem' }}>
            <Field
              label="Destination address"
              hint="No receiving address is configured for this network, so the payment will be sent to the address you enter here. Make sure it's valid for the selected network."
            >
              <input
                type="text"
                name="destination-address"
                autoComplete="off"
                spellCheck={false}
                className="input--mono"
                value={transferSelection.address || ''}
                onChange={handleAddressChange}
                placeholder="e.g. 0x6A36…3266"
              />
            </Field>
          </div>
        ) : null}
      </section>

      <Receipt title="Cart summary">
        {cartItems.map((item) => (
          <Receipt.Row
            key={item.id}
            label={`${item.name} × ${item.quantity}`}
            value={`$${(item.price * item.quantity).toFixed(2)}`}
          />
        ))}
        <Receipt.Divider />
        <Receipt.Total value={`$${getCartTotal().toFixed(2)}`} />
        <Receipt.Note>
          {cartItems.length} {cartItems.length === 1 ? 'line item' : 'line items'} · settled in crypto via Mesh
        </Receipt.Note>
      </Receipt>

      <div className="confirm-actions" style={{ justifyContent: 'flex-end' }}>
        <ButtonLink to="/" variant="secondary">
          Continue shopping
        </ButtonLink>
        <Button onClick={handleCheckout}>Proceed to checkout</Button>
      </div>
    </div>
  );
};

export default Cart;
