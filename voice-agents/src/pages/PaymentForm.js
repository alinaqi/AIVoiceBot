// src/pages/PaymentForm.js
import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Box, Button, CircularProgress } from '@mui/material';

const PaymentForm = ({ clientSecret, onPaymentSuccess, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      console.error('Payment failed:', result.error);
      setLoading(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <CardElement />
      </Box>
      <Button type="submit" variant="contained" color="primary" disabled={!stripe || loading}>
        {loading ? <CircularProgress size={24} /> : 'Pay'}
      </Button>
    </form>
  );
};

export default PaymentForm;
