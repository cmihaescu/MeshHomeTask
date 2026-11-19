import React, { useEffect, useState } from 'react';
import {
  assetBySymbol, formatMinor, formatUsd, minorToPlain, shortAddress, toMinor, usdValue, fakeTxHash,
} from '../../lib/withdrawal';

const WithdrawForm = ({ address, balance, onWithdraw }) => {
  const symbols = address?.symbols ?? [];
  const [symbol, setSymbol] = useState(symbols[0] ?? '');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState('form'); // form | review | processing | done
  const [receipt, setReceipt] = useState(null);

  // A different destination may carry different assets — reset the form.
  useEffect(() => {
    setSymbol(address?.symbols?.[0] ?? '');
    setAmount('');
    setStage('form');
    setReceipt(null);
  }, [address?.id]);

  if (!address) {
    return (
      <section className="wd-card wd-card-disabled">
        <div className="wd-card-head">
          <div>
            <span className="wd-eyebrow">Step 3</span>
            <h3>Withdraw</h3>
          </div>
        </div>
        <div className="wd-empty">
          <span className="wd-empty-icon" aria-hidden="true">↗</span>
          <p>Select a verified address to withdraw to.</p>
        </div>
      </section>
    );
  }

  const asset = assetBySymbol(symbol);
  const available = asset ? balance[symbol] ?? 0 : 0;
  const minor = asset && amount !== '' ? toMinor(asset, amount) : null;

  let amountError = null;
  if (amount !== '' && asset) {
    if (minor === null) amountError = `Enter a number with up to ${asset.decimals} decimal places.`;
    else if (minor <= 0) amountError = 'Enter an amount greater than zero.';
    else if (minor > available) amountError = 'Amount exceeds your available balance.';
  }
  const canReview = asset && minor !== null && !amountError && minor > 0;

  const confirm = () => {
    setStage('processing');
    // Simulated processing only: no funds are moved anywhere.
    setTimeout(() => {
      const result = {
        txHash: fakeTxHash(),
        symbol,
        amountMinor: minor,
        address: address.address,
        networkName: address.networkName,
        at: new Date().toISOString(),
      };
      onWithdraw(result);
      setReceipt(result);
      setStage('done');
    }, 1400);
  };

  const reset = () => {
    setAmount('');
    setReceipt(null);
    setStage('form');
  };

  return (
    <section className="wd-card">
      <div className="wd-card-head">
        <div>
          <span className="wd-eyebrow">Step 3</span>
          <h3>Withdraw</h3>
        </div>
        <span className="wd-badge wd-badge-sim">Simulated</span>
      </div>

      <div className="wd-destination">
        <span className="wd-muted">To</span>
        <code title={address.address}>{shortAddress(address.address)}</code>
        <span className="wd-pill">{address.networkName}</span>
      </div>

      {stage === 'form' && (
        <>
          {symbols.length === 0 ? (
            <div className="wd-notice wd-notice-warn">None of your balance assets can be sent on {address.networkName}.</div>
          ) : (
            <>
              <span className="wd-label">Asset</span>
              <div className="wd-asset-tabs" role="radiogroup" aria-label="Asset">
                {symbols.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={s === symbol}
                    className={`wd-tab${s === symbol ? ' is-active' : ''}`}
                    onClick={() => { setSymbol(s); setAmount(''); }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label className="wd-label" htmlFor="wd-amount">Amount</label>
              <div className={`wd-amount${amountError ? ' has-error' : ''}`}>
                <input
                  id="wd-amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
                />
                <span className="wd-amount-symbol">{symbol}</span>
                <button type="button" className="wd-max" onClick={() => setAmount(minorToPlain(asset, available))}>
                  Max
                </button>
              </div>
              <div className="wd-amount-help">
                <span>Available: {asset ? formatMinor(asset, available) : '0'} {symbol}</span>
                {canReview && <span>≈ {formatUsd(usdValue(asset, minor))}</span>}
              </div>
              {amountError && <p className="wd-inline-error">{amountError}</p>}

              <button type="button" className="btn btn--primary wd-full" disabled={!canReview} onClick={() => setStage('review')}>
                Review withdrawal
              </button>
            </>
          )}
        </>
      )}

      {stage === 'review' && (
        <div className="wd-review">
          <div className="wd-review-amount">
            {formatMinor(asset, minor)} <span>{symbol}</span>
          </div>
          <div className="wd-muted wd-center">≈ {formatUsd(usdValue(asset, minor))}</div>
          <dl className="wd-review-rows">
            <dt>Network</dt><dd>{address.networkName}</dd>
            <dt>Destination</dt><dd><code>{address.address}</code></dd>
            <dt>Network fee</dt><dd>Covered (demo)</dd>
          </dl>
          <div className="wd-row-btns">
            <button type="button" className="btn btn--secondary" onClick={() => setStage('form')}>Back</button>
            <button type="button" className="btn btn--primary" onClick={confirm}>Confirm withdrawal</button>
          </div>
        </div>
      )}

      {stage === 'processing' && (
        <div className="wd-processing">
          <span className="wd-spinner" aria-hidden="true" />
          <p>Processing your withdrawal…</p>
        </div>
      )}

      {stage === 'done' && receipt && (
        <div className="wd-done">
          <span className="wd-done-check" aria-hidden="true">✓</span>
          <h4>Withdrawal submitted</h4>
          <p className="wd-muted">
            {formatMinor(asset, receipt.amountMinor)} {receipt.symbol} to {shortAddress(receipt.address)} on {receipt.networkName}.
          </p>
          <p className="wd-tx"><span>Demo tx</span><code>{shortAddress(receipt.txHash)}</code></p>
          <button type="button" className="btn btn--secondary wd-full" onClick={reset}>New withdrawal</button>
        </div>
      )}

      <p className="wd-footnote">This is a UI demonstration. No funds are moved and nothing is broadcast on-chain.</p>
    </section>
  );
};

export default WithdrawForm;
