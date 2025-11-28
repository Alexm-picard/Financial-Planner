import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Account } from '../../types';
import AccountCard from '../dashboard/AccountCard';
import { colors } from '../../design-tokens';

interface AccountSectionProps {
  title: string;
  subtitle: string;
  accounts: Account[];
  onEdit: (account: Account) => void;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}

const AccountSection: React.FC<AccountSectionProps> = ({
  title,
  subtitle,
  accounts,
  onEdit,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}) => {
  if (accounts.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          px: 4,
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: `2px dashed ${colors.neutral[200]}`,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            p: 3,
            borderRadius: '16px',
            backgroundColor: colors.neutral[100],
            color: colors.neutral[400],
            mb: 3,
          }}
        >
          {emptyIcon}
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: colors.neutral[700],
          }}
        >
          {emptyTitle}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: colors.neutral[500],
          }}
        >
          {emptyDescription}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
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
          }}
        >
          {subtitle}
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <AccountCard
              account={account}
              onEdit={onEdit}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountSection;

