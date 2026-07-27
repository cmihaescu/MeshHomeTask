import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Portfolio from './Portfolio';
import { ButtonLink } from './ui/Button';

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [userId] = useState(() => localStorage.getItem('userId'));

  return (
    <div className="container">
      <div className="confirm-head">
        <div className="confirm-head__badge" aria-hidden="true">
          ✓
        </div>
        <h1>Payment successful</h1>
        {orderId ? (
          <p className="order-id">order {orderId}</p>
        ) : null}
        <p>Thank you for your purchase. Your payment has been processed.</p>
      </div>

      <Portfolio userId={userId} />

      <div className="confirm-actions">
        <ButtonLink to="/">Continue shopping</ButtonLink>
        <ButtonLink to="/account" variant="secondary">
          Manage account
        </ButtonLink>
      </div>
    </div>
  );
};

export default Confirmation;
