import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, CircularProgress, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';

const OnboardingPage = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCases, setUseCases] = useState({
    support: false,
    sales: false,
    feedback: false,
  });
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAuth();

  const handleTestCall = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      await axios.post(`${API_BASE_URL}/call/make_example_call`, {
        user_id: userId,
        business_name: businessName,
        business_description: businessDescription,
        industry,
        use_cases: useCases,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Save business information in the user profile
      if (setUserProfile) {
        const updatedUserProfile = { 
          ...userProfile, 
          userBusinessInfo: { 
            business_name: businessName, 
            description: businessDescription, 
            industry 
          },
          useCases: useCases,
        };
        setUserProfile(updatedUserProfile);
      }
      
      // Redirect to rating page
      navigate('/rate-call');
    } catch (error) {
      console.error('Error making test call:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCaseChange = (event) => {
    setUseCases({ ...useCases, [event.target.name]: event.target.checked });
  };

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Welcome to WorkHub Voice Agents</Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>Tell us about your business, and we will perform a quick test call with your new AI agent.</Typography>
        <TextField
          label="Business Name"
          fullWidth
          sx={{ mb: 3, backgroundColor: 'white' }}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <TextField
          label="Business Services Description"
          fullWidth
          sx={{ mb: 3, backgroundColor: 'white' }}
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          multiline
          rows={4}
          helperText="Describe the services your business provides."
        />
        <TextField
          label="Industry Category"
          fullWidth
          sx={{ mb: 3, backgroundColor: 'white' }}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          helperText="What industry does your business belong to?"
        />
        <Typography variant="h6" sx={{ mb: 2 }}>Select Use Cases for Your AI Agent</Typography>
        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={useCases.support} onChange={handleUseCaseChange} name="support" />}
            label="Handle Customer Support Calls"
          />
          <FormControlLabel
            control={<Checkbox checked={useCases.sales} onChange={handleUseCaseChange} name="sales" />}
            label="Manage Sales Inquiries"
          />
          <FormControlLabel
            control={<Checkbox checked={useCases.feedback} onChange={handleUseCaseChange} name="feedback" />}
            label="Collect Customer Feedback"
          />
        </FormGroup>
        <Box sx={{ mb: 8 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTestCall}
            disabled={loading}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                Please wait while your AI Agent is born. Don't worry it won't take 9 months! ;)
              </>
            ) : (
              'Get a test call'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OnboardingPage;
