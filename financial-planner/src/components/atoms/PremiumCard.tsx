import React from 'react';
import { Card, CardProps } from '@mui/material';
import { colors, shadows, transitions } from '../../design-tokens';

interface PremiumCardProps extends Omit<CardProps, 'elevation'> {
  hover?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  hover = true,
  elevation = 'sm',
  children,
  sx,
  ...props
}) => {
  const elevationMap = {
    none: shadows.none,
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
  };

  return (
    <Card
      {...props}
      elevation={0}
      sx={{
        borderRadius: '20px',
        boxShadow: elevationMap[elevation],
        border: `1px solid ${colors.neutral[200]}`,
        backgroundColor: '#FFFFFF',
        transition: hover ? `all ${transitions.base}` : 'none',
        ...(hover && {
          '&:hover': {
            boxShadow: shadows.lg,
            transform: 'translateY(-2px)',
            borderColor: colors.primary[200],
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

export default PremiumCard;

