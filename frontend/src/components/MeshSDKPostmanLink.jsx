import { createLink } from '@meshconnect/web-link-sdk';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMeshEnv } from '../contexts/MeshEnvContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Notice } from './ui/Notice';
import { Field } from './ui/Field';

const MeshSDKPostmanLink = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meshLinkSDK, setMeshLinkSDK] = useState(null);
  const [linkToken, setLinkToken] = useState('');
  const { cartItems, clearCart } = useCart();
  const { meshClientId, iframeMode, blockTopLevelLinks } = useMeshEnv();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [abortMessage, setAbortMessage] = useState(false);
  // Stable id for the embedded iframe used when iframe mode is on
  const iframeId = 'mesh-link-iframe-postman';

  useEffect(() => {
    const link = createLink({
      clientId: meshClientId,
      accessTokens: [],
      language: 'en-US',
      onEvent: (event) => {
        console.log('event: ', event);
        switch (event.type) {
          case 'pageLoaded':
            console.log('onEvent pageLoaded fired: ', event);
            setAbortMessage(false);
            break;
          case 'close':
            console.log('onEvent close fired: ', event);
            break;
          default:
            console.log('Unmapped/Unknown event type');
            break;
        }
      },
      onIntegrationConnected: (payload) => {
        console.log('Connected!', payload);
        const { accessToken } = payload.accessToken.accountTokens[0];
        const { refreshToken } = payload.accessToken.accountTokens[0];
        // Store Mesh tokens if present
        if (
          accessToken &&
          refreshToken &&
          !localStorage.getItem('meshAccessToken') &&
          !localStorage.getItem('meshRefreshToken')
        ) {
          localStorage.setItem('meshAccessToken', accessToken);
          localStorage.setItem('meshRefreshToken', refreshToken);
        }
      },
      onExit: (error) => {
        if (error) {
          console.error('User closed or error:', error);
          setError(error.message || 'Payment connection failed');
        } else {
          console.log('User closed the widget');
          setAbortMessage(true);
        }
        setIsLoading(false);
      },
      onTransferFinished: (payload) => {
        console.log('Transfer result:', payload);
        setIsLoading(false);
        navigate(`/confirmation`);
        clearCart();
      },
    });
    setMeshLinkSDK(link);
  }, [cartItems, navigate, meshClientId]);

  const handleManualLinkPayment = async () => {
    if (!linkToken.trim()) {
      setError('Please enter a link token');
      return;
    }

    if (!meshLinkSDK) {
      setError('Mesh Link SDK not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      // Embed in our iframe when iframe mode is on, else open the popup
      meshLinkSDK.openLink(linkToken.trim(), iframeMode ? iframeId : undefined);
    } catch (err) {
      console.error('Error opening link:', err);
      setError(err.message || 'Failed to open Mesh widget');
      setIsLoading(false);
    }
  };

  return (
    <section className="panel" aria-label="Pay with a link token">
      <h3 className="panel__title">Pay with a link token</h3>
      <p className="panel__sub">
        Paste a link token generated from Postman or another source.
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <Field label="Link token">
          <input
            type="text"
            name="link-token"
            autoComplete="off"
            spellCheck={false}
            className="input--mono"
            value={linkToken}
            onChange={(e) => setLinkToken(e.target.value)}
            placeholder="Paste your link token…"
          />
        </Field>
      </div>
      <Button
        block
        variant="secondary"
        onClick={handleManualLinkPayment}
        disabled={isLoading || !linkToken.trim()}
      >
        {isLoading ? 'Processing…' : 'Connect wallet & pay'}
      </Button>

      <div aria-live="polite">
        {abortMessage ? (
          <Notice tone="warning" onDismiss={() => setAbortMessage(false)}>
            The transfer was not performed — you closed the widget before finishing. Please try again.
          </Notice>
        ) : null}

        {error ? (
          <Notice tone="danger">
            <strong>Error:</strong> {error}
          </Notice>
        ) : null}
      </div>

      {/* When iframe mode is on, the Mesh Link UI mounts here
          (passed to openLink as customIframeId) instead of a popup. */}
      {iframeMode ? (
        <iframe
          id={iframeId}
          title="Mesh Connect"
          className="mesh-frame"
          // When "block top-level links" is on, sandbox the frame: allow the
          // SDK to run (scripts/forms/same-origin) but withhold allow-popups
          // and allow-top-navigation so it can't open new tabs or redirect us.
          sandbox={blockTopLevelLinks ? 'allow-scripts allow-same-origin allow-forms' : undefined}
        />
      ) : null}
    </section>
  );
};

export default MeshSDKPostmanLink;
