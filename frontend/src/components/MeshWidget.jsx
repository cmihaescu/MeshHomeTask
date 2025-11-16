import React, { useState, useEffect } from 'react';
import { createLink } from "@meshconnect/web-link-sdk";

const MeshWidget = () => {
  const [meshLink, setMeshLink] = useState(null);
  const [linkToken, setLinkToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Mesh Link SDK
    const link = createLink({
      clientId: import.meta.env.VITE_MESH_CLIENT_ID,
      onIntegrationConnected: (payload) => {
        // payload has auth_token, refresh_token, integrationId, userId, etc.
        console.log("Connected!", payload);
        // TODO: Save tokens to your backend via API
        alert('Successfully connected! Check console for details.');
      },
      onExit: (error) => {
        if (error) {
          console.error("User closed or error:", error);
          setError(error.message || 'Connection failed');
        } else {
          console.log("User closed the widget");
        }
        setIsLoading(false);
      },
      onTransferFinished: (payload) => {
        console.log("Transfer result:", payload);
        // Update UI or backend accordingly
        setIsLoading(false);
      }
    });

    setMeshLink(link);
  }, []);

  const handleOpenLink = () => {
    if (!linkToken.trim()) {
      setError('Please enter a link token');
      return;
    }

    if (!meshLink) {
      setError('Mesh Link SDK not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      meshLink.openLink(linkToken.trim());
    } catch (err) {
      console.error('Error opening link:', err);
      setError(err.message || 'Failed to open Mesh widget');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Mesh Connect Widget</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Link Token (from Postman):
        </label>
        <input
          type="text"
          value={linkToken}
          onChange={(e) => setLinkToken(e.target.value)}
          placeholder="Paste your link token here"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}
        />
      </div>

      <button
        onClick={handleOpenLink}
        disabled={isLoading || !linkToken.trim()}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !linkToken.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Opening...' : 'Connect Wallet/Exchange'}
      </button>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Instructions:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Get a link token from your Postman request</li>
          <li>Paste the token in the field above</li>
          <li>Click "Connect Wallet/Exchange"</li>
        </ol>
        <p><strong>Note:</strong> If you see a CSP error, you need to add your domain to Mesh Connect's allowed origins.</p>
      </div>
    </div>
  )
}



export default MeshWidget