import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useFinancialSummary } from '../../hooks/useFinancialSummary';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import SummaryCard from '../dashboard/SummaryCard';
import { colors } from '../../design-tokens';

interface FinancialSummaryProps {
  accounts: Account[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ accounts }) => {
  const summary = useFinancialSummary(accounts);

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            color: colors.neutral[900],
            letterSpacing: '-0.02em',
          }}
        >
          Financial Overview
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: colors.neutral[500],
          }}
        >
          Track your net worth, assets, and liabilities at a glance
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Net Worth"
            value={formatCurrency(summary.netWorth)}
            icon={<AccountBalance />}
            color={summary.netWorth >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Assets"
            value={formatCurrency(summary.totalAssets)}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Liabilities"
            value={formatCurrency(summary.totalLiabilities)}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Accounts"
            value={`${accounts.length} Total`}
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialSummary;

