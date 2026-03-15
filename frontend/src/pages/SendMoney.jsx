import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send } from 'lucide-react';

const SendMoney = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount) {
      setError('Please fill all fields');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(
        'http://localhost:5000/api/account/transfer',
        { receiver_id: selectedUser, amount: Number(amount) },
        config
      );

      setSuccess('Transfer successful!');
      setAmount('');
      setSelectedUser('');
      
      // Navigate to statement after a short delay
      setTimeout(() => {
        navigate('/statement');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="send-money-container">
      <h2>Send Money <Send className="heading-icon" /></h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-card">
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label>Select Recipient</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Send ₹'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMoney;
