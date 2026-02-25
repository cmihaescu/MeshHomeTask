import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <nav className="nav">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Demo Shop</h1>
      </Link>
      <div className="nav-links">
        <Link to="/">Shop</Link>
        <Link to="/account">Account</Link>
        <Link to="/json-viewer">JSON Viewer</Link>
        <Link to="/cart" style={{ position: 'relative' }}>
          Cart
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
