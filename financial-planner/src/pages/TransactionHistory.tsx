import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const TransactionHistory: React.FC = () => {
  const [user] = useAuthState(auth);
  const { transactions, isLoading } = useTransactions(user?.uid || null);
  const theme = useTheme();

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return theme.palette.success.main;
      case 'update':
        return theme.palette.info.main;
      case 'delete':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return 'Created';
      case 'update':
        return 'Updated';
      case 'delete':
        return 'Deleted';
      default:
        return type;
    }
  };

  return (
      <Box>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
              }}
            >
              <HistoryIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Transaction History
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#64748B',
                  mt: 0.5,
                }}
              >
                View all your account transactions
              </Typography>
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              No Transactions Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your transaction history will appear here once you start managing your accounts.
            </Typography>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <List>
                {transactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip
                          label={getTransactionLabel(transaction.type)}
                          size="small"
                          sx={{
                            backgroundColor: getTransactionColor(transaction.type) + '20',
                            color: getTransactionColor(transaction.type),
                            fontWeight: 600,
                            minWidth: 80,
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {transaction.description}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDateTime(transaction.timestamp)}
                                </Typography>
                                {transaction.type === 'update' && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Balance: {formatCurrency(Math.abs(transaction.previousBalance || 0))} →{' '}
                                    {formatCurrency(Math.abs(transaction.newBalance || 0))}
                                  </Typography>
                                )}
                                {transaction.type === 'create' && transaction.newBalance !== undefined && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Starting Balance: {formatCurrency(Math.abs(transaction.newBalance))}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                        {transaction.type === 'update' && transaction.newBalance !== undefined && (
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color:
                                transaction.newBalance > (transaction.previousBalance || 0)
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                            }}
                          >
                            {transaction.newBalance > (transaction.previousBalance || 0) ? '+' : ''}
                            {formatCurrency(
                              Math.abs(transaction.newBalance - (transaction.previousBalance || 0))
                            )}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    {index < transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
  );
};

export default TransactionHistory;
