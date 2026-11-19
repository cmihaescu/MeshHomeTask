import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createLink } from '@meshconnect/web-link-sdk';
import { useMeshEnv } from '../../contexts/MeshEnvContext';
import { useMeshNetworks } from '../../hooks/useMeshNetworks';
import { WITHDRAW_SYMBOLS, buildVerifyMessage, symbolsForNetwork, shortAddress } from '../../lib/withdrawal';

// Networks at least one wallet can verify on, from
// GET /api/v1/wallets/verify/integrations. null = unknown (call failed).
const useVerifiableNetworkIds = () => {
  const { meshEnv, linkVersion } = useMeshEnv();
  const [ids, setIds] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIds(null);
    fetch(`/api/mesh/verify-integrations?env=${meshEnv}&linkVersion=${linkVersion}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        const set = new Set();
        (data?.content?.integrations ?? []).forEach((integration) =>
          (integration.networks ?? []).forEach((n) => set.add(n.id))
        );
        if (!cancelled) setIds(set.size ? set : null);
      })
      .catch((e) => {
        if (import.meta.env.DEV) console.warn('Verify integrations unavailable, showing all networks:', e);
      });
    return () => { cancelled = true; };
  }, [meshEnv, linkVersion]);

  return ids;
};

const STATUS_COPY = {
  creating: { tone: 'info', text: 'Creating a secure verification session…' },
  open: { tone: 'info', text: 'Connect your wallet in Mesh Link and sign the message to prove you own it.' },
  rejected: { tone: 'warn', text: 'You declined to sign the message, so the address was not verified. You can try again at any time.' },
  closed: { tone: 'warn', text: 'Mesh Link was closed before an address was verified.' },
};

const VerifyAddressCard = ({ userId, onVerified, log, isFirstTime }) => {
  const { meshEnv, linkVersion, meshClientId, iframeMode, blockTopLevelLinks } = useMeshEnv();
  const { networks, loading: networksLoading, error: networksError, refresh } = useMeshNetworks();
  const verifiableIds = useVerifiableNetworkIds();

  const [networkId, setNetworkId] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [lastVerified, setLastVerified] = useState(null);
  const [link, setLink] = useState(null);

  // Everything the SDK callbacks need about the session that is open right now.
  const sessionRef = useRef(null);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;
  const iframeId = 'mesh-link-iframe-verify';

  // Only networks that carry one of our withdrawable assets (and, when Mesh
  // tells us, that some wallet can verify on).
  const networkOptions = useMemo(
    () =>
      networks
        .filter((n) => symbolsForNetwork(n).some((s) => WITHDRAW_SYMBOLS.includes(s)))
        .filter((n) => !verifiableIds || verifiableIds.has(n.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [networks, verifiableIds]
  );

  useEffect(() => {
    if (networkId && !networkOptions.some((n) => n.id === networkId)) setNetworkId('');
  }, [networkOptions, networkId]);

  useEffect(() => {
    const instance = createLink({
      clientId: meshClientId,
      language: 'en-US',
      onEvent: (event) => {
        log('onEvent', event.type, event.payload);
        const session = sessionRef.current;

        if (event.type === 'walletMessageSigned') {
          const p = event.payload || {};
          if (!session) return;
          if (!p.isVerified || !p.address) {
            setError('The wallet signature could not be verified. Please try again.');
            setStatus('idle');
            return;
          }
          if (p.message && p.message !== session.message) {
            setError('The signed message did not match the one requested, so the address was not saved.');
            setStatus('idle');
            return;
          }
          const entry = {
            id: crypto.randomUUID(),
            address: p.address,
            networkId: session.networkId,
            networkName: session.networkName,
            symbols: session.symbols,
            env: session.env,
            verification: {
              signedMessageHash: p.signedMessageHash,
              message: p.message ?? session.message,
              timeStamp: p.timeStamp,
              isVerified: p.isVerified,
            },
            verifiedAt: new Date().toISOString(),
          };
          session.verified = true;
          onVerifiedRef.current(entry);
          setLastVerified(entry);
          setStatus('verified');
        } else if (event.type === 'verifyWalletRejected') {
          setStatus('rejected');
        }
      },
      onIntegrationConnected: (payload) => {
        log('onIntegrationConnected', 'integrationConnected', payload);
      },
      onTransferFinished: (payload) => {
        log('onTransferFinished', 'transferFinished', payload);
      },
      onExit: (exitError, summary) => {
        log('onExit', exitError ? 'exit (error)' : 'exit', { error: exitError, summary });
        const session = sessionRef.current;
        sessionRef.current = null;
        if (exitError) {
          setError(typeof exitError === 'string' ? exitError : 'Mesh Link closed with an error.');
          setStatus('idle');
        } else if (session && !session.verified) {
          setStatus((s) => (s === 'rejected' ? s : 'closed'));
        }
      },
    });
    setLink(instance);
  }, [meshClientId, log]);

  const startVerification = async () => {
    const network = networkOptions.find((n) => n.id === networkId);
    if (!link || !network) return;

    setError(null);
    setLastVerified(null);
    setStatus('creating');
    const message = buildVerifyMessage(userId);

    try {
      const res = await fetch('/api/mesh/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, env: meshEnv, linkVersion, networkId: network.id, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.linkToken) {
        throw new Error(data.details || data.error || 'No link token received from server');
      }

      sessionRef.current = {
        message,
        networkId: network.id,
        networkName: network.name,
        symbols: symbolsForNetwork(network).filter((s) => WITHDRAW_SYMBOLS.includes(s)),
        env: meshEnv,
        verified: false,
      };
      setStatus('open');
      link.openLink(data.linkToken, iframeMode ? iframeId : undefined);
    } catch (e) {
      if (import.meta.env.DEV) console.error('Error starting verification:', e);
      setError(e.message || 'Failed to start verification');
      setStatus('idle');
    }
  };

  const busy = status === 'creating' || status === 'open';
  const notice = STATUS_COPY[status];

  return (
    <section className={`wd-card${isFirstTime ? ' wd-verify' : ''}`}>
      <div className="wd-card-head">
        <div>
          <span className="wd-eyebrow">{isFirstTime ? 'Step 1 · Required once' : 'Address book'}</span>
          <h3>{isFirstTime ? 'Verify your withdrawal address' : 'Verify another address'}</h3>
        </div>
        <span className="wd-shield" aria-hidden="true">✓</span>
      </div>
      <p className="wd-muted">
        To meet Travel Rule requirements, withdrawals can only go to a self-hosted wallet you have proven you own.
        You'll sign a short message in your wallet — it's free, off-chain, and moves no funds.
      </p>

      <label className="wd-label" htmlFor="wd-verify-network">Network</label>
      {networksLoading && <p className="wd-muted">Loading networks…</p>}
      {networksError && (
        <p className="wd-inline-error">
          Couldn't load networks: {networksError}{' '}
          <button type="button" className="wd-link-btn" onClick={refresh}>Retry</button>
        </p>
      )}
      {!networksLoading && !networksError && (
        <select
          id="wd-verify-network"
          className="wd-select"
          value={networkId}
          onChange={(e) => setNetworkId(e.target.value)}
          disabled={busy}
        >
          <option value="" disabled>Select the network of your wallet</option>
          {networkOptions.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} · {symbolsForNetwork(n).filter((s) => WITHDRAW_SYMBOLS.includes(s)).join(', ')}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        className="btn btn-primary wd-full"
        onClick={startVerification}
        disabled={!networkId || busy || !link}
      >
        {status === 'creating' ? 'Preparing…' : status === 'open' ? 'Waiting for signature…' : 'Connect wallet & verify'}
      </button>

      {notice && <div className={`wd-notice wd-notice-${notice.tone}`}>{notice.text}</div>}
      {status === 'verified' && lastVerified && (
        <div className="wd-notice wd-notice-success">
          <strong>Address verified.</strong> {shortAddress(lastVerified.address)} on {lastVerified.networkName} is now in your verified addresses.
        </div>
      )}
      {error && <div className="wd-notice wd-notice-error"><strong>Error:</strong> {error}</div>}

      {iframeMode && (
        <iframe
          id={iframeId}
          title="Mesh Connect wallet verification"
          className="wd-iframe"
          sandbox={blockTopLevelLinks ? 'allow-scripts allow-same-origin allow-forms' : undefined}
        />
      )}
    </section>
  );
};

export default VerifyAddressCard;
