import React from 'react';
import { WITHDRAW_ASSETS, formatMinor, formatUsd, usdValue } from '../../lib/withdrawal';

const BalancePanel = ({ balance, onRegenerate }) => {
  const total = WITHDRAW_ASSETS.reduce((sum, a) => sum + usdValue(a, balance[a.symbol] ?? 0), 0);

  return (
    <section className="wd-hero">
      <div className="wd-hero-top">
        <div>
          <span className="wd-hero-label">Available balance</span>
          <div className="wd-hero-total">{formatUsd(total)}</div>
          <span className="wd-hero-sub">Demo funds · a new balance is generated on every refresh</span>
        </div>
        <button type="button" className="wd-hero-btn" onClick={onRegenerate}>↻ Regenerate</button>
      </div>
      <div className="wd-assets">
        {WITHDRAW_ASSETS.map((asset) => (
          <div key={asset.symbol} className="wd-asset">
            <span className="wd-asset-icon" style={{ background: asset.color }}>{asset.symbol.slice(0, 1)}</span>
            <div className="wd-asset-body">
              <span className="wd-asset-symbol">{asset.symbol}</span>
              <span className="wd-asset-amount">{formatMinor(asset, balance[asset.symbol] ?? 0)}</span>
              <span className="wd-asset-usd">{formatUsd(usdValue(asset, balance[asset.symbol] ?? 0))}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BalancePanel;
