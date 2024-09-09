// src/Layout.js

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import MessageBar from './components/MessageBar';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide the message bar on the SupportNumbersPage or if the user is not authenticated
  const hideMessage = location.pathname === '/support-numbers' || !isAuthenticated;

  useEffect(() => {
    // Add support widget script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = 'https://voiceagents.workhub.ai/widget.js';

    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.text = "addWidget('3GNfEKInw4ILYj04thPtV7', 'https://voiceagents.workhub.ai')";

    document.body.appendChild(script1);
    document.body.appendChild(script2);

    // Clean up the script elements on component unmount
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      {!hideMessage && <MessageBar />}
      <div style={{ flex: '1' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
