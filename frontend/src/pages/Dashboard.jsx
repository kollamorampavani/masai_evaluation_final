import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Send, FileText } from 'lucide-react';

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/account/balance', config);
        setBalance(data.balance);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch balance. Please try again.');
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}</h1>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="balance-card">
          <div className="balance-info">
            <span className="balance-label">Current Balance</span>
            <span className="balance-amount">₹{Number(balance).toLocaleString()}</span>
          </div>
          <Wallet size={48} className="balance-icon" />
        </div>
      )}

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/send-money" className="action-card primary-action">
            <Send size={24} />
            <span>Send Money</span>
            <p>Transfer instantly</p>
          </Link>
          
          <Link to="/statement" className="action-card secondary-action">
            <FileText size={24} />
            <span>View Statement</span>
            <p>Recent transactions</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
