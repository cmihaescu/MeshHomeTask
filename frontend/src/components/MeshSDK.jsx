import { createLink } from '@meshconnect/web-link-sdk';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMeshEnv } from '../contexts/MeshEnvContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Notice } from './ui/Notice';
import { Field } from './ui/Field';

const MeshSDK = ({ userId, transferType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [meshLinkSDK, setMeshLinkSDK] = useState(null);
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { meshEnv, linkVersion, meshClientId, iframeMode, blockTopLevelLinks } = useMeshEnv();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [abortMessage, setAbortMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const transferCompletedRef = useRef(false);
  // Stable id for the embedded iframe (unique per transfer type on a page)
  const iframeId = `mesh-link-iframe-${transferType || 'pay'}`;

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
            setSuccessMessage(false);
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
        console.log('accessToken & refreshToken ', accessToken, refreshToken);
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
        console.log('Exit. transferCompletedRef =', transferCompletedRef.current);
        if (error) {
          console.error('User closed or error:', error);
          setError(error.message || `${transferType} connection failed`);
        } else if (!transferCompletedRef.current) {
          console.log('onExit closed the widget');
          setAbortMessage(true);
        }
        setIsLoading(false);
      },
      onTransferFinished: (payload) => {
        console.log('Transfer result:', payload);
        setSuccessMessage(true);
        setIsLoading(false);
        transferCompletedRef.current = true;
        navigate(`/confirmation`);
        clearCart();
      },
    });
    setMeshLinkSDK(link);
  }, [cartItems, navigate, meshClientId]);

  const handleCryptoPayment = async () => {
    if (!meshLinkSDK) {
      setError('Mesh Link SDK not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Fetch saved wallet addresses
      const addressesResponse = await fetch(`/api/wallet-addresses/${userId}`);
      let walletAddresses = [];
      if (addressesResponse.ok) {
        walletAddresses = await addressesResponse.json();
      }

      // Network + token chosen on the cart page (if any)
      let selection = {};
      try {
        selection = JSON.parse(localStorage.getItem('meshTransferSelection')) || {};
      } catch {
        selection = {};
      }

      // Create payment link token
      const response = await fetch('/api/mesh/payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: transferType === 'payment' ? getCartTotal() : depositAmount,
          transferType,
          env: meshEnv,
          linkVersion,
          networkId: selection.networkId || undefined,
          symbol: selection.symbol || undefined,
          // Shopper-entered destination address (cart page) for networks with no
          // configured receiving address; ignored by the backend when one exists.
          address: selection.address || undefined,
          toAddresses: walletAddresses.length > 0 ? walletAddresses : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Failed to create ${transferType} link`);
      }

      const data = await response.json();

      if (!data.linkToken) {
        throw new Error('No link token received from server');
      }

      // Open Mesh widget — embed in our iframe when iframe mode is on, else popup
      meshLinkSDK.openLink(data.linkToken, iframeMode ? iframeId : undefined);
    } catch (err) {
      console.error(`Error initiating crypto ${transferType}:`, err);
      setError(err.message || `Failed to initiate ${transferType}`);
      setIsLoading(false);
    }
  };

  const isDeposit = transferType !== 'payment';

  return (
    <section className="panel" aria-label={`Crypto ${transferType} via Mesh Connect`}>
      <h3 className="panel__title">Crypto {transferType} via Mesh Connect</h3>
      <p className="panel__sub">
        Generate a {transferType} link and connect your exchange or wallet.
      </p>

      {userId && isDeposit ? (
        <div style={{ marginBottom: '1rem' }}>
          <Field label="Deposit amount in USDC">
            <input
              type="text"
              inputMode="decimal"
              name="deposit-amount"
              autoComplete="off"
              spellCheck={false}
              className="input--mono"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g. 25.00"
            />
          </Field>
        </div>
      ) : null}
      {userId && !isDeposit ? (
        <p className="panel__sub">
          You can manage your wallet addresses on the <Link to="/account">Account page</Link>.
        </p>
      ) : null}

      <Button block onClick={handleCryptoPayment} disabled={isLoading}>
        {isLoading ? `Generating ${transferType} link…` : `Generate ${transferType} link & pay`}
      </Button>
      <p className="panel__sub" style={{ marginTop: '0.7rem', marginBottom: 0 }}>
        {iframeMode
          ? `Mesh Connect will load in the embedded frame below to complete your ${transferType} securely.`
          : `Mesh Connect will open in a secure window to complete your ${transferType}.`}
      </p>

      <div aria-live="polite">
        {abortMessage ? (
          <Notice tone="warning" onDismiss={() => setAbortMessage(false)}>
            The transfer was not performed — you closed the widget before finishing. Please try again.
          </Notice>
        ) : null}

        {successMessage ? (
          <Notice tone="success" onDismiss={() => setSuccessMessage(false)}>
            Your {transferType} was successful!
          </Notice>
        ) : null}

        {error ? (
          <Notice tone="danger">
            <strong>Error:</strong> {error}
          </Notice>
        ) : null}
      </div>

      {/* When iframe mode is on, the Mesh Link UI is mounted into this element
          (passed to openLink as customIframeId) instead of a popup overlay. */}
      {iframeMode ? (
        <iframe
          id={iframeId}
          title={`Mesh Connect ${transferType}`}
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

export default MeshSDK;
