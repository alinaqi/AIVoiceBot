import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import API_BASE_URL from '../config';

const stripePromise = loadStripe('pk_live_51LPO6YC2V7EgrEqhMrqJIC1CltyPZpZ8AYYaysmY739Xhvp2Te6WiJNWgJM0LwpNRlplYYKWNG65cODSLqGwYy8000MtQiPRNU');

function SupportNumbersPage() {
  const [supportNumbers, setSupportNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [areaCode, setAreaCode] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentVoiceAgent, setCurrentVoiceAgent] = useState(null);
  const [hoveredNumber, setHoveredNumber] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [retryNumberSelection, setRetryNumberSelection] = useState(false);
  const [retryData, setRetryData] = useState({});
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const predefinedUseCases = [
    { name: 'customer support', description: 'Handle customer support' },
    { name: 'sales', description: 'Manage sales inquiries' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      loadSupportNumbers();
    }
  }, [isAuthenticated, navigate]);

  const loadSupportNumbers = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}/voice_agents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSupportNumbers(response.data.voice_agents);
    } catch (error) {
      console.error('Error loading support numbers:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNumbers = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/number/get_available_numbers`, {
        area_code: areaCode,
        country_code: countryCode,
      });
      setAvailableNumbers(response.data.phone_numbers || []); // Ensure it's an array
      setStep(2);
    } catch (error) {
      console.error('Error searching available numbers:', error);
    }
  };

  const handleCompletePurchaseRetry = async (selectedNumber) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      await axios.post(`${API_BASE_URL}/number_purchase/purchase_number`, {
        user_id: userId,
        area_code: retryData.areaCode,
        country_code: retryData.countryCode,
        phone_number: selectedNumber,
        prompt: 'Welcome to our support line. How can we assist you today?',
        use_cases: retryData.useCases,
      });

      setRetryNumberSelection(false);
      loadSupportNumbers();
    } catch (error) {
      console.error('Error completing purchase retry:', error);
    }
  };

  const handleRetryNumberSelection = (data) => {
    setRetryData(data);
    setRetryNumberSelection(true);
    setOpen(true);
    setStep(2);
  };

  const handleCreateCheckoutSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      const response = await axios.post(`${API_BASE_URL}/payment/create-checkout-session`, {
        user_id: userId,
        amount: 58800,
        area_code: areaCode,
        country_code: countryCode,
        phone_number: selectedNumber,
        use_cases: selectedUseCases,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });

      if (error) {
        console.error('Stripe error:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleTestCallWithPrompt = async (number) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      await axios.post(`${API_BASE_URL}/call/make_test_call_with_prompt`, {
        user_id: userId,
        number: number.number,
        prompt: number.prompt
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbarOpen(true);
      setRatingDialogOpen(true);
    } catch (error) {
      console.error('Error making test call with prompt:', error);
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setAvailableNumbers([]);
    setSelectedNumber('');
    setSelectedUseCases({});
  };

  const handleBack = () => {
    setStep(1);
    setAvailableNumbers([]);
    setSelectedNumber('');
    setSelectedUseCases({});
  };

  const handleEditClick = (voiceAgent) => {
    setCurrentVoiceAgent(voiceAgent);
    setSelectedUseCases(voiceAgent.use_cases || {});
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentVoiceAgent(null);
    setSelectedUseCases({});
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      await axios.put(`${API_BASE_URL}/auth/user/${userId}/voice_agent`, {
        voice_agent_id: currentVoiceAgent.voice_agent_id,
        number: currentVoiceAgent.number,
        prompt: currentVoiceAgent.prompt,
        use_cases: selectedUseCases
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadSupportNumbers();
      handleEditClose();
    } catch (error) {
      console.error('Error updating voice agent:', error);
    }
  };

  const handleUseCaseChange = (event) => {
    setSelectedUseCases({
      ...selectedUseCases,
      [event.target.name]: event.target.checked ? predefinedUseCases.find(useCase => useCase.name === event.target.name).description : undefined
    });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Support Numbers</Typography>
        {supportNumbers.length === 0 ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">You haven't purchased any support numbers yet.</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>Get started by purchasing your first support number. Pricing is $49 per month paid annually.</Typography>
            <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ mt: 3 }}>
              Buy New Support Number
            </Button>
          </Box>
        ) : (
          <>
            <List>
              {supportNumbers.map((number, index) => (
                <ListItem
                  key={index}
                  onMouseEnter={() => setHoveredNumber(index)}
                  onMouseLeave={() => setHoveredNumber(null)}
                  button
                  onClick={() => handleEditClick(number)}
                  sx={{ position: 'relative' }}
                >
                  <ListItemText
                    primary={`Number: ${number.number}`}
                    secondary={`Use Cases: ${Object.keys(number.use_cases || {}).map(key => key).join(', ')}`}
                  />
                  {hoveredNumber === index && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestCallWithPrompt(number);
                      }}
                      sx={{ position: 'absolute', right: 16 }}
                    >
                      Test
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ mt: 3 }}>
              Buy New Support Number
            </Button>
          </>
        )}
        <Dialog open={open} onClose={handleClose}>
          {step === 1 ? (
            <>
              <DialogTitle>Search Available Numbers</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Area Code"
                  fullWidth
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                />
                <FormControl fullWidth margin="dense">
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="CA">Canada</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleSearchNumbers} color="primary">
                  Search
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogTitle>Select a Number to Register</DialogTitle>
              <DialogContent>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Available Numbers</FormLabel>
                  <RadioGroup
                    aria-label="available-numbers"
                    name="available-numbers"
                    value={selectedNumber}
                    onChange={(e) => setSelectedNumber(e.target.value)}
                  >
                    {availableNumbers.map((number, index) => (
                      <FormControlLabel key={index} value={number.phone_number} control={<Radio />} label={`${number.friendly_name} - ${number.location}`} />
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormControl component="fieldset" sx={{ mt: 3 }}>
                  <FormLabel component="legend">Select Use Cases</FormLabel>
                  {predefinedUseCases.map((useCase) => (
                    <FormControlLabel
                      key={useCase.name}
                      control={
                        <Checkbox
                          checked={!!selectedUseCases[useCase.name]}
                          onChange={handleUseCaseChange}
                          name={useCase.name}
                        />
                      }
                      label={useCase.description}
                    />
                  ))}
                </FormControl>
                <Typography variant="body1" sx={{ mt: 3 }}>
                  $49 per month paid annually.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleBack} color="primary">
                  Back
                </Button>
                <Button
                  onClick={retryNumberSelection ? () => handleCompletePurchaseRetry(selectedNumber) : handleCreateCheckoutSession}
                  color="primary"
                  disabled={!selectedNumber}
                >
                  {retryNumberSelection ? 'Select Number' : 'Proceed to Payment'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Support Number</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="AI Agent Guideline"
              fullWidth
              multiline
              rows={4}
              value={currentVoiceAgent ? currentVoiceAgent.prompt : ''}
              onChange={(e) => setCurrentVoiceAgent({ ...currentVoiceAgent, prompt: e.target.value })}
            />
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">Select Use Cases</FormLabel>
              {predefinedUseCases.map((useCase) => (
                <FormControlLabel
                  key={useCase.name}
                  control={
                    <Checkbox
                      checked={!!selectedUseCases[useCase.name]}
                      onChange={handleUseCaseChange}
                      name={useCase.name}
                    />
                  }
                  label={useCase.description}
                />
              ))}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
          <DialogTitle>Rate Your Test Call</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 4 }}>How would you rate your call experience?</Typography>
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
            <Button onClick={() => setRatingDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleRatingSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Call has been successfully placed!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SupportNumbersPage;
