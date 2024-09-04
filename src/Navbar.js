import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/chatroom" className="navbar-link">Chatroom</Link>
      </div>
      <div className="navbar-right">
        {!user ? (
          <>
            <Link to="/register" className="navbar-link">Register</Link>
            <Link to="/login" className="navbar-link">Login</Link>
          </>
        ) : (
          <>
            <span className="navbar-link">Welcome, {user.username}</span>
            <button onClick={handleLogout} className="navbar-link navbar-button">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
