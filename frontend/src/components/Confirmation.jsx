import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Portfolio from './Portfolio';
import ConnectedPayloadPanel, { CONNECTED_PAYLOAD_KEY } from './ConnectedPayloadPanel';

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [userId] = useState(() => localStorage.getItem('userId'));
  // onIntegrationConnected payload stashed by MeshSDK before it navigated here
  const [connectedPayload] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(CONNECTED_PAYLOAD_KEY));
    } catch {
      return null;
    }
  });
  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '64px', color: '#28a745', marginBottom: '10px' }}>✓</div>
        <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Payment Successful!</h2>
        {orderId && (
          <p style={{ fontSize: '14px', color: '#666' }}>
            Order ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{orderId}</span>
          </p>
        )}
        <p style={{ fontSize: '16px', color: '#666' }}>
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
      </div>

      <Portfolio userId={userId} />

      <ConnectedPayloadPanel payload={connectedPayload} />

      <div style={{ marginTop: '40px', textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate('/account')}
          className="btn btn-secondary"
        >
          Manage Wallets
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
