import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/validate_token', { token });
      if (response.data.valid) {
        setIsAuthenticated(true);
        fetchUserProfile(); // Fetch user profile after validating token
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error validating token', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(`http://localhost:8000/auth/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile', error);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    fetchUserProfile(); // Fetch user profile after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, setUserProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
