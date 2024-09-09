// src/pages/SuccessPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button, Box, Typography } from '@mui/material';
import API_BASE_URL from '../config';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const completePurchase = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          console.log('Fetching session details for session ID:', sessionId);

          // Fetch session details from Stripe
          const sessionResponse = await axios.get(`${API_BASE_URL}/payment/checkout-session/${sessionId}`);
          const sessionData = sessionResponse.data;

          console.log('Session data:', sessionData);

          // Extract necessary data from session
          const userId = sessionData.metadata.user_id;
          const areaCode = sessionData.metadata.area_code;
          const countryCode = sessionData.metadata.country_code;
          const selectedNumber = sessionData.metadata.phone_number;
          const useCases = JSON.parse(sessionData.metadata.use_cases);

          console.log('Completing purchase with the following data:', {
            user_id: userId,
            area_code: areaCode,
            country_code: countryCode,
            phone_number: selectedNumber,
            prompt: 'Welcome to our support line. How can we assist you today?',
            use_cases: useCases,
          });

          // Complete the purchase process
          const purchaseResponse = await axios.post(`${API_BASE_URL}/number_purchase/purchase_number`, {
            user_id: userId,
            area_code: areaCode,
            country_code: countryCode,
            phone_number: selectedNumber,
            prompt: 'Welcome to our support line. How can we assist you today?',
            use_cases: useCases,
          });
        
          console.log('Purchase response:', purchaseResponse.data);
          const { prompt, number } = purchaseResponse.data;

          const promptSettings = {
            phone_number: number,
            settings: {
              prompt: prompt,
              voice: 'Florian',
              record: true
            }
          };
          console.log('Setting prompt for the number:', prompt);
          // Set the prompt for the number
          await axios.post(`${API_BASE_URL}/inbound/set_prompt`, promptSettings);

          setIsRedirecting(true);

          // Redirect to support numbers
          setTimeout(() => {
            navigate('/support-numbers');
          }, 5000);
        } catch (error) {
          console.error('Error completing purchase:', error);
          // Handle error (e.g., show an error message)
        }
      }
    };

    completePurchase();
  }, [location.search, navigate]);

  const handleRedirect = () => {
    navigate('/support-numbers');
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h4">Payment Successful</Typography>
      <Typography variant="body1">Completing your purchase...</Typography>
      {isRedirecting && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">If you don't automatically redirect, click here:</Typography>
          <Button variant="contained" color="primary" onClick={handleRedirect}>
            Click here to proceed
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SuccessPage;
