import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';

const predefinedUseCases = [
  { name: 'support', description: 'Handle incoming customer support.' },
  { name: 'sales', description: 'Handle incoming sales.' },
  { name: 'technical support', description: 'Provide technical support for products or services.' },
  { name: 'appointment scheduling', description: 'Schedule appointments with customers or clients.' },
  { name: 'order inquiries', description: 'Handle inquiries about orders and deliveries.' },
  { name: 'feedback collection', description: 'Collect feedback from customers.' },
  { name: 'billing support', description: 'Assist with billing and payment issues.' },
  { name: 'general inquiry', description: 'Handle general inquiries about the business.' },
];

function UseCasesPage() {
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      loadUserUseCases();
    }
  }, [isAuthenticated, navigate]);

  const loadUserUseCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userUseCases = response.data.useCases ? JSON.parse(response.data.useCases.replace(/'/g, '"')) : {};
      const selected = predefinedUseCases.filter(useCase => userUseCases[useCase.name]);
      setSelectedUseCases(selected);
    } catch (error) {
      console.error('Error loading user use cases:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (useCase) => () => {
    const currentIndex = selectedUseCases.indexOf(useCase);
    const newChecked = [...selectedUseCases];

    if (currentIndex === -1) {
      newChecked.push(useCase);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedUseCases(newChecked);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    try {
      await axios.put(`${API_BASE_URL}/auth/user/update`, {
        user_id: userId,
        use_cases: selectedUseCases.reduce((acc, useCase) => {
          acc[useCase.name] = useCase.description;
          return acc;
        }, {})
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/account');
    } catch (error) {
      console.error('Error saving use cases:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Select Use Cases</Typography>
        <List>
          {predefinedUseCases.map((useCase) => (
            <ListItem key={useCase.name} button onClick={handleToggle(useCase)}>
              <ListItemText primary={useCase.name} secondary={useCase.description} />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  onChange={handleToggle(useCase)}
                  checked={selectedUseCases.indexOf(useCase) !== -1}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mb: 5 }}>
          Save Use Cases
        </Button>
      </Box>
    </Container>
  );
}

export default UseCasesPage;
