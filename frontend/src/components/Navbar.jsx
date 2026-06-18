import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useMeshEnv, MESH_ENVS, MESH_LINK_VERSIONS } from '../contexts/MeshEnvContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();
  const { meshEnv, setMeshEnv, linkVersion, setLinkVersion, iframeMode, setIframeMode, blockTopLevelLinks, setBlockTopLevelLinks } = useMeshEnv();
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
        {/* Link account toggle — switches which Mesh account (Link v1 / v2)
            credentials are used for the SDK and backend calls */}
        <div
          title="Mesh Link account configuration used for payments and deposits"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}
        >
          <span style={{ fontSize: '12px', color: '#666' }}>Account:</span>
          <select
            value={linkVersion}
            onChange={(e) => setLinkVersion(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              color: '#1452cc',
              backgroundColor: '#eaf1fd',
            }}
          >
            {MESH_LINK_VERSIONS.map((v) => (
              <option key={v} value={v}>
                {`Link ${v}`}
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
        {/* Sandbox the embedded iframe so it can't open new tabs or navigate
            the top window. Only relevant while iframe mode is on. */}
        {iframeMode && (
          <label
            title="Sandbox the iframe so it cannot open new tabs/windows or navigate the top-level page"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={blockTopLevelLinks}
              onChange={(e) => setBlockTopLevelLinks(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>Block top-level links</span>
          </label>
        )}
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
