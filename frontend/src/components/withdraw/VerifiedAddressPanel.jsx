import React, { useState } from 'react';
import { shortAddress, formatSignedAt } from '../../lib/withdrawal';

const VerifiedAddressPanel = ({ addresses, selectedId, onSelect, onRemove }) => {
  const [openProofId, setOpenProofId] = useState(null);

  return (
    <section className="wd-card">
      <div className="wd-card-head">
        <div>
          <span className="wd-eyebrow">Step 2</span>
          <h3>Verified addresses</h3>
        </div>
        <span className="wd-count">{addresses.length}</span>
      </div>

      {addresses.length === 0 ? (
        <div className="wd-empty">
          <span className="wd-empty-icon" aria-hidden="true">⌁</span>
          <p>No verified addresses yet. Verify a wallet to start withdrawing.</p>
        </div>
      ) : (
        <ul className="wd-address-list">
          {addresses.map((a) => {
            const selected = a.id === selectedId;
            const proofOpen = openProofId === a.id;
            return (
              <li key={a.id} className={`wd-address${selected ? ' is-selected' : ''}`}>
                <button
                  type="button"
                  className="wd-address-main"
                  onClick={() => onSelect(a.id)}
                  aria-pressed={selected}
                  aria-label={`Select ${a.networkName} address ${shortAddress(a.address)}`}
                >
                  <span className="wd-radio" aria-hidden="true" />
                  <span className="wd-address-text">
                    <span className="wd-address-line">
                      <code title={a.address}>{shortAddress(a.address)}</code>
                      <span className="wd-badge wd-badge-ok">Verified</span>
                    </span>
                    <span className="wd-address-meta">
                      {a.networkName} · {a.symbols.join(', ')}
                      {a.env === 'production' ? ' · Production' : ' · Sandbox'}
                    </span>
                  </span>
                </button>
                <div className="wd-address-actions">
                  <button type="button" className="wd-link-btn" onClick={() => setOpenProofId(proofOpen ? null : a.id)}>
                    {proofOpen ? 'Hide proof' : 'Proof'}
                  </button>
                  <button type="button" className="wd-link-btn wd-link-danger" onClick={() => onRemove(a.id)}>
                    Remove
                  </button>
                </div>
                {proofOpen && (
                  <dl className="wd-proof">
                    <dt>Address</dt><dd><code>{a.address}</code></dd>
                    <dt>Signed message hash</dt><dd><code>{a.verification.signedMessageHash || '—'}</code></dd>
                    <dt>Message</dt><dd><pre>{a.verification.message}</pre></dd>
                    <dt>Signed at</dt>
                    <dd>{formatSignedAt(a.verification.timeStamp, a.verifiedAt)}</dd>
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default VerifiedAddressPanel;
