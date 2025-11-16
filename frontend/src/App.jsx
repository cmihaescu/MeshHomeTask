import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Shop from './components/Shop';
import Auth from './components/Auth';
import Transactions from './components/Transactions';
import Profile from './components/Profile';
import MeshWidget from './components/MeshWidget';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mesh" element={<MeshWidget />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
