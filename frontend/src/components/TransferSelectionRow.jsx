import React from 'react';
import NetworkTokenSelector from './NetworkTokenSelector';
import { useNetworkAddress } from '../hooks/useNetworkAddress';

/**
 * One network + token combo row: the dependent dropdowns plus, when the
 * selected network has no merchant receiving address configured on the
 * backend, a destination-address input for the shopper. Optionally renders
 * a remove button (used for the additional combos below the main section).
 */
const TransferSelectionRow = ({ value, onChange, onRemove }) => {
  // Whether the backend already has a receiving address for this network/token.
  const { configured, loading: addressLoading } = useNetworkAddress(
    value.networkId,
    value.symbol
  );
  // Prompt for an address only once we know none is configured for the selection.
  const needsAddress = !!value.networkId && !addressLoading && !configured;

  // Network/token changed — clear any previously entered address so it can't
  // leak across networks (a stale address would be invalid on the new chain).
  const handleSelectionChange = ({ networkId, symbol }) => {
    onChange({ networkId, symbol, address: '' });
  };

  const handleAddressChange = (e) => {
    onChange({ ...value, address: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <NetworkTokenSelector value={value} onChange={handleSelectionChange} />
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '20px',
              height: '38px',
            }}
            title="Remove this network & token"
          >
            ×
          </button>
        )}
      </div>

      {/* Shown only when the selected network/token has no merchant address
          configured on the backend — the shopper must supply a destination
          address that's valid for the chosen chain. */}
      {needsAddress && (
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px' }}>
            Destination address
          </label>
          <input
            type="text"
            value={value.address || ''}
            onChange={handleAddressChange}
            placeholder="Enter the receiving address for this network"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: '12px', color: '#856404', marginTop: '6px', marginBottom: 0 }}>
            No receiving address is configured for this network, so the payment will be sent to the
            address you enter here. Make sure it's valid for the selected network.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransferSelectionRow;
