import React, { useMemo, useState } from 'react';
import { useVerifiedAddresses } from '../../hooks/useVerifiedAddresses';
import { useMeshEventLog } from '../../hooks/useMeshEventLog';
import { generateBalance, assetBySymbol, formatMinor, shortAddress } from '../../lib/withdrawal';
import BalancePanel from './BalancePanel';
import VerifyAddressCard from './VerifyAddressCard';
import VerifiedAddressPanel from './VerifiedAddressPanel';
import WithdrawForm from './WithdrawForm';
import EventLogPanel from './EventLogPanel';
import './withdraw.css';

const getUserId = () => {
  let id = localStorage.getItem('userId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('userId', id);
  }
  return id;
};

const Withdraw = () => {
  const [userId] = useState(getUserId);
  const [balance, setBalance] = useState(generateBalance);
  const [history, setHistory] = useState([]);
  const { addresses, addAddress, removeAddress } = useVerifiedAddresses(userId);
  const { entries, log, clear } = useMeshEventLog();
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(() => addresses.find((a) => a.id === selectedId) ?? null, [addresses, selectedId]);
  const isFirstTime = addresses.length === 0;

  const handleVerified = (entry) => {
    addAddress(entry);
    setSelectedId(entry.id);
  };

  const handleRemove = (id) => {
    removeAddress(id);
    if (id === selectedId) setSelectedId(null);
  };

  const handleWithdraw = (result) => {
    setBalance((b) => ({ ...b, [result.symbol]: b[result.symbol] - result.amountMinor }));
    setHistory((h) => [result, ...h]);
  };

  return (
    <div className="wd-page">
      <header className="wd-header">
        <div>
          <span className="wd-eyebrow">Wallet</span>
          <h2>Withdraw crypto</h2>
          <p className="wd-muted">Send your balance to a self-hosted wallet you've verified with Mesh.</p>
        </div>
        <ol className="wd-steps" aria-label="Withdrawal steps">
          <li className={isFirstTime ? 'is-current' : 'is-done'}><span>1</span>Verify</li>
          <li className={!isFirstTime && !selected ? 'is-current' : selected ? 'is-done' : ''}><span>2</span>Select</li>
          <li className={selected ? 'is-current' : ''}><span>3</span>Withdraw</li>
        </ol>
      </header>

      <BalancePanel balance={balance} onRegenerate={() => setBalance(generateBalance())} />

      <div className="wd-grid">
        <div className="wd-col">
          {/* One stable card (so an open Link session survives the first
              verification); CSS order moves it above the list first time. */}
          <div className={isFirstTime ? 'wd-order-first' : 'wd-order-last'}>
            <VerifyAddressCard userId={userId} onVerified={handleVerified} log={log} isFirstTime={isFirstTime} />
          </div>
          <VerifiedAddressPanel
            addresses={addresses}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRemove={handleRemove}
          />
        </div>
        <div className="wd-col">
          <WithdrawForm address={selected} balance={balance} onWithdraw={handleWithdraw} />
          {history.length > 0 && (
            <section className="wd-card">
              <div className="wd-card-head"><h3>Recent withdrawals</h3></div>
              <ul className="wd-history">
                {history.map((h) => (
                  <li key={h.txHash}>
                    <span className="wd-history-amt">−{formatMinor(assetBySymbol(h.symbol), h.amountMinor)} {h.symbol}</span>
                    <span className="wd-muted wd-small">to {shortAddress(h.address)} · {h.networkName} · {new Date(h.at).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <EventLogPanel entries={entries} onClear={clear} />
    </div>
  );
};

export default Withdraw;
