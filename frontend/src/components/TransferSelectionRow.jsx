import React from 'react';
import NetworkTokenSelector from './NetworkTokenSelector';
import { useNetworkAddress } from '../hooks/useNetworkAddress';
import { Field } from './ui/Field';

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
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <NetworkTokenSelector value={value} onChange={handleSelectionChange} />
        </div>
        {onRemove ? (
          <button
            type="button"
            className="icon-btn"
            onClick={onRemove}
            aria-label="Remove this network and token"
            title="Remove this network & token"
          >
            ×
          </button>
        ) : null}
      </div>

      {/* Shown only when the selected network/token has no merchant address
          configured on the backend — the shopper must supply a destination
          address that's valid for the chosen chain. */}
      {needsAddress ? (
        <div style={{ marginTop: '1rem' }}>
          <Field
            label="Destination address"
            hint="No receiving address is configured for this network, so the payment will be sent to the address you enter here. Make sure it's valid for the selected network."
          >
            <input
              type="text"
              name="destination-address"
              autoComplete="off"
              spellCheck={false}
              className="input--mono"
              value={value.address || ''}
              onChange={handleAddressChange}
              placeholder="e.g. 0x6A36…3266"
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
};

export default TransferSelectionRow;
