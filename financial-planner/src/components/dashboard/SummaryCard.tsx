import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { colors as designColors, shadows, transitions } from '../../design-tokens';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'error' | 'warning';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}) => {
  const theme = useTheme();

  const colorConfig = {
    primary: { 
      main: designColors.primary[500], 
      light: designColors.primary[400], 
      bg: `linear-gradient(135deg, ${designColors.primary[50]} 0%, rgba(139, 92, 246, 0.05) 100%)`,
      iconBg: designColors.primary[50],
    },
    success: { 
      main: designColors.success[500], 
      light: designColors.success[600], 
      bg: `linear-gradient(135deg, ${designColors.success[50]} 0%, rgba(16, 185, 129, 0.05) 100%)`,
      iconBg: designColors.success[50],
    },
    error: { 
      main: designColors.error[500], 
      light: designColors.error[600], 
      bg: `linear-gradient(135deg, ${designColors.error[50]} 0%, rgba(239, 68, 68, 0.05) 100%)`,
      iconBg: designColors.error[50],
    },
    warning: { 
      main: designColors.warning[500], 
      light: designColors.warning[600], 
      bg: `linear-gradient(135deg, ${designColors.warning[50]} 0%, rgba(245, 158, 11, 0.05) 100%)`,
      iconBg: designColors.warning[50],
    },
  };

  const colors = colorConfig[color];

  return (
    <Card
      sx={{
        height: '100%',
        background: colors.bg,
        border: `1px solid ${designColors.neutral[200]}`,
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: shadows.sm,
        transition: `all ${transitions.base}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
        },
        '&:hover': {
          boxShadow: shadows.lg,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              background: colors.iconBg,
              color: colors.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: transitions.base,
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                backgroundColor: trend.isPositive 
                  ? designColors.success[50]
                  : designColors.error[50],
              }}
            >
              {trend.isPositive ? (
                <TrendingUp sx={{ fontSize: 16, color: designColors.success[500] }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: designColors.error[500] }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? designColors.success[500] : designColors.error[500],
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1.5, 
            color: designColors.neutral[500],
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            color: colors.main,
            fontSize: '2rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
