import React, { useState, useEffect } from 'react';
import MeshSDK from './MeshSDK';
import { useMeshEnv } from '../contexts/MeshEnvContext';

// Safely format numeric fields — production portfolio positions may omit some.
const fmt = (value, digits = 2) =>
    Number.isFinite(value) ? value.toFixed(digits) : (0).toFixed(digits);

const Portfolio = ({ userId }) => {

    const { meshEnv } = useMeshEnv();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [portfolioAvailable, setPortfolioAvailable] = useState(false)
    const [portfolio, setPortfolio] = useState({
        content: {
            portfolioCostBasis: 0,
            actualPortfolioPerformance: 0,
            cryptocurrenciesValue: 0,
            cryptocurrencyPositions: []
        }
    });

    let { portfolioCostBasis, actualPortfolioPerformance, cryptocurrenciesValue, cryptocurrencyPositions } = portfolio

    useEffect(() => {
        if (userId) {
            fetchPortfolio();
        } else {
            setIsLoading(false);
        }
    }, [userId, meshEnv]);

    const fetchPortfolio = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/v1/holdings/portfolio/${userId}?env=${meshEnv}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to fetch portfolio');
            }
            const data = await response.json();
            if (data.content.cryptocurrenciesValue !== 0) {
                setPortfolioAvailable(true)
            }
            setPortfolio(data.content);
            console.log("returned portfolio data", data)
            setError(null);
        } catch (err) {
            console.error('Error fetching portfolio:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!portfolioAvailable ?
            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                color: '#666',
                marginBottom:'10px'
            }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Portfolio stats are supposed to show here. If this is not the case you either did not perform a payment or deposit yet or there was a problem connecting your portfolio.<br></br>
                    <strong>Note:</strong> Portfolio data is fetched in real-time from your connected accounts.
                        If you've just completed a transaction, it may take a few moments to appear.
                </p>
                <button
                    onClick={fetchPortfolio}
                    disabled={isLoading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#00c281',
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
            :
            <div>
                <strong>Portfolio Stats</strong>
                <div style={{
                    border: '1px solid #ddd',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    backgroundColor: '#fff'
                }}>
                    <div>Portfolio Cost Basis: {portfolioCostBasis ? portfolioCostBasis.toFixed(2) : 0}</div>
                    <div>Actual Portfolio Performance: {actualPortfolioPerformance ? actualPortfolioPerformance.toFixed(2) : 0}</div>
                    <div>Crypto Currencies Value: {cryptocurrenciesValue ? cryptocurrenciesValue.toFixed(2) : 0}</div>
                </div>
                <div>
                    <strong>Portfolio Assets</strong>
                    {cryptocurrencyPositions?.map((coin, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '10px',
                            backgroundColor: '#fff'
                        }}>
                            <strong>{coin.name} ({coin.symbol})</strong>
                            <div>Amount: {coin.amount}</div>
                            <div>Market Value: ${fmt(coin.marketValue)}</div>
                            <div>Cost Basis: ${fmt(coin.costBasis)}</div>
                            <div>Return: ${fmt(coin.totalReturn)}</div>
                            <div>Return %: {fmt(coin.returnPercentage)}%</div>
                            <div>Portfolio %: {fmt(coin.portfolioPercentage, 4)}%</div>
                            <div>Last Price: ${fmt(coin.lastPrice, 4)}</div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={fetchPortfolio}
                    disabled={isLoading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#00c281',
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
            </div>}
            <MeshSDK userId={userId} transferType={"deposit"} />

        </div>
    )
}

export default Portfolio