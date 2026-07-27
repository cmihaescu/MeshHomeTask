import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/Button';
import { Notice } from './ui/Notice';

// The catalog serves Unsplash URLs sized w=400; request a sharper cut for
// modern screens. Falls back to the original URL untouched on any surprise.
const productImage = (url) =>
  typeof url === 'string' ? url.replace('w=400', 'w=800&q=80') : url;

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
      data.forEach((product) => {
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
      setQuantities((prev) => ({ ...prev, [productId]: quantity }));
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
    setMessage({ type: 'success', text: `Added ${quantity} × ${product.name} to your cart` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <p className="eyebrow">Shoes &amp; clothing · settled on-chain</p>
          <h1>
            Dress sharp.
            <br />
            Pay in <em>crypto</em>.
          </h1>
          <p className="hero__sub">
            Ten staples, one checkout. Connect an exchange or wallet with Mesh
            and settle the whole basket in the token of your choice.
          </p>
          <div className="hero__meta">
            <span><span className="tick">✓</span> USDC · ETH · and more</span>
            <span><span className="tick">✓</span> Exchange or self-custody wallet</span>
            <span><span className="tick">✓</span> Real-time portfolio after purchase</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div aria-live="polite">
          {message.text ? (
            <Notice tone={message.type === 'success' ? 'success' : 'danger'}>
              {message.text}
            </Notice>
          ) : null}
        </div>

        {loading ? (
          <p className="loading">Loading the rack…</p>
        ) : (
          <ul className="products-grid">
            {products.map((product) => (
              <li key={product.id} className="product-card">
                <div className="product-card__media">
                  <img src={productImage(product.image)} alt={product.name} loading="lazy" />
                </div>
                <div className="product-card__body">
                  <p className="eyebrow">{product.category}</p>
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__desc">{product.description}</p>
                  <div className="product-card__price-row">
                    <span className="price">${product.price}</span>
                    <span className={product.stock === 0 ? 'stock-note stock-note--out' : 'stock-note'}>
                      {product.stock === 0 ? 'sold out' : `${product.stock} in stock`}
                    </span>
                  </div>
                  <div className="product-card__actions">
                    <label className="sr-only" htmlFor={`qty-${product.id}`}>
                      Quantity for {product.name}
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      name={`qty-${product.id}`}
                      autoComplete="off"
                      className="qty"
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      disabled={product.stock === 0}
                    />
                    <Button onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                      {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Shop;
