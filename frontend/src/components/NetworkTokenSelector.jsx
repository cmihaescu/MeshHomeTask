import React, { useMemo } from 'react';
import { useMeshNetworks } from '../hooks/useMeshNetworks';
import { Field } from './ui/Field';
import { Button } from './ui/Button';

// Tokens for a network: prefer the rich `tokens[]`, fall back to `supportedTokens[]`.
const tokensForNetwork = (network) => {
  if (!network) return [];
  if (Array.isArray(network.tokens) && network.tokens.length) {
    return network.tokens.map((t) => t.symbol);
  }
  return network.supportedTokens ?? [];
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
    return <p className="loading" style={{ padding: '0.5rem 0', textAlign: 'left' }}>Loading networks…</p>;
  }

  if (error) {
    return (
      <p className="panel__sub" style={{ marginBottom: 0 }}>
        Couldn&rsquo;t load networks: {error}{' '}
        <Button variant="ghost" onClick={refresh}>
          Retry
        </Button>
      </p>
    );
  }

  return (
    <div className="selector-grid">
      <Field label="Network">
        <select value={networkId || ''} onChange={handleNetworkChange}>
          <option value="" disabled>
            Select network
          </option>
          {networks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Crypto token">
        <select
          value={symbol || ''}
          onChange={handleTokenChange}
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
      </Field>
    </div>
  );
};

export default NetworkTokenSelector;
