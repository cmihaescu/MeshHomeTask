import { createLink } from "@meshconnect/web-link-sdk";
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const MeshSDKPostmanLink = ({ handleOrderCompletion, orderComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [meshLink, setMeshLink] = useState(null);
    const [linkToken, setLinkToken] = useState('');
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [abortMessage, setAbortMessage] = useState(false);

    useEffect(() => {
        const link = createLink({
            clientId: import.meta.env.VITE_MESH_CLIENT_ID,
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
                handleOrderCompletion(payload);
                navigate(`/confirmation`)
                clearCart()
            }
        });
        setMeshLink(link);
    }, [cartItems, navigate, orderComplete]);

    const handleManualLinkPayment = async () => {
        if (!linkToken.trim()) {
            setError('Please enter a link token');
            return;
        }

        if (!meshLink) {
            setError('Mesh Link SDK not initialized');
            return;
        }

        try {
            setError(null);
            setIsLoading(true);
            meshLink.openLink(linkToken.trim());
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