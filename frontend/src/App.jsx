import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { MeshEnvProvider } from './contexts/MeshEnvContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Shop from './components/Shop';
import Cart from './components/Cart';

// The Mesh web-link SDK is only needed once the shopper reaches checkout (or
// the account/confirmation pages that embed the deposit widget). Splitting
// these routes keeps the SDK out of the initial shop bundle.
const Checkout = lazy(() => import('./components/Checkout'));
const Account = lazy(() => import('./components/Account'));
const Confirmation = lazy(() => import('./components/Confirmation'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <MeshEnvProvider>
          <CartProvider>
            <Navbar />
            <main id="main">
              <Suspense fallback={<p className="loading">Loading…</p>}>
                <Routes>
                  <Route path="/" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </CartProvider>
        </MeshEnvProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
