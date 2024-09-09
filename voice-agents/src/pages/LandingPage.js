import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, Typography, CircularProgress, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import API_BASE_URL from '../config';
import 'react-phone-input-2/lib/style.css'; 

function LandingPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const inputRefs = useRef([]);

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data;
          const userBusinessInfo = data.userBusinessInfo;
          console.log('User profile:', data);
          console.log('User business info:', userBusinessInfo);
          if (userBusinessInfo !== null && Object.keys(userBusinessInfo).length > 0) {
            console.log('User profile already exists:', Object.keys(data.userBusinessInfo).length);
            navigate('/account');
          } else {
            navigate('/onboarding');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      fetchUserProfile();
    }
  }, [isAuthenticated, navigate]);

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
      navigate('/onboarding');
    } catch (error) {
      console.error('Error during SMS code verification', error);
      setLoading(false);
      setErrorMessage('Please check again and add the correct six digits');
    }
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

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
      <Box sx={{ mt: 10, textAlign: 'left' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Get started...</Typography>
        {!isCodeSent ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputStyle={{ width: '300px', height: '40px', fontSize: '16px', paddingLeft: '65px', backgroundColor: 'white' }}
                buttonStyle={{ width: '58px', height: '40px', left: '0px', top: '0px' }}
                containerStyle={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                dropdownStyle={{ width: 'auto' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitPhoneNumber}
                disabled={loading}
                sx={{ mt: 2, width: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register / Login'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              {smsCode.map((digit, index) => (
                <TextField
                  key={index}
                  value={digit}
                  onChange={(e) => handleCodeChange(e, index)}
                  onKeyDown={(e) => handleKeyPress(e, index)}
                  inputRef={(el) => inputRefs.current[index] = el}
                  inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                  sx={{ width: '40px', height: '40px', backgroundColor: 'white' }}
                />
              ))}
            </Box>
            {errorMessage && <Typography color="error">{errorMessage}</Typography>}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmitCode(smsCode.join(''))}
              disabled={loading}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '300px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Code'}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}

export default LandingPage;
