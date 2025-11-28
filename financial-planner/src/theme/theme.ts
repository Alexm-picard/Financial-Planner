import { createTheme } from '@mui/material/styles';
import { colors, spacing, borderRadius, shadows, typography, transitions } from '../design-tokens';

// Premium Design System
// "Financial Confidence Through Clarity"
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.primary[700],
      light: colors.primary[600],
      dark: colors.primary[800],
      contrastText: '#FFFFFF',
    },
    success: {
      main: colors.success[500],
      light: colors.success[50],
      dark: colors.success[600],
    },
    error: {
      main: colors.error[500],
      light: colors.error[50],
      dark: colors.error[600],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[50],
      dark: colors.warning[600],
    },
    info: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
    },
    background: {
      default: colors.neutral[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[500],
    },
    grey: {
      50: colors.neutral[50],
      100: colors.neutral[100],
      200: colors.neutral[200],
      300: colors.neutral[300],
      400: colors.neutral[400],
      500: colors.neutral[500],
      600: colors.neutral[600],
      700: colors.neutral[700],
      800: colors.neutral[800],
      900: colors.neutral[900],
    },
    divider: colors.neutral[200],
  },
  typography: {
    fontFamily: typography.fontFamily.sans,
    h1: {
      fontSize: typography.scale.h1.fontSize,
      fontWeight: typography.scale.h1.fontWeight,
      lineHeight: typography.scale.h1.lineHeight,
      letterSpacing: typography.scale.h1.letterSpacing,
      color: colors.neutral[900],
    },
    h2: {
      fontSize: typography.scale.h2.fontSize,
      fontWeight: typography.scale.h2.fontWeight,
      lineHeight: typography.scale.h2.lineHeight,
      letterSpacing: typography.scale.h2.letterSpacing,
      color: colors.neutral[900],
    },
    h3: {
      fontSize: typography.scale.h3.fontSize,
      fontWeight: typography.scale.h3.fontWeight,
      lineHeight: typography.scale.h3.lineHeight,
      color: colors.neutral[900],
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: colors.neutral[900],
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.neutral[900],
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: colors.neutral[900],
    },
    body1: {
      fontSize: typography.scale.body.fontSize,
      lineHeight: typography.scale.body.lineHeight,
      fontWeight: typography.scale.body.fontWeight,
      color: colors.neutral[700],
    },
    body2: {
      fontSize: typography.scale.bodySm.fontSize,
      lineHeight: typography.scale.bodySm.lineHeight,
      fontWeight: typography.scale.bodySm.fontWeight,
      color: colors.neutral[500],
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: typography.scale.bodyLg.fontSize,
      lineHeight: typography.scale.bodyLg.lineHeight,
      fontWeight: typography.scale.bodyLg.fontWeight,
      color: colors.neutral[500],
    },
    subtitle2: {
      fontSize: typography.scale.bodySm.fontSize,
      lineHeight: typography.scale.bodySm.lineHeight,
      fontWeight: typography.scale.bodySm.fontWeight,
      color: colors.neutral[400],
    },
    caption: {
      fontSize: typography.scale.caption.fontSize,
      lineHeight: typography.scale.caption.lineHeight,
      fontWeight: typography.scale.caption.fontWeight,
      letterSpacing: typography.scale.caption.letterSpacing,
      color: colors.neutral[400],
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    shadows.xs,
    shadows.sm,
    shadows.sm,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          padding: `${spacing[3]} ${spacing[6]}`,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: transitions.base,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          color: '#FFFFFF',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            boxShadow: shadows.lg,
            transform: 'translateY(-1px) scale(1.01)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.99)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: colors.neutral[200],
          color: colors.neutral[700],
          '&:hover': {
            borderWidth: 1.5,
            borderColor: colors.primary[500],
            backgroundColor: colors.primary[50],
            transform: 'translateY(-1px)',
          },
        },
        text: {
          color: colors.neutral[700],
          '&:hover': {
            backgroundColor: colors.primary[50],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.sm,
          border: `1px solid ${colors.neutral[200]}`,
          backgroundColor: '#FFFFFF',
          transition: `all ${transitions.base}`,
          '&:hover': {
            boxShadow: shadows.lg,
            transform: 'translateY(-2px)',
            borderColor: colors.primary[200],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.lg,
            backgroundColor: colors.neutral[50],
            transition: transitions.base,
            '& fieldset': {
              borderColor: colors.neutral[200],
              borderWidth: 1.5,
            },
            '&:hover': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: colors.neutral[300],
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: colors.primary[500],
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
          boxShadow: shadows.xs,
          backgroundColor: '#FFFFFF',
          color: colors.neutral[900],
          borderBottom: `1px solid ${colors.neutral[200]}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colors.neutral[200]}`,
          backgroundColor: '#FFFFFF',
        },
      },
    } as any,
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          fontWeight: 500,
          fontSize: typography.scale.caption.fontSize,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.xl,
        },
      },
    },
  },
});

export default theme;
