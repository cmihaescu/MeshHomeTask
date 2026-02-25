import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Account from './components/Account';
import Confirmation from './components/Confirmation';
import JsonTreeViewer from './components/JsonTreeViewer';

function App() {
  return (
    <Router>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/json-viewer" element={<JsonTreeViewer />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
