import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Demo Shop</h1>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">Shop</Link>
            <Link to="/transactions">My Orders</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth">Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
