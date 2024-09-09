// src/App.js

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import SupportNumbersPage from './pages/SupportNumbersPage';
import AccountPage from './pages/AccountPage';
import Logout from './pages/Logout'; 
import SuccessPage from './pages/SuccessPage';
import LandingPage from './pages/LandingPage';
import RatingPage from './pages/RatingPage';
import Layout from './Layout';
import TestCall from './pages/TestCall';

const PrivateRoute = ({ element, ...rest }) => {
  const { isAuthenticated, loading, userProfile } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    userProfile && userProfile.userBusinessInfo ? (
      <Route {...rest} element={element} />
    ) : (
      <Navigate to="/onboarding" />
    )
  ) : (
    <Navigate to="/" />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rate-call" element={<RatingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/support-numbers" element={<SupportNumbersPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/test-call" element={<TestCall />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
