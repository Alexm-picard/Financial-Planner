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
        background: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: isDebt
            ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
            : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
          opacity: 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '&:hover': {
          borderColor: isDebt 
            ? 'rgba(239, 68, 68, 0.3)' 
            : 'rgba(16, 185, 129, 0.3)',
          transform: 'translateY(-4px)',
          boxShadow: '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)',
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: isDebt
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
                color: isDebt ? theme.palette.error.main : theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {isDebt ? <CreditCardIcon /> : <AccountBalanceIcon />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1, 
                  fontSize: '1.125rem',
                  color: '#0F172A',
                  lineHeight: 1.3,
                }}
              >
                {account.name}
              </Typography>
              <Chip
                label={isDebt ? 'Debt' : 'Savings'}
                size="small"
                sx={{
                  backgroundColor: isDebt
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                  color: isDebt ? theme.palette.error.main : theme.palette.success.main,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  borderRadius: 1.5,
                  '& .MuiChip-label': {
                    px: 1.5,
                  },
                }}
              />
            </Box>
          </Box>
          {showActions && onEdit && (
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                color: '#64748B',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  color: '#6366F1',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: isDebt ? theme.palette.error.main : theme.palette.success.main,
              mb: 1.5,
              fontSize: '2rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(balance)}
          </Typography>
          {account.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748B',
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              {account.description}
            </Typography>
          )}
        </Box>

        {account.dueDate && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <CalendarIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.warning.main, 
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Due: {new Date(account.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
          </Box>
        )}

        {account.monthlyPayment && account.monthlyPayment.amount > 0 && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748B',
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Monthly Payment
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.25rem',
                color: '#0F172A',
              }}
            >
              {formatCurrency(account.monthlyPayment.amount)}
            </Typography>
            {account.monthlyPayment.nextPaymentDate && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block',
                }}
              >
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
