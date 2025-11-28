import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

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
      main: '#6366F1', 
      light: '#818CF8', 
      bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
      iconBg: 'rgba(99, 102, 241, 0.1)',
    },
    success: { 
      main: '#10B981', 
      light: '#34D399', 
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
      iconBg: 'rgba(16, 185, 129, 0.1)',
    },
    error: { 
      main: '#EF4444', 
      light: '#F87171', 
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
      iconBg: 'rgba(239, 68, 68, 0.1)',
    },
    warning: { 
      main: '#F59E0B', 
      light: '#FBBF24', 
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
      iconBg: 'rgba(245, 158, 11, 0.1)',
    },
  };

  const colors = colorConfig[color];

  return (
    <Card
      sx={{
        height: '100%',
        background: colors.bg,
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
        },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              background: colors.iconBg,
              color: colors.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
                borderRadius: 2,
                backgroundColor: trend.isPositive 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              {trend.isPositive ? (
                <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
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
            color: '#64748B',
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
