import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const { addToCart } = useCart();

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

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;

    if (quantity > product.stock) {
      setMessage({ type: 'error', text: 'Quantity exceeds available stock' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    addToCart(product, quantity);
    setMessage({ type: 'success', text: `Added ${quantity} ${product.name} to cart!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    // Reset quantity to 1
    setQuantities({
      ...quantities,
      [product.id]: 1,
    });
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
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
