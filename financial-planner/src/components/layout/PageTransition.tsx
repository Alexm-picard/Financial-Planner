import React from 'react';
import { Box } from '@mui/material';
import { transitions } from '../../design-tokens';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Page Transition Wrapper
 * Provides smooth fade-in animation for page content
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <Box
      sx={{
        animation: 'fadeIn 300ms ease-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;

