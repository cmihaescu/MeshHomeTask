import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [userId] = useState(() => localStorage.getItem('userId'));

  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchPortfolio();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/holdings/portfolio/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch portfolio');
      }
      const data = await response.json();
      setPortfolio(data);
      console.log("returned portfolio data", data)
      setError(null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value, decimals = 6) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + '%';
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '64px', color: '#28a745', marginBottom: '10px' }}>✓</div>
        <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Payment Successful!</h2>
        {orderId && (
          <p style={{ fontSize: '14px', color: '#666' }}>
            Order ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{orderId}</span>
          </p>
        )}
        <p style={{ fontSize: '16px', color: '#666' }}>
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
      </div>

      {userId && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Your Crypto Portfolio</h3>
            <button
              onClick={fetchPortfolio}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Portfolio'}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '20px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffeeba',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <strong>Note:</strong> {error}
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                Your payment was successful, but we couldn't fetch your portfolio at this time.
                This may be because no accounts are connected yet.
              </p>
            </div>
          )}

          {isLoading ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #ddd',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>Loading portfolio...</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Please wait while we fetch your holdings
              </div>
            </div>
          ) : portfolio && portfolio.content && portfolio.content.cryptocurrencyPositions && portfolio.content.cryptocurrencyPositions.length > 0 ? (
            <>
              {/* Portfolio Summary */}
              <div style={{
                padding: '30px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '2px solid #28a745',
                marginBottom: '30px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Total Portfolio Value
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                      {formatCurrency(portfolio.content.cryptocurrenciesValue)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Portfolio Cost Basis
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                      {formatCurrency(portfolio.content.portfolioCostBasis)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Portfolio Performance
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: portfolio.content.actualPortfolioPerformance >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {formatPercentage(portfolio.content.actualPortfolioPerformance)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '20px', textAlign: 'center' }}>
                  Across {portfolio.content.cryptocurrencyPositions.length} position{portfolio.content.cryptocurrencyPositions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Cryptocurrency Positions Grid */}
              <div style={{ display: 'grid', gap: '20px' }}>
                {portfolio.content.cryptocurrencyPositions.map((position, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Left Column */}
                      <div>
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                            <span style={{
                              fontSize: '24px',
                              fontWeight: 'bold',
                              color: '#333',
                              marginRight: '10px',
                            }}>
                              {position.symbol}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#fff',
                              backgroundColor: '#007bff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                            }}>
                              {formatPercentage(position.portfolioPercentage)}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {position.name}
                          </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            Amount
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                            {formatNumber(position.amount, 8)} {position.symbol}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            Market Value
                          </div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                            {formatCurrency(position.marketValue)}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <div style={{ marginBottom: '15px' }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            Cost Basis
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>
                            {formatCurrency(position.costBasis)}
                          </div>
                        </div>

                        {position.totalReturn !== undefined && (
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              Total Return
                            </div>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: position.totalReturn >= 0 ? '#28a745' : '#dc3545'
                            }}>
                              {formatCurrency(position.totalReturn)}
                            </div>
                          </div>
                        )}

                        {position.returnPercentage !== undefined && (
                          <div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              Return Percentage
                            </div>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: position.returnPercentage >= 0 ? '#28a745' : '#dc3545'
                            }}>
                              {formatPercentage(position.returnPercentage)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : !error ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #ddd',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
              <div style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '500' }}>
                No Holdings Found
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                You don't have any crypto holdings connected yet.
                Complete a transaction to see your portfolio here.
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate('/account')}
          className="btn btn-secondary"
        >
          Manage Wallets
        </button>
      </div>

      {portfolio && (
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
        }}>
          <strong>Note:</strong> Portfolio data is fetched in real-time from your connected accounts.
          If you've just completed a transaction, it may take a few moments to appear.
        </div>
      )}
    </div>
  );
};

export default Confirmation;
