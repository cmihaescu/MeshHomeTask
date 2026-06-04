import { useState, useEffect } from 'react';

/**
 * Asks the backend whether the selected network/token has a configured merchant
 * receiving address (see backend/networkAddresses.js). When it doesn't, the
 * checkout needs to collect a destination address from the shopper.
 *
 * Returns { configured, loading } — `configured` is true once we've confirmed
 * the backend has an address for this network/token. While loading or before a
 * full selection is made, `configured` stays false.
 */
export const useNetworkAddress = (networkId, symbol) => {
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // No complete selection yet — nothing to check.
    if (!networkId) {
      setConfigured(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({ networkId });
    if (symbol) params.set('symbol', symbol);

    fetch(`/api/mesh/network-address?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { configured: false }))
      .then((data) => {
        if (!cancelled) setConfigured(!!data.configured);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [networkId, symbol]);

  return { configured, loading };
};
