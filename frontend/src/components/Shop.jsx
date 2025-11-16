import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      const initialQuantities = {};
      data.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value);
    if (quantity > 0) {
      setQuantities({
        ...quantities,
        [productId]: quantity,
      });
    }
  };

  const handlePurchase = async (productId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId,
          quantity: quantities[productId],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: 'Purchase successful!' });
      fetchProducts(); // Refresh to update stock
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="container">
      <div className="products-header">
        <h2>Shop - Shoes & Clothing</h2>
      </div>
      {message.text && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <div className="product-category">{product.category}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <div>
                  <div className="product-price">${product.price}</div>
                  <div className="product-stock">Stock: {product.stock}</div>
                </div>
              </div>
              <div className="purchase-section">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="quantity-input"
                  disabled={product.stock === 0}
                />
                <button
                  onClick={() => handlePurchase(product.id)}
                  className="btn btn-primary"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
