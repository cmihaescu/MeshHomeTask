// Helpers for the demo withdrawal flow. Nothing here moves real funds: the
// balance is generated client-side and withdrawals only update local state.

// Assets the demo balance holds. `price` is a fixed demo USD price used only
// for display; `decimals` is how many places amounts are shown/entered with.
export const WITHDRAW_ASSETS = [
  { symbol: 'USDC', name: 'USD Coin', price: 1, decimals: 2, range: [2500, 10000], color: '#2775ca' },
  { symbol: 'USDT', name: 'Tether', price: 1, decimals: 2, range: [2500, 10000], color: '#26a17b' },
  { symbol: 'ETH', name: 'Ether', price: 3200, decimals: 6, range: [1, 5], color: '#627eea' },
  { symbol: 'SOL', name: 'Solana', price: 150, decimals: 4, range: [20, 150], color: '#9945ff' },
];

export const WITHDRAW_SYMBOLS = WITHDRAW_ASSETS.map((a) => a.symbol);

export const assetBySymbol = (symbol) => WITHDRAW_ASSETS.find((a) => a.symbol === symbol);

// Integer "minor units" keep the arithmetic exact. 10^decimals minor units = 1 token.
const scale = (asset) => 10 ** asset.decimals;

export const toMinor = (asset, amountString) => {
  const trimmed = String(amountString).trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ''] = trimmed.split('.');
  if (frac.length > asset.decimals) return null;
  return Number(whole) * scale(asset) + Number(frac.padEnd(asset.decimals, '0') || 0);
};

export const formatMinor = (asset, minor) =>
  (minor / scale(asset)).toLocaleString('en-US', {
    minimumFractionDigits: Math.min(asset.decimals, 2),
    maximumFractionDigits: asset.decimals,
  });

export const minorToPlain = (asset, minor) => (minor / scale(asset)).toFixed(asset.decimals);

export const usdValue = (asset, minor) => (minor / scale(asset)) * asset.price;

export const formatUsd = (value) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// A fresh random balance, regenerated on every page load.
export const generateBalance = () =>
  Object.fromEntries(
    WITHDRAW_ASSETS.map((asset) => {
      const [min, max] = asset.range;
      const amount = min + Math.random() * (max - min);
      return [asset.symbol, Math.round(amount * scale(asset))];
    })
  );

// Symbols a network can carry, from the Mesh networks list entry.
export const symbolsForNetwork = (network) => {
  if (!network) return [];
  if (Array.isArray(network.tokens) && network.tokens.length) {
    return network.tokens.map((t) => t.symbol);
  }
  return network.supportedTokens ?? [];
};

export const shortAddress = (address = '') =>
  address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;

// The message the user signs. It names the user and a nonce so a signature
// can't be replayed for a different user or session.
export const buildVerifyMessage = (userId) =>
  `I confirm that I own this wallet address and authorize Demo Shop to send withdrawals to it.\n` +
  `User: ${userId}\nNonce: ${Date.now()}`;

export const fakeTxHash = () =>
  `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')}`;

// walletMessageSigned.timeStamp is typed as a number but documented as an ISO
// string; accept either, and treat small numbers as Unix seconds.
export const formatSignedAt = (timeStamp, fallback) => {
  const value = timeStamp ?? fallback;
  if (value === undefined || value === null) return '—';
  const date = typeof value === 'number' ? new Date(value < 1e12 ? value * 1000 : value) : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
