import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { MeshGlyph } from './brand/MeshLogo';
import DemoConsole from './DemoConsole';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const cartCount = getCartItemsCount();

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <MeshGlyph size={30} />
          <span>
            <span className="brand__name">Demo Shop</span>
            <span className="brand__tag">crypto checkout by Mesh</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <DemoConsole />
          <NavLink to="/" className="site-nav__link" end>
            Shop
          </NavLink>
          <NavLink to="/account" className="site-nav__link">
            Account
          </NavLink>
          <NavLink
            to="/cart"
            className="site-nav__link"
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            Cart
            {cartCount > 0 ? (
              <span className="cart-count" aria-hidden="true">
                {cartCount}
              </span>
            ) : null}
          </NavLink>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
