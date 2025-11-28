import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';

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

  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${colorMap[color]}15 0%, ${colorMap[color]}05 100%)`,
        border: `1px solid ${colorMap[color]}20`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: colorMap[color] + '15',
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend.isPositive ? (
                <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />
              ) : (
                <TrendingDown sx={{ fontSize: 18, color: theme.palette.error.main }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 600,
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colorMap[color] }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;

