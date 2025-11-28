import React from 'react';
import { Box, Container } from '@mui/material';
import { colors } from '../../design-tokens';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  customMaxWidth?: string;
  sx?: any;
}

/**
 * Premium Page Container
 * Provides consistent spacing and max-width constraints
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
  customMaxWidth,
  sx,
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        maxWidth: customMaxWidth || (maxWidth === 'xl' ? '1400px !important' : undefined),
        px: { xs: 3, sm: 4, md: 6 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
};

export default PageContainer;

