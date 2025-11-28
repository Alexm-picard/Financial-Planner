import { createTheme } from '@mui/material/styles';

// Professional Financial Institution Color Palette
// Inspired by JP Morgan Chase and other premium financial services
const theme = createTheme({
  palette: {
    primary: {
      main: '#0E4C92', // Deep Navy Blue - Trust & Stability
      light: '#1A6BC4',
      dark: '#0A3A6B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4AF37', // Gold - Premium & Wealth
      light: '#E5C866',
      dark: '#B8941F',
      contrastText: '#000000',
    },
    success: {
      main: '#2E7D32', // Professional Green
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#C62828', // Professional Red
      light: '#EF5350',
      dark: '#B71C1C',
    },
    warning: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#1565C0',
      light: '#42A5F5',
      dark: '#0D47A1',
    },
    background: {
      default: '#F5F7FA', // Light Gray Background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08)',
    '0px 2px 6px rgba(0, 0, 0, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.1)',
    '0px 6px 18px rgba(0, 0, 0, 0.12)',
    '0px 8px 24px rgba(0, 0, 0, 0.14)',
    '0px 10px 30px rgba(0, 0, 0, 0.16)',
    '0px 12px 36px rgba(0, 0, 0, 0.18)',
    '0px 14px 42px rgba(0, 0, 0, 0.2)',
    '0px 16px 48px rgba(0, 0, 0, 0.22)',
    '0px 18px 54px rgba(0, 0, 0, 0.24)',
    '0px 20px 60px rgba(0, 0, 0, 0.26)',
    '0px 22px 66px rgba(0, 0, 0, 0.28)',
    '0px 24px 72px rgba(0, 0, 0, 0.3)',
    '0px 26px 78px rgba(0, 0, 0, 0.32)',
    '0px 28px 84px rgba(0, 0, 0, 0.34)',
    '0px 30px 90px rgba(0, 0, 0, 0.36)',
    '0px 32px 96px rgba(0, 0, 0, 0.38)',
    '0px 34px 102px rgba(0, 0, 0, 0.4)',
    '0px 36px 108px rgba(0, 0, 0, 0.42)',
    '0px 38px 114px rgba(0, 0, 0, 0.44)',
    '0px 40px 120px rgba(0, 0, 0, 0.46)',
    '0px 42px 126px rgba(0, 0, 0, 0.48)',
    '0px 44px 132px rgba(0, 0, 0, 0.5)',
    '0px 46px 138px rgba(0, 0, 0, 0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
        },
        contained: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default theme;

