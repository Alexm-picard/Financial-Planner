import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { colors } from '../../design-tokens';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 10,
        px: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: `2px dashed ${colors.neutral[200]}`,
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 3,
          borderRadius: '16px',
          backgroundColor: colors.primary[50],
          color: colors.primary[500],
          mb: 3,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          color: colors.neutral[900],
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: colors.neutral[500],
          mb: 4,
          maxWidth: 400,
          mx: 'auto',
        }}
      >
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          sx={{
            minHeight: 52,
            px: 4,
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

