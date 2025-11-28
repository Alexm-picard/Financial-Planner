import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { colors } from '../../design-tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * Premium Page Header
 * Consistent title and subtitle pattern with optional action button
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <Box
      sx={{
        mb: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: subtitle ? 'flex-start' : 'center',
        flexWrap: 'wrap',
        gap: 3,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 280 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: subtitle ? 0.5 : 0,
            color: colors.neutral[900],
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.75rem', md: '2.25rem' },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.neutral[500],
              fontSize: { xs: '0.9375rem', md: '1.125rem' },
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          startIcon={action.icon}
          sx={{
            minHeight: 48,
            px: 4,
            alignSelf: subtitle ? 'flex-start' : 'center',
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;

