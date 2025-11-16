import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTransactions();
  }, [user, navigate]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="container">
      <div className="transactions-container">
        <h2>My Orders</h2>
        {transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-product">{transaction.productName}</div>
                  <div className="transaction-meta">
                    Quantity: {transaction.quantity} × ${transaction.pricePerUnit.toFixed(2)}
                  </div>
                  <div className="transaction-meta">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
                <div className="transaction-amount">
                  ${transaction.totalAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
