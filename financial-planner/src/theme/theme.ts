import { createTheme } from '@mui/material/styles';

// Premium Design System
// Combining Rocket Money softness, Spotify boldness, Blinkist clarity, 
// Netflix contrast, Zoom professionalism, and Zara minimal luxury
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1', // Indigo - Premium, trustworthy
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6', // Purple - Modern, premium
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald - Clean, positive
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444', // Red - Clear, not aggressive
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#FAFBFC', // Ultra-light, premium gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A', // Deep, confident black
      secondary: '#64748B', // Soft, readable gray
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"SF Pro Display"',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
      color: '#0F172A',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.03em',
      color: '#0F172A',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#0F172A',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#334155',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748B',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      color: '#64748B',
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#94A3B8',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16, // Consistent premium rounding
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.04)',
    '0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -1px rgba(15, 23, 42, 0.04)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.12)',
    '0px 1px 3px rgba(15, 23, 42, 0.12), 0px 1px 2px rgba(15, 23, 42, 0.24)',
    '0px 3px 6px rgba(15, 23, 42, 0.15), 0px 2px 4px rgba(15, 23, 42, 0.12)',
    '0px 10px 20px rgba(15, 23, 42, 0.15), 0px 3px 6px rgba(15, 23, 42, 0.10)',
    '0px 15px 25px rgba(15, 23, 42, 0.15), 0px 5px 10px rgba(15, 23, 42, 0.05)',
    '0px 20px 40px rgba(15, 23, 42, 0.1)',
    '0px 25px 50px rgba(15, 23, 42, 0.12)',
    '0px 30px 60px rgba(15, 23, 42, 0.15)',
    '0px 35px 70px rgba(15, 23, 42, 0.18)',
    '0px 40px 80px rgba(15, 23, 42, 0.2)',
    '0px 45px 90px rgba(15, 23, 42, 0.22)',
    '0px 50px 100px rgba(15, 23, 42, 0.25)',
    '0px 55px 110px rgba(15, 23, 42, 0.28)',
    '0px 60px 120px rgba(15, 23, 42, 0.3)',
    '0px 65px 130px rgba(15, 23, 42, 0.32)',
    '0px 70px 140px rgba(15, 23, 42, 0.35)',
    '0px 75px 150px rgba(15, 23, 42, 0.38)',
    '0px 80px 160px rgba(15, 23, 42, 0.4)',
    '0px 85px 170px rgba(15, 23, 42, 0.42)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '14px 28px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            boxShadow: '0px 10px 15px -3px rgba(99, 102, 241, 0.3), 0px 4px 6px -2px rgba(99, 102, 241, 0.2)',
            transform: 'translateY(-1px) scale(1.01)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.99)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: '#E2E8F0',
          color: '#334155',
          '&:hover': {
            borderWidth: 1.5,
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
            transform: 'translateY(-1px)',
          },
        },
        text: {
          color: '#334155',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FAFBFC',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: 1.5,
            },
            '&:hover': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: '#CBD5E1',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: '#6366F1',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
