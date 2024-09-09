import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const MessageBar = ({ hideMessage }) => {
  if (hideMessage) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#f0f4f8', py: 2, textAlign: 'center' }}>
      <Typography variant="body1">
        Set up a support number <Link component={RouterLink} to="/support-numbers" sx={{ textDecoration: 'underline', color: '#262d3a' }}>here</Link>
      </Typography>
    </Box>
  );
};

export default MessageBar;
