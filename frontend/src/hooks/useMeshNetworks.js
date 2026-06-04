import { useState, useEffect, useCallback } from 'react';
import { useMeshEnv } from '../contexts/MeshEnvContext';

// Cache key is per-env, since the supported networks can differ between
// sandbox and production.
const cacheKey = (env) => `meshNetworks:${env}`;

/**
 * Fetches the Mesh supported-networks list once and caches it in localStorage.
 * The response is effectively static, so the network request only runs when
 * the cache for the active env is empty (or a forced refresh is requested).
 */
export const useMeshNetworks = () => {
  const { meshEnv } = useMeshEnv();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ force = false } = {}) => {
    const key = cacheKey(meshEnv);

    // Use the cached copy unless a refresh was explicitly requested.
    if (!force) {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          setNetworks(JSON.parse(cached));
          setError(null);
          return;
        } catch {
          localStorage.removeItem(key); // corrupt cache — fall through to fetch
        }
      }
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/mesh/networks?env=${meshEnv}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Failed to fetch networks');
      }
      const data = await res.json();
      const list = data?.content?.networks ?? [];
      setNetworks(list);
      localStorage.setItem(key, JSON.stringify(list));
      setError(null);
    } catch (e) {
      console.error('Error loading Mesh networks:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [meshEnv]);

  // Runs on mount and whenever the env changes; only fetches when uncached.
  useEffect(() => {
    load();
  }, [load]);

  return { networks, loading, error, refresh: () => load({ force: true }) };
};
