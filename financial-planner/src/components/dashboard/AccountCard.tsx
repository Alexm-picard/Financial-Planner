import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AccountCardProps {
  account: Account;
  onEdit?: (account: Account) => void;
  onClick?: (account: Account) => void;
  showActions?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onClick,
  showActions = true,
}) => {
  const theme = useTheme();
  const isDebt = account.type === 'debt';
  const balance = Math.abs(account.balance);
  const isPositive = account.balance >= 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(account);
  };

  return (
    <Card
      onClick={() => onClick?.(account)}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: isDebt ? theme.palette.error.light : theme.palette.success.light,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: isDebt
                  ? theme.palette.error.light + '20'
                  : theme.palette.success.light + '20',
                color: isDebt ? theme.palette.error.main : theme.palette.success.main,
              }}
            >
              {isDebt ? <CreditCardIcon /> : <AccountBalanceIcon />}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {account.name}
              </Typography>
              <Chip
                label={isDebt ? 'Debt' : 'Savings'}
                size="small"
                sx={{
                  backgroundColor: isDebt
                    ? theme.palette.error.light + '20'
                    : theme.palette.success.light + '20',
                  color: isDebt ? theme.palette.error.main : theme.palette.success.main,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
          {showActions && onEdit && (
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: isDebt ? theme.palette.error.main : theme.palette.success.main,
              mb: 1,
            }}
          >
            {formatCurrency(balance)}
          </Typography>
          {account.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {account.description}
            </Typography>
          )}
        </Box>

        {account.dueDate && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: theme.palette.warning.light + '10',
            }}
          >
            <CalendarIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
            <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 500 }}>
              Due: {new Date(account.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
          </Box>
        )}

        {account.monthlyPayment && account.monthlyPayment.amount > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Monthly Payment
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatCurrency(account.monthlyPayment.amount)}
            </Typography>
            {account.monthlyPayment.nextPaymentDate && (
              <Typography variant="caption" color="text.secondary">
                Next: {new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountCard;

