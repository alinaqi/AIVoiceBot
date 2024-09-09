import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, CircularProgress, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

function AccountPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;

        const parseJSON = (str) => {
          try {
            return JSON.parse(str.replace(/'/g, '"'));
          } catch (error) {
            console.error('JSON parse error:', error, 'with string:', str);
            return null;
          }
        };

        data.userBusinessInfo = parseJSON(data.userBusinessInfo);
        data.useCases = parseJSON(data.useCases);
        data.voiceAgents = parseJSON(data.voiceAgents);

        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, navigate, logout]);

  const handleMakeTestCall = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const response = await axios.post(`${API_BASE_URL}/call/make_example_call`, {
        user_id: userId,
        business_name: userProfile.userBusinessInfo.business_name,
        business_description: userProfile.userBusinessInfo.description,
        industry: userProfile.userBusinessInfo.industry,
        use_cases: userProfile.useCases,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Test call response:', response.data);
      setSnackbarMessage('The call is successfully queued. You will receive it in a bit.');
      setSnackbarOpen(true);
      setRatingDialogOpen(true);
    } catch (error) {
      console.error('Error making test call:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
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
      setRatingDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const updatedBusinessInfo = {
        business_name: userProfile.userBusinessInfo.business_name,
        industry: userProfile.userBusinessInfo.industry,
        description: userProfile.userBusinessInfo.description,
      };

      await axios.put(`${API_BASE_URL}/auth/user/update`, {
        user_id: userId,
        user_business_info: updatedBusinessInfo,
        use_cases: userProfile.useCases,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEditMode(false);
      setSnackbarMessage('Business information saved successfully.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating business information:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <Typography>Loading...</Typography>;
  }

  const businessInfo = userProfile.userBusinessInfo || {};
  const useCases = userProfile.useCases || {};

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      userBusinessInfo: {
        ...prevProfile.userBusinessInfo,
        [name]: value,
      },
    }));
  };

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>My Account</Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Business Name"
            name="business_name"
            value={businessInfo.business_name || ''}
            fullWidth
            disabled={!editMode}
            onChange={handleChange}
            InputProps={{
              style: {
                backgroundColor: 'white',
              },
            }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Industry"
            name="industry"
            value={businessInfo.industry || ''}
            fullWidth
            disabled={!editMode}
            onChange={handleChange}
            InputProps={{
              style: {
                backgroundColor: 'white',
              },
            }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Business Description"
            name="description"
            value={businessInfo.description || ''}
            fullWidth
            disabled={!editMode}
            onChange={handleChange}
            multiline
            rows={4}
            InputProps={{
              style: {
                backgroundColor: 'white',
              },
            }}
          />
        </Box>
        
        {editMode ? (
          <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        ) : (
          <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={handleEdit}>
            Edit Business Information
          </Button>
        )}
        <Button variant="contained" color="secondary" onClick={handleMakeTestCall} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Make Test Call'}
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate your call</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>How would you rate your call experience?</Typography>
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
              label="Any feedback or suggestions?"
              multiline
              rows={4}
              sx={{ mt: 3, mb: 3, backgroundColor: 'white', width: '100%' }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleRatingSubmit} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AccountPage;
