import { createLink } from "@meshconnect/web-link-sdk";
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { useMeshEnv } from '../contexts/MeshEnvContext';
import { useNavigate } from 'react-router-dom';



const MeshSDK = ({ userId, orderComplete, transferType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [meshLinkSDK, setMeshLinkSDK] = useState(null);
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { meshEnv, iframeMode } = useMeshEnv();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [abortMessage, setAbortMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0)
  const transferCompletedRef = useRef(false);
  // Stable id for the embedded iframe (unique per transfer type on a page)
  const iframeId = `mesh-link-iframe-${transferType || 'pay'}`;
  
  const accessTokens = [
    {
      accessToken: '',
      brokerType: "binanceInternationalDirect",
      brokerName: 'Binance',
      accountId: '',
      accountName: ''
    }
  ]


  useEffect(() => {
    const link = createLink({
      clientId: import.meta.env.VITE_MESH_CLIENT_ID,
      accessTokens: [],
      onEvent: (event) => {
        console.log("event: ",event)
        switch (event.type) {
          case 'pageLoaded':
            console.log("onEvent pageLoaded fired: ", event)
            setAbortMessage(false)
            setSuccessMessage(false)
          break
          case 'close':
            console.log("onEvent close fired: ", event)
          break
          default:
            console.log("Unmapped/Unknown event type")
            break;
        }
      },
      onIntegrationConnected: (payload) => {
        console.log("Connected!", payload);
        const { accessToken } = payload.accessToken.accountTokens[0]
        const { refreshToken } = payload.accessToken.accountTokens[0]
        // Store Mesh tokens if present
        console.log('accessToken & refreshToken ', accessToken, refreshToken)
        if (accessToken
          && refreshToken
          && !localStorage.getItem('meshAccessToken')
          && !localStorage.getItem('meshRefreshToken')) {
          localStorage.setItem('meshAccessToken', accessToken);
          localStorage.setItem('meshRefreshToken', refreshToken);
        }
      },
      onExit: (error) => {
        console.log("Exit. transferCompletedRef =", transferCompletedRef.current);
        if (error) {
          console.error("User closed or error:", error);
          setError(error.message || `${transferType} connection failed`);
        } else if (!transferCompletedRef.current) {
          console.log("onExit closed the widget");
          setAbortMessage(true);
        }
        setIsLoading(false);
      },
      onTransferFinished: (payload) => {
        console.log("Transfer result:", payload);
        setSuccessMessage(true)
        setIsLoading(false)
        transferCompletedRef.current = true;
        navigate(`/confirmation`)
        clearCart()
      }
    });
    setMeshLinkSDK(link);
  }, [cartItems, navigate, orderComplete]);


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
          amount: transferType === "payment" ? getCartTotal() : depositAmount,
          transferType,
          env: meshEnv,
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


  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h4 style={{ marginTop: 0 }}>Crypto {transferType} via Mesh Connect</h4>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
        Click the button below to generate a {transferType} link and connect your crypto wallet.
        {userId && (
          <>
            <br />
            <span style={{ fontSize: '12px', marginTop: '5px', display: 'block' }}>
              {transferType === "payment" ?
                <p>You can manage your wallet addresses in the{' '}
                  <a href="/account" style={{ color: '#00c281', textDecoration: 'underline' }}>
                    Account page
                  </a>.</p>
                :
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Deposit amount in USDC:
                  </label>
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Input deposit value here"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              }
            </span>
          </>
        )}
      </p>
      <button
        onClick={handleCryptoPayment}
        disabled={isLoading}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        {isLoading ? `Generating ${transferType} Link...` : `Generate ${transferType} Link & Pay`}
      </button>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        {iframeMode
          ? `Mesh Connect will load in the embedded frame below to complete your ${transferType} securely.`
          : `You'll be redirected to Mesh Connect to complete your ${transferType} securely.`}
      </p>
      {abortMessage && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>You aborted mission, the transfer was not performed, please try again.</span>
          <button
            onClick={() => setAbortMessage(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 8px',
              marginLeft: '15px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#047c00ff',
          color: 'white',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{`Your ${transferType} was successfull!`}</span>
          <button
            onClick={() => setSuccessMessage(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 8px',
              marginLeft: '15px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* When iframe mode is on, the Mesh Link UI is mounted into this element
          (passed to openLink as customIframeId) instead of a popup overlay. */}
      {iframeMode && (
        <iframe
          id={iframeId}
          title={`Mesh Connect ${transferType}`}
          style={{
            width: '100%',
            height: '600px',
            marginTop: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}
        />
      )}
    </div>
  )
}

export default MeshSDK