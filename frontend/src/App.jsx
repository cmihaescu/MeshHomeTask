import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { MeshEnvProvider } from './contexts/MeshEnvContext';
import Navbar from './components/Navbar';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Account from './components/Account';
import Confirmation from './components/Confirmation';

function App() {
  return (
    <Router>
      <MeshEnvProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </CartProvider>
      </MeshEnvProvider>
    </Router>
  );
}

export default App;
