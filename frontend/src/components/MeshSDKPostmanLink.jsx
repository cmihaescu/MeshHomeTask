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
    const BinanceAccessToken = "f418cacb-e1b6-43e7-ae86-1defc12ad197"
    const LedgerAccessToken = "MDmu/Xqihjn0Qs6HJDQDEQ==.IDghSFdcDujNm+2JM1ZeEXMCNhv+Jmi1AvRs4JYT+rFs4HA0+Ehepwchqj8IwIDJ+ZZJLIE7HF/jHwBPMv9/WmiYBTUFOSqLTl4xoCJNx7uM3zd2Y/HperroxaRVTqPeMgQDYJZTLVeIzaNos9RzTTvbFYyc99xBMtCpndqI03xkb5RF9Hgl3UqFEteRHWvsG0HYwd+d1Cr6TLHi4T8eig4glEhiFTxS8XoQ2EOIyXccuOYPTm1wvnSgAH8RewHoK3pbcZOtt4rMrcViFx1FFoJQ4xCE2U1ED8L8PCoHjb2yLU/TyXqMo6B3Rh2JUwF+ab5o7ZRJiY32Ui59vrVdZDjOftQSGsXDHisEN9vdjMLouW989qfAjHiQO+cT5AqeMi2r8tcWv7YnK0I9ApMg9H+vHGzmi7EPgf+DAIRxLPuLUIZujgr8K7GCHuEoZbPKqHYb+PHsV4wzWpttq+YSEiDXmAyt5RXZn/XhhasFFovhxqVggtInkFKuVVMrHvyTy8G+sPdfaJF2R1m2YuhtQAYgpuwfwVEmgA/LyKFSlypFqOe+8joCIvi4n3eZBlGLbLAxhe2vbcgTqvHgZe5qKgrqD5rQnC9vRUxfSwox/KMLSy5xQi+X4msfz23z2kZhxWop5yhpztz2adCZozEcFqbgHpi+Cym9JtGeu6o82i2wF1scjlNIgR9waOOHwEkW"
    console.log("BinanceAccessToken: ", BinanceAccessToken)
    
   const accessTokens = [];
    // const accessTokens = [
    //     {
    //       accessToken: BinanceAccessToken,
    //       brokerType: "binanceInternationalDirect",
    //       brokerName: 'Binance',
    //       accountId: '',
    //       accountName: ''
    //     }
    //   ]

    useEffect(() => {
        const link = createLink({
            clientId: import.meta.env.VITE_MESH_CLIENT_ID,
            accessTokens: accessTokens,
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