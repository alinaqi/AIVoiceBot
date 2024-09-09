import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#262d3a',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f0f0f0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
