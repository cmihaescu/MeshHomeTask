import { useState, useCallback, useEffect } from 'react';

const storageKey = (userId) => `verifiedAddresses:${userId}`;

const read = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Verified withdrawal addresses for one user, persisted in localStorage.
 * Each entry keeps the full `walletMessageSigned` payload (including the
 * signedMessageHash, which Mesh never returns again) for audit.
 */
export const useVerifiedAddresses = (userId) => {
  const [addresses, setAddresses] = useState(() => read(userId));

  useEffect(() => {
    setAddresses(read(userId));
  }, [userId]);

  const persist = useCallback((next) => {
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
    setAddresses(next);
  }, [userId]);

  // Re-verifying an address on the same network replaces the old record.
  const addAddress = useCallback((entry) => {
    const current = read(userId);
    const sameKey = (a) =>
      a.address.toLowerCase() === entry.address.toLowerCase() && a.networkId === entry.networkId;
    persist([entry, ...current.filter((a) => !sameKey(a))]);
  }, [userId, persist]);

  const removeAddress = useCallback((id) => {
    persist(read(userId).filter((a) => a.id !== id));
  }, [userId, persist]);

  return { addresses, addAddress, removeAddress };
};
