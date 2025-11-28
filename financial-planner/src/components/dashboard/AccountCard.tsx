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
import { colors as designColors, shadows, transitions } from '../../design-tokens';

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
        border: `1px solid ${designColors.neutral[200]}`,
        borderRadius: '20px',
        transition: `all ${transitions.base}`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: shadows.sm,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: isDebt
            ? `linear-gradient(90deg, ${designColors.error[500]} 0%, ${designColors.error[600]} 100%)`
            : `linear-gradient(90deg, ${designColors.success[500]} 0%, ${designColors.success[600]} 100%)`,
          opacity: 0,
          transition: transitions.base,
        },
        '&:hover': {
          borderColor: isDebt 
            ? designColors.error[300]
            : designColors.success[300],
          transform: 'translateY(-4px)',
          boxShadow: shadows.lg,
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
                borderRadius: '12px',
                backgroundColor: isDebt
                  ? designColors.error[50]
                  : designColors.success[50],
                color: isDebt ? designColors.error[500] : designColors.success[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: transitions.base,
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
                  color: designColors.neutral[900],
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
                    ? designColors.error[50]
                    : designColors.success[50],
                  color: isDebt ? designColors.error[500] : designColors.success[500],
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  borderRadius: '8px',
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
                color: designColors.neutral[500],
                '&:hover': {
                  backgroundColor: designColors.primary[50],
                  color: designColors.primary[500],
                },
                transition: transitions.base,
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
              color: isDebt ? designColors.error[500] : designColors.success[500],
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
                color: designColors.neutral[500],
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
              borderRadius: '12px',
              backgroundColor: designColors.warning[50],
              border: `1px solid ${designColors.warning[200]}`,
            }}
          >
            <CalendarIcon sx={{ fontSize: 18, color: designColors.warning[500] }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: designColors.warning[500], 
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
          <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${designColors.neutral[200]}` }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: designColors.neutral[500],
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
                color: designColors.neutral[900],
              }}
            >
              {formatCurrency(account.monthlyPayment.amount)}
            </Typography>
            {account.monthlyPayment.nextPaymentDate && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: designColors.neutral[400],
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
