import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { colors, transitions } from '../../design-tokens';

interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  sx,
  ...props
}) => {
  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
      color: '#FFFFFF',
      '&:hover': {
        background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)',
        transform: 'translateY(-1px) scale(1.01)',
      },
    },
    secondary: {
      borderWidth: 1.5,
      borderColor: colors.neutral[200],
      color: colors.neutral[700],
      backgroundColor: 'transparent',
      '&:hover': {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
        transform: 'translateY(-1px)',
      },
    },
    ghost: {
      color: colors.neutral[700],
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.neutral[100],
      },
    },
    danger: {
      color: colors.error[500],
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.error[50],
      },
    },
  };

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      sx={{
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        transition: transitions.base,
        ...variantStyles[variant],
        ...sx,
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default PremiumButton;

