import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Statement = () => {
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/account/statement', config);
        
        // Calculate running balance (assuming initial balance is 10000)
        // Since backend data comes descending, we reverse it, calculate, and reverse back
        const reversed = [...data].reverse();
        let currentBalance = 10000;
        
        const statementsWithBalance = reversed.map(t => {
          if (t.type === 'Credit') {
            currentBalance += Number(t.amount);
          } else {
            currentBalance -= Number(t.amount);
          }
          return { ...t, runningBalance: currentBalance };
        }).reverse();
        
        setStatement(statementsWithBalance);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch transaction history.');
        setLoading(false);
      }
    };

    fetchStatement();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading statement...</div>;
  }

  return (
    <div className="statement-container">
      <h2>Account Statement</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {statement.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {statement.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} className="icon-xs" />
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.type.toLowerCase()}`}>
                      {t.type === 'Credit' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      {t.type}
                    </span>
                  </td>
                  <td className={t.type === 'Credit' ? 'text-credit' : 'text-debit'}>
                    ₹{Number(t.amount).toLocaleString()}
                  </td>
                  <td>{t.sender === user.name ? 'You' : t.sender}</td>
                  <td>{t.receiver === user.name ? 'You' : t.receiver}</td>
                  <td className="font-medium">
                    ₹{t.runningBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Statement;
