import { createLink } from "@meshconnect/web-link-sdk";
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const MeshSDKPostmanLink = ({ orderComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [meshLinkSDK, setMeshLinkSDK] = useState(null);
    const [linkToken, setLinkToken] = useState('');
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [abortMessage, setAbortMessage] = useState(false);
    const BinanceAccessToken = "WkLaKv1csaiJ3eDpLI3Efg==.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"
    console.log("BinanceAccessToken: ", BinanceAccessToken)
    
//    const accessTokens = [];
    const accessTokens = [
        {
          accessToken: BinanceAccessToken || '',
          brokerType: "binanceInternationalDirect",
          brokerName: 'Binance',
          accountId: '',
          accountName: ''
        }
      ]

    useEffect(() => {
        const link = createLink({
            clientId: import.meta.env.VITE_MESH_CLIENT_ID,
            accessTokens: accessTokens || [],
            onEvent: (event) => {
                console.log("event: ", event)
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
                if (accessToken
                    && refreshToken
                    && !localStorage.getItem('meshAccessToken')
                    && !localStorage.getItem('meshRefreshToken')) {
                    localStorage.setItem('meshAccessToken', accessToken);
                    localStorage.setItem('meshRefreshToken', refreshToken);
                }

            },
            onExit: (error) => {
                if (error) {
                    console.error("User closed or error:", error);
                    setError(error.message || 'Payment connection failed');
                } else {
                    console.log("User closed the widget");
                    setAbortMessage(true);
                }
                setIsLoading(false);
            },
            onTransferFinished: (payload) => {
                console.log("Transfer result:", payload);
                setIsLoading(false);
                navigate(`/confirmation`)
                clearCart()
            }
        });
        setMeshLinkSDK(link);
    }, [cartItems, navigate, orderComplete]);

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
            meshLinkSDK.openLink(linkToken.trim());
        } catch (err) {
            console.error('Error opening link:', err);
            setError(err.message || 'Failed to open Mesh widget');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
            <h4 style={{ marginTop: 0 }}>Pay with Link Token</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Paste a link token generated from Postman or another source.
            </p>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Link Token:
                </label>
                <input
                    type="text"
                    value={linkToken}
                    onChange={(e) => setLinkToken(e.target.value)}
                    placeholder="Paste your link token here"
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
            <button
                onClick={handleManualLinkPayment}
                disabled={isLoading || !linkToken.trim()}
                className="btn btn-secondary"
                style={{ width: '100%' }}
            >
                {isLoading ? 'Processing...' : 'Connect Wallet & Pay'}
            </button>
            <div>
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
            </div>
        </div>
    )
}

export default MeshSDKPostmanLink