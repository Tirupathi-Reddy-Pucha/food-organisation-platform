import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // 1. Get user data from Local Storage
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Refresh to update UI
  };

  return (
    <nav style={{ padding: '10px', background: '#eee', display: 'flex', gap: '20px' }}>
      <Link to="/">Home</Link>
      
      {/* 2. LOGIC: Only show "Donate" if user exists AND is a Donor */}
      {user && user.role === 'Donor' && (
        <Link to="/donate" style={{ fontWeight: 'bold', color: 'green' }}>
          Donate Food
        </Link>
      )}

      {/* Show Login/Register if not logged in, otherwise show Logout */}
      {!user ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button onClick={handleLogout}>Logout ({user.name})</button>
      )}
    </nav>
  );
};

export default Navbar;