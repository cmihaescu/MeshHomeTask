import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Portfolio from './Portfolio';

const Account = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      console.log("user Id set from account page")
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const [meshTokens, setMeshTokens] = useState(null);
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
    { id: 'e3c7fdd8-b1fc-4e51-85ae-bb276e075611', name: 'Ethereum (USDC)', symbol: 'USDC' },
    { id: 'custom', name: 'Custom Network', symbol: '' },
  ];

  useEffect(() => {
    if(localStorage.getItem('meshAccessToken')&&localStorage.getItem('meshRefreshToken'))
    setMeshTokens({
      accessToken:localStorage.getItem('meshAccessToken'),
      refreshToken:localStorage.getItem('meshRefreshToken')
    })
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
        <h2>Account details</h2>
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
      {/* Portfolio Section */}
      <h3 style={{ marginBottom: '15px' }}>Portfolio details</h3>
      <Portfolio userId={userId}/>
      {/* Mesh Tokens Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Mesh Connect Tokens</h3>
        {meshTokens ? (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fff',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                Access Token
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                wordBreak: 'break-all',
                border: '1px solid #e9ecef',
              }}>
                {meshTokens.accessToken}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                Refresh Token
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                wordBreak: 'break-all',
                border: '1px solid #e9ecef',
              }}>
                {meshTokens.refreshToken}
              </div>
            </div>

            {meshTokens.updatedAt && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Last Updated:</strong> {new Date(meshTokens.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            color: '#666',
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              No Mesh Connect tokens found. Complete a payment to connect your wallet and generate tokens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
