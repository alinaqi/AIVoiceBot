import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, CircularProgress, FormGroup, FormControlLabel, Checkbox, Tabs, Tab, Autocomplete } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import API_BASE_URL from '../config';

const industries = [
  'Agriculture',
  'Automotive',
  'Banking',
  'Construction',
  'Consulting',
  'Consumer Goods',
  'Education',
  'Energy',
  'Entertainment',
  'Financial Services',
  'Food & Beverage',
  'Government',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Manufacturing',
  'Media',
  'Nonprofit',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Technology',
  'Telecommunications',
  'Transportation',
  'Utilities',
];

const TestCall = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [useCases, setUseCases] = useState({
    support: true,
    sales: true,
    feedback: true,
  });
  const [outboundUseCases, setOutboundUseCases] = useState({
    bookAppointments: true,
    qualifyProspect: true,
  });
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem('phone_number');
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
      handleSubmitPhoneNumber(storedPhoneNumber);
    }
  }, []);

  const [languages, setLanguages] = useState({
    english: false,
    arabic: false,
    spanish: false,
  });
  
  const handleLanguageChange = (event) => {
    setLanguages({
      ...languages,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      if (userId && token) {
        handleTestCall(userId, token);
      }
    }
  }, [isAuthenticated]);

  const handlePhoneChange = (phone) => {
    setPhoneNumber('+' + phone); // Ensure the phone number has a + sign
  };

  const handleCodeChange = (e, index) => {
    const { value } = e.target;
    if (/^\d$/.test(value) || value === '') {
      const newCode = [...smsCode];
      newCode[index] = value;
      setSmsCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
      if (newCode.join('').length === 6) {
        handleSubmitCode(newCode.join(''));
      }
    }
  };

  const handleSubmitPhoneNumber = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { phone_number: phoneNumber });
      const { verification_sid } = response.data;
      setIsCodeSent(true);
      setLoading(false);
    } catch (error) {
      console.error('Error during registration/login', error);
      setLoading(false);
    }
  };

  const handleSubmitCode = async (code) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/complete_registration`, {
        phone_number: phoneNumber,
        code,
      });
      const { token, user_id } = response.data;
      login(token); // Assuming 'login' function sets the token in context or localStorage
      localStorage.setItem('user_id', user_id); // Save user_id to local storage
      localStorage.setItem('token', token); // Save token to local storage
      handleTestCall(user_id, token);
    } catch (error) {
      console.error('Error during SMS code verification', error);
      setLoading(false);
      setErrorMessage('Please check again and add the correct six digits');
    }
  };

  const handleTestCall = async (userId, token) => {
    setLoading(true);
    setProgressMessage('Setting up our AI agent...');
    try {
      const endpoint = selectedTab === 0 ? '/call/make_example_call' : '/call/make_example_sales_call';
      const data = {
        user_id: userId,
        business_name: businessName,
        business_description: businessDescription,
        industry,
        use_cases: selectedTab === 0 ? useCases : outboundUseCases,
      };
      await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProgressMessage('Giving instructions regarding your business...');

      setTimeout(() => {
        setProgressMessage('Triggering the call...');
      }, 2000);

      setTimeout(() => {
        setLoading(false);
        navigate('/rate-call');
      }, 5000);
    } catch (error) {
      console.error('Error making test call:', error);
      setLoading(false);
      setProgressMessage('Failed to set up AI agent. Please try again.');
    }
  };

  const handleUseCaseChange = (event) => {
    setUseCases({ ...useCases, [event.target.name]: event.target.checked });
  };

  const handleOutboundUseCaseChange = (event) => {
    setOutboundUseCases({ ...outboundUseCases, [event.target.name]: event.target.checked });
  };

  const handleKeyPress = (event, index) => {
    if (event.key === 'Enter') {
      if (!isCodeSent) {
        handleSubmitPhoneNumber();
      } else {
        handleSubmitCode(smsCode.join(''));
      }
    } else if (event.key === 'Backspace' && index > 0 && !smsCode[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAutoRetrieve = async () => {
    setRetrieving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/research`, { url });
      const data = JSON.parse(response.data);

      const businessDescriptionCombined = `Business Description: ${data.BusinessDescription}\n` +
        (data.KeyProducts ? `Key products: ${data.KeyProducts}\n` : '') +
        (data.KeyServices ? `Key services: ${data.KeyServices}` : '');

      setBusinessName(data.BusinessName);
      setBusinessDescription(businessDescriptionCombined);
      setIndustry(data.Industry);
    } catch (error) {
      console.error('Error during auto retrieve', error);
    }
    setRetrieving(false);
  };

  return (
    <Container>
      <Box sx={{ mt: 10 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Inbound" />
          <Tab label="Outbound" />
        </Tabs>
        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && (
            <>
              <TextField
                label="Business URL"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={retrieving}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAutoRetrieve}
                sx={{ mb: 3 }}
                disabled={retrieving}
              >
                {retrieving ? <CircularProgress size={24} /> : 'Auto Retrieve'}
              </Button>
              <TextField
                label="Your Business Name"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={retrieving}
              />
              <TextField
                label="Your Business Services Overview"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                multiline
                rows={4}
                helperText="Describe the services your business provides."
                disabled={retrieving}
              />
              <Autocomplete
                options={industries}
                value={industry}
                onChange={(event, newValue) => {
                  setIndustry(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Your Industry"
                    fullWidth
                    sx={{ mb: 3, backgroundColor: 'white' }}
                    helperText="What industry does your business belong to?"
                    disabled={retrieving}
                  />
                )}
              />
              <Typography variant="h6" sx={{ mb: 2 }}>Select Use Cases for Your AI Agent</Typography>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={useCases.support} onChange={handleUseCaseChange} name="support" />}
                  label="Handle Customer Support Calls"
                  disabled={retrieving}
                />
                <FormControlLabel
                  control={<Checkbox checked={useCases.sales} onChange={handleUseCaseChange} name="sales" />}
                  label="Manage Sales Inquiries"
                  disabled={retrieving}
                />
                <FormControlLabel
                  control={<Checkbox checked={useCases.feedback} onChange={handleUseCaseChange} name="feedback" />}
                  label="Collect Customer Feedback"
                  disabled={retrieving}
                />
              </FormGroup>
              <Typography variant="h6" sx={{ mb: 2 }}>Languages you would like to support</Typography>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={languages.english} onChange={handleLanguageChange} name="english" />}
                  label="English"
                  disabled={retrieving}
                />
                <FormControlLabel
                  control={<Checkbox checked={languages.arabic} onChange={handleLanguageChange} name="arabic" />}
                  label="Arabic"
                  disabled={retrieving}
                />
                <FormControlLabel
                  control={<Checkbox checked={languages.spanish} onChange={handleLanguageChange} name="spanish" />}
                  label="Spanish"
                  disabled={retrieving}
                />
              </FormGroup>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Since we do not have full information about the business, the AI agent will take creative liberty to make the call successful ;)
              </Typography>
            </>
          )}
          {selectedTab === 1 && (
            <>
              
              <TextField
                label="Business URL"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={retrieving}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAutoRetrieve}
                sx={{ mb: 3 }}
                disabled={retrieving}
              >
                {retrieving ? <CircularProgress size={24} /> : 'Auto Retrieve'}
              </Button>
              <TextField
                label="Your Business Name"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={retrieving}
              />
              <TextField
                label="Your Business Services Overview"
                fullWidth
                sx={{ mb: 3, backgroundColor: 'white' }}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                multiline
                rows={4}
                helperText="Describe the services your business provides."
                disabled={retrieving}
              />
              <Autocomplete
                options={industries}
                value={industry}
                onChange={(event, newValue) => {
                  setIndustry(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Your Industry"
                    fullWidth
                    sx={{ mb: 3, backgroundColor: 'white' }}
                    helperText="What industry does your business belong to?"
                    disabled={retrieving}
                  />
                )}
              />
              <Typography variant="h6" sx={{ mb: 2 }}>Select Outbound Use Cases for Your AI Agent</Typography>
              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox checked={outboundUseCases.bookAppointments} onChange={handleOutboundUseCaseChange} name="bookAppointments" />}
                  label="Book Appointments"
                  disabled={retrieving}
                />
                <FormControlLabel
                  control={<Checkbox checked={outboundUseCases.qualifyProspect} onChange={handleOutboundUseCaseChange} name="qualifyProspect" />}
                  label="Qualify Prospect"
                  disabled={retrieving}
                />
              </FormGroup>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Since we do not have full information about the business, the AI agent will take creative liberty to make the call successful ;)
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ mb: 8 }}>
          {!isCodeSent ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Your mobile number</Typography>
                <PhoneInput
                  country={'us'}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  inputStyle={{ width: '300px', height: '40px', fontSize: '16px', paddingLeft: '65px', backgroundColor: 'white' }}
                  buttonStyle={{ width: '58px', height: '40px', left: '0px', top: '0px' }}
                  containerStyle={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  dropdownStyle={{ width: 'auto' }}
                  disabled={retrieving}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitPhoneNumber}
                  disabled={loading}
                  sx={{ mt: 2, width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Validate your number'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Enter the 6-digit code you received as SMS</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                {smsCode.map((digit, index) => (
                  <TextField
                    key={index}
                    value={digit}
                    onChange={(e) => handleCodeChange(e, index)}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    inputRef={(el) => inputRefs.current[index] = el}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                    sx={{ width: '40px', height: '40px', backgroundColor: 'white', marginRight: '10px' }}
                    disabled={retrieving}
                  />
                ))}
              </Box>
              {errorMessage && <Typography color="error">{errorMessage}</Typography>}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubmitCode(smsCode.join(''))}
                  disabled={loading}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '300px' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Get a test call'}
                </Button>
                {progressMessage && (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {progressMessage}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TestCall;
