import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useMeshEnv, MESH_ENVS } from '../contexts/MeshEnvContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();
  const { meshEnv, setMeshEnv, iframeMode, setIframeMode } = useMeshEnv();
  const isProd = meshEnv === 'production';

  return (
    <nav className="nav">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>Demo Shop</h1>
      </Link>
      <div className="nav-links">
        {/* Mesh environment toggle — set before heading to cart/checkout */}
        <div
          title="Mesh Connect environment used for payments and deposits"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}
        >
          <span style={{ fontSize: '12px', color: '#666' }}>Mesh env:</span>
          <select
            value={meshEnv}
            onChange={(e) => setMeshEnv(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              color: isProd ? '#b02a37' : '#0a7d28',
              backgroundColor: isProd ? '#fdecee' : '#e9f7ef',
            }}
          >
            {MESH_ENVS.map((env) => (
              <option key={env} value={env}>
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Mount the Mesh Link UI inside an embedded iframe instead of the popup */}
        <label
          title="Mount the Mesh Link UI inside an embedded iframe instead of the default popup"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={iframeMode}
            onChange={(e) => setIframeMode(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>iFrame mode</span>
        </label>
        <Link to="/">Shop</Link>
        <Link to="/account">Account</Link>
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
