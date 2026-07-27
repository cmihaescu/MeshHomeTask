import React, { useState, useEffect } from 'react';
import Portfolio from './Portfolio';
import { ButtonLink } from './ui/Button';

const Account = () => {
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      console.log('user Id set from account page');
      localStorage.setItem('userId', id);
    }
    return id;
  });
  const [meshTokens, setMeshTokens] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('meshAccessToken') && localStorage.getItem('meshRefreshToken'))
      setMeshTokens({
        accessToken: localStorage.getItem('meshAccessToken'),
        refreshToken: localStorage.getItem('meshRefreshToken'),
      });
  }, [userId]);

  return (
    <div className="container">
      <div className="page-head">
        <h1>Account</h1>
        <ButtonLink to="/" variant="secondary">
          Back to shop
        </ButtonLink>
      </div>

      <section className="panel" aria-label="Shopper identity" style={{ marginTop: 0 }}>
        <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
          User ID
        </p>
        <p className="meta-line">{userId}</p>
        <p className="panel__sub" style={{ marginTop: '0.6rem', marginBottom: 0 }}>
          Wallet addresses added for this user are applied automatically when payment
          links are generated.
        </p>
      </section>

      <Portfolio userId={userId} />

      <section className="panel" aria-label="Mesh Connect tokens">
        <h2 className="panel__title">Mesh Connect tokens</h2>
        {meshTokens ? (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.75rem' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                Access token
              </p>
              <p className="token-block">{meshTokens.accessToken}</p>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                Refresh token
              </p>
              <p className="token-block">{meshTokens.refreshToken}</p>
            </div>
            {meshTokens.updatedAt ? (
              <p className="meta-line">last updated {new Date(meshTokens.updatedAt).toLocaleString()}</p>
            ) : null}
          </div>
        ) : (
          <p className="panel__sub" style={{ marginBottom: 0 }}>
            No Mesh Connect tokens yet. Complete a payment to connect your wallet and
            generate tokens.
          </p>
        )}
      </section>
    </div>
  );
};

export default Account;
