/**
 * Premium Design Tokens
 * Systematic design system following 8px base grid and refined color palette
 */

export const colors = {
  // Primary - Trust & Action
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand
    600: '#4F46E5', // Hover states
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Neutrals - Foundation
  neutral: {
    50: '#FAFBFC',   // Page background
    100: '#F5F7FA',  // Card background
    200: '#E5E9F0',  // Borders
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',  // Body text
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',  // Headings
  },

  // Success - Savings/Positive
  success: {
    50: '#ECFDF5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    500: '#10B981',  // Main
    600: '#059669',  // Hover
    700: '#047857',
  },

  // Error - Debt/Negative
  error: {
    50: '#FEF2F2',
    200: '#FECACA',
    300: '#FCA5A5',
    500: '#EF4444',  // Main
    600: '#DC2626',  // Hover
    700: '#B91C1C',
  },

  // Warning - Attention
  warning: {
    50: '#FFFBEB',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'].join(','),
    mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'].join(','),
  },
  scale: {
    display: {
      fontSize: '3.75rem',    // 60px
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
    },
    h1: {
      fontSize: '2.25rem',    // 36px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.875rem',   // 30px
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',     // 24px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    bodyLg: {
      fontSize: '1.125rem',   // 18px
      fontWeight: 400,
      lineHeight: 1.7,
    },
    body: {
      fontSize: '1rem',       // 16px
      fontWeight: 400,
      lineHeight: 1.6,
    },
    bodySm: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

