import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout(); // Clear the session
    navigate('/'); // Redirect to home page
  }, [logout, navigate]);

  return null; // No UI is needed for this component
};

export default Logout;
