import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Wallet, LogOut, LayoutDashboard, Send, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Wallet size={28} />
          <span>PayZapp</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/send-money" className="nav-link">
                <Send size={18} /> Send Money
              </Link>
              <Link to="/statement" className="nav-link">
                <FileText size={18} /> Statement
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn-primary-small">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
