import React, { useState } from 'react';
import { AppBar, Toolbar, Menu, MenuItem, IconButton, Box, Typography, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function TopBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const isDesktop = useMediaQuery('(min-width:600px)');
  const isLargeScreen = useMediaQuery('(min-width:960px)'); // Additional breakpoint for larger screens

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', color: '#262d3a' }}>
      <Toolbar>
        <img src="/workhub-logo.webp" alt="Logo" style={{ marginRight: 16, height: 40 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            fontSize: isLargeScreen ? '1.2rem' : '1rem', // Adjust font size based on screen size
            marginLeft: isLargeScreen ? '6px' : '4px', // Adjust margin based on screen size
          }}
        >
          | Voice Agents
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {isAuthenticated && (
          <>
            {isDesktop ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component={Link} to="/dashboard" sx={{ color: 'inherit', textDecoration: 'none', mx: 2 }}>
                  Dashboard
                </Typography>
                <Typography component={Link} to="/support-numbers" sx={{ color: 'inherit', textDecoration: 'none', mx: 2 }}>
                  Support Numbers
                </Typography>
                <Typography component={Link} to="/account" sx={{ color: 'inherit', textDecoration: 'none', mx: 2 }}>
                  My Account
                </Typography>
                <Typography onClick={handleLogout} sx={{ cursor: 'pointer', mx: 2 }}>
                  Logout
                </Typography>
              </Box>
            ) : (
              <>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose} component={Link} to="/dashboard">Dashboard</MenuItem>
                  <MenuItem onClick={handleMenuClose} component={Link} to="/support-numbers">Support Numbers</MenuItem>
                  <MenuItem onClick={handleMenuClose} component={Link} to="/account">My Account</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
