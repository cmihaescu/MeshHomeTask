import React, { useState, useEffect } from 'react';
import MeshSDK from './MeshSDK';
import { useMeshEnv } from '../contexts/MeshEnvContext';
import { Button } from './ui/Button';

// Safely format numeric fields — production portfolio positions may omit some.
const fmt = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : (0).toFixed(digits);

const Portfolio = ({ userId }) => {
  const { meshEnv, linkVersion } = useMeshEnv();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioAvailable, setPortfolioAvailable] = useState(false);
  const [portfolio, setPortfolio] = useState({
    content: {
      portfolioCostBasis: 0,
      actualPortfolioPerformance: 0,
      cryptocurrenciesValue: 0,
      cryptocurrencyPositions: [],
    },
  });

  let { portfolioCostBasis, actualPortfolioPerformance, cryptocurrenciesValue, cryptocurrencyPositions } = portfolio;

  useEffect(() => {
    if (userId) {
      fetchPortfolio();
    } else {
      setIsLoading(false);
    }
  }, [userId, meshEnv, linkVersion]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/holdings/portfolio/${userId}?env=${meshEnv}&linkVersion=${linkVersion}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch portfolio');
      }
      const data = await response.json();
      if (data.content.cryptocurrenciesValue !== 0) {
        setPortfolioAvailable(true);
      }
      setPortfolio(data.content);
      console.log('returned portfolio data', data);
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
      {!portfolioAvailable ? (
        <section className="panel" aria-label="Portfolio">
          <h2 className="panel__title">Portfolio</h2>
          <p className="panel__sub">
            Your portfolio shows here after a payment or deposit. Data is fetched in
            real time from your connected accounts — if you&rsquo;ve just completed a
            transaction, it may take a few moments to appear.
          </p>
          <Button variant="secondary" onClick={fetchPortfolio} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh portfolio'}
          </Button>
        </section>
      ) : (
        <section className="panel" aria-label="Portfolio">
          <h2 className="panel__title">Portfolio</h2>
          <div className="stat-row">
            <div className="stat">
              <div className="stat__label">Cost basis</div>
              <div className="stat__value">${portfolioCostBasis ? portfolioCostBasis.toFixed(2) : 0}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Performance</div>
              <div className="stat__value">{actualPortfolioPerformance ? actualPortfolioPerformance.toFixed(2) : 0}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Crypto value</div>
              <div className="stat__value">${cryptocurrenciesValue ? cryptocurrenciesValue.toFixed(2) : 0}</div>
            </div>
          </div>

          {cryptocurrencyPositions?.length ? (
            <div className="asset-table__wrap">
              <table className="asset-table">
                <caption>Positions</caption>
                <thead>
                  <tr>
                    <th scope="col">Asset</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Market value</th>
                    <th scope="col">Cost basis</th>
                    <th scope="col">Return</th>
                    <th scope="col">Return %</th>
                    <th scope="col">Portfolio %</th>
                    <th scope="col">Last price</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptocurrencyPositions.map((coin, index) => (
                    <tr key={index}>
                      <td>
                        {coin.name} ({coin.symbol})
                      </td>
                      <td>{coin.amount}</td>
                      <td>${fmt(coin.marketValue)}</td>
                      <td>${fmt(coin.costBasis)}</td>
                      <td>${fmt(coin.totalReturn)}</td>
                      <td>{fmt(coin.returnPercentage)}%</td>
                      <td>{fmt(coin.portfolioPercentage, 4)}%</td>
                      <td>${fmt(coin.lastPrice, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <Button variant="secondary" onClick={fetchPortfolio} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh portfolio'}
          </Button>
          <p className="panel__sub" style={{ marginTop: '0.9rem', marginBottom: 0 }}>
            Portfolio data is fetched in real time from your connected accounts. If
            you&rsquo;ve just completed a transaction, it may take a few moments to appear.
          </p>
        </section>
      )}
      {error ? <p className="meta-line" style={{ marginTop: '0.5rem' }}>portfolio: {error}</p> : null}

      <MeshSDK userId={userId} transferType={'deposit'} />
    </div>
  );
};

export default Portfolio;
