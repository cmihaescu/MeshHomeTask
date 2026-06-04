import React, { useMemo } from 'react';
import { useMeshNetworks } from '../hooks/useMeshNetworks';

// Tokens for a network: prefer the rich `tokens[]`, fall back to `supportedTokens[]`.
const tokensForNetwork = (network) => {
  if (!network) return [];
  if (Array.isArray(network.tokens) && network.tokens.length) {
    return network.tokens.map((t) => t.symbol);
  }
  return network.supportedTokens ?? [];
};

const selectStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

/**
 * Two dependent dropdowns (network -> crypto token) populated from the
 * cached Mesh networks list. Controlled via `value` ({ networkId, symbol }).
 */
const NetworkTokenSelector = ({ value, onChange }) => {
  const { networks, loading, error, refresh } = useMeshNetworks();
  const { networkId, symbol } = value;

  const selectedNetwork = useMemo(
    () => networks.find((n) => n.id === networkId),
    [networks, networkId]
  );

  const tokenOptions = useMemo(
    () => tokensForNetwork(selectedNetwork),
    [selectedNetwork]
  );

  const handleNetworkChange = (e) => {
    const id = e.target.value;
    const network = networks.find((n) => n.id === id);
    const tokens = tokensForNetwork(network);
    // Reset the token to the first available one for the newly chosen network.
    onChange({ networkId: id, symbol: tokens[0] ?? '' });
  };

  const handleTokenChange = (e) => {
    onChange({ networkId, symbol: e.target.value });
  };

  if (loading) {
    return <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Loading networks…</p>;
  }

  if (error) {
    return (
      <div style={{ fontSize: '14px', color: '#721c24' }}>
        <span>Couldn't load networks: {error}</span>{' '}
        <button
          onClick={refresh}
          style={{
            background: 'none',
            border: 'none',
            color: '#00a26c',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          Network
        </label>
        <select value={networkId || ''} onChange={handleNetworkChange} style={selectStyle}>
          <option value="" disabled>
            Select network
          </option>
          {networks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
          Crypto token
        </label>
        <select
          value={symbol || ''}
          onChange={handleTokenChange}
          style={{ ...selectStyle, cursor: selectedNetwork ? 'pointer' : 'not-allowed' }}
          disabled={!selectedNetwork}
        >
          <option value="" disabled>
            {selectedNetwork ? 'Select token' : 'Select a network first'}
          </option>
          {tokenOptions.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NetworkTokenSelector;
