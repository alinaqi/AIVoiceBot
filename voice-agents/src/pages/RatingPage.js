import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';

const RatingPage = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleSubmitFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      await axios.post(`${API_BASE_URL}/feedback/submit`, {
        user_id: userId,
        rating,
        feedback,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSubmitFeedbackAndNavigate = async () => {
    await handleSubmitFeedback();
    navigate('/');
  };

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>You are almost done!</Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>Rate your call</Typography>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                cursor: 'pointer',
                color: star <= (hoverRating || rating) ? 'gold' : 'gray',
                fontSize: '4rem'
              }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <TextField
          label="How was your experience? Any improvements you’d like?"
          multiline
          rows={4}
          sx={{ mt: 3, mb: 3, backgroundColor: 'white', width: '50%' }}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, width: '50%' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitFeedback}
            sx={{ flexGrow: 1 }}
          >
            Submit feedback only
          </Button>
          <Button
            variant="contained"
            sx={{ flexGrow: 1, backgroundColor: '#1976d2', color: 'white' }}
            onClick={handleSubmitFeedbackAndNavigate}
          >
            Go to your account
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RatingPage;
