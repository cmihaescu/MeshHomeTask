import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import TransferSelectionRow from './TransferSelectionRow';
import { Button, ButtonLink } from './ui/Button';
import { Receipt } from './ui/Receipt';

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
        <h2 className="panel__title">
          Payment network &amp; token <span style={{ fontWeight: 'normal', opacity: 0.7 }}>(optional)</span>
        </h2>
        <p className="panel__sub">
          Optionally choose the network(s) and crypto token(s) you&rsquo;ll use to pay at checkout.
          If you skip this, a default is used.
        </p>
        <TransferSelectionRow
          value={transferSelections[0]}
          onChange={(selection) => handleSelectionChange(0, selection)}
        />

        <div style={{ marginTop: '1rem' }}>
          <Button variant="secondary" onClick={handleAddSelection}>
            + Add another network &amp; token
          </Button>
        </div>
      </section>

      {/* Every combo added beyond the first shows up here, below the payment
          network & token section, each removable on its own. */}
      {additionalSelections.length > 0 ? (
        <section className="panel" aria-label="Additional networks and tokens">
          <h2 className="panel__title">Additional networks &amp; tokens</h2>
          <p className="panel__sub">
            These are offered alongside the selection above as ways to pay at checkout.
          </p>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {additionalSelections.map((selection, i) => (
              <TransferSelectionRow
                key={i + 1}
                value={selection}
                onChange={(next) => handleSelectionChange(i + 1, next)}
                onRemove={() => handleRemoveSelection(i + 1)}
              />
            ))}
          </div>
        </section>
      ) : null}

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
