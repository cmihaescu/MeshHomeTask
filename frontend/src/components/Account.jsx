import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    networkId: '',
    symbol: '',
    address: '',
  });

  // Common network options for convenience
  const networkOptions = [
    { id: 'e3c7fdd8-b1fc-4e51-85ae-bb276e075611', name: 'Polygon (USDC)', symbol: 'USDC' },
    { id: '71c900a7-000f-434d-8b84-527c62a747a0', name: 'Ethereum (USDC)', symbol: 'USDC' },
    { id: 'custom', name: 'Custom Network', symbol: '' },
  ];

  useEffect(() => {
    fetchWalletAddresses();
  }, [userId]);

  const fetchWalletAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/wallet-addresses/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch wallet addresses');
      }

      const data = await response.json();
      setWalletAddresses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet addresses:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.networkId || !newAddress.symbol || !newAddress.address) {
      setError('All fields are required');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/wallet-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          networkId: newAddress.networkId,
          symbol: newAddress.symbol,
          address: newAddress.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add wallet address');
      }

      const data = await response.json();
      setWalletAddresses([...walletAddresses, data.address]);
      setNewAddress({ networkId: '', symbol: '', address: '' });
      setShowAddForm(false);
      setSuccess('Wallet address added successfully!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding wallet address:', err);
      setError(err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this wallet address?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/wallet-addresses/${userId}/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete wallet address');
      }

      setWalletAddresses(walletAddresses.filter(addr => addr.id !== addressId));
      setSuccess('Wallet address deleted successfully!');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting wallet address:', err);
      setError(err.message);
    }
  };

  const handleNetworkChange = (e) => {
    const selectedOption = networkOptions.find(opt => opt.id === e.target.value);
    if (selectedOption && selectedOption.id !== 'custom') {
      setNewAddress({
        ...newAddress,
        networkId: selectedOption.id,
        symbol: selectedOption.symbol,
      });
    } else {
      setNewAddress({
        ...newAddress,
        networkId: e.target.value === 'custom' ? '' : e.target.value,
        symbol: '',
      });
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Wallet Address Management</h2>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back to Shop
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          <strong>User ID:</strong> {userId}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
          Wallet addresses added here will be used automatically when generating payment links.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Saved Wallet Addresses</h3>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add Wallet Address
            </button>
          )}
        </div>

        {showAddForm && (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fff',
            marginBottom: '20px',
          }}>
            <h4 style={{ marginTop: 0 }}>Add New Wallet Address</h4>
            <form onSubmit={handleAddAddress}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Network:
                </label>
                <select
                  value={networkOptions.find(opt => opt.id === newAddress.networkId) ? newAddress.networkId : 'custom'}
                  onChange={handleNetworkChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                  required
                >
                  <option value="">Select a network...</option>
                  {networkOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Network ID:
                </label>
                <input
                  type="text"
                  value={newAddress.networkId}
                  onChange={(e) => setNewAddress({ ...newAddress, networkId: e.target.value })}
                  placeholder="e.g., e3c7fdd8-b1fc-4e51-85ae-bb276e075611"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Symbol (e.g., USDC, ETH):
                </label>
                <input
                  type="text"
                  value={newAddress.symbol}
                  onChange={(e) => setNewAddress({ ...newAddress, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., USDC"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Wallet Address:
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="e.g., 0x910aeb59ba75c8226a84e3c1b0db3b55a4ec2a40"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAddress({ networkId: '', symbol: '', address: '' });
                    setError(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading wallet addresses...
          </div>
        ) : walletAddresses.length === 0 ? (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f8f9fa',
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>No wallet addresses saved yet.</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              Add a wallet address to use it automatically during checkout.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {walletAddresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '10px', color: '#28a745' }}>
                      {addr.symbol}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      Network ID: {addr.networkId}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    wordBreak: 'break-all',
                  }}>
                    {addr.address}
                  </div>
                  {addr.createdAt && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      Added: {new Date(addr.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  style={{
                    marginLeft: '15px',
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
