// src/components/Footer.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, mt: 'auto' }}>
      <Typography variant="body2" align="center">
        (c) 2024 WorkHub Platform Inc | 1875 S. Bascom Ave, Suite 2400 | Campbell, CA 95008 | USA |
        <Link href="https://workhub.ai/privacy-policy/" color="inherit" sx={{ mx: 1 }}>
          Privacy policy
        </Link>
        <Link href="https://workhub.ai/terms-and-conditions/" color="inherit" sx={{ mx: 1 }}>
          Terms and conditions
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer;
