import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f6feb' },
    secondary: { main: '#0f766e' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
    error: { main: '#c2410c' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 40 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)' },
      },
    },
  },
});

