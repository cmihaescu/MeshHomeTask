import { useState, useCallback, useRef } from 'react';

/**
 * Collects every Mesh Link SDK callback (onEvent types, onIntegrationConnected,
 * onExit, onTransferFinished) for the on-screen event log, and mirrors each
 * one to the browser console.
 */
export const useMeshEventLog = () => {
  const [entries, setEntries] = useState([]);
  const seq = useRef(0);

  const log = useCallback((source, type, payload) => {
    seq.current += 1;
    const entry = { id: seq.current, at: new Date(), source, type, payload };
    console.log(`[Mesh SDK] ${source} → ${type}`, payload === undefined ? '' : payload);
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, log, clear };
};
