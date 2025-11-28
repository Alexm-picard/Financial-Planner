import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/molecules/EmptyState';
import { colors, shadows, transitions } from '../design-tokens';

const TransactionHistory: React.FC = () => {
  const [user] = useAuthState(auth);
  const { transactions, isLoading } = useTransactions(user?.uid || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | Transaction['type']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        const aAmount = Math.abs((a.newBalance || 0) - (a.previousBalance || 0));
        const bAmount = Math.abs((b.newBalance || 0) - (b.previousBalance || 0));
        return bAmount - aAmount;
      }
    });
  }, [transactions, filterType, searchQuery, sortBy]);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return <AddIcon sx={{ fontSize: 20 }} />;
      case 'update':
        return <TrendingUpIcon sx={{ fontSize: 20 }} />;
      case 'delete':
        return <DeleteIcon sx={{ fontSize: 20 }} />;
      default:
        return <HistoryIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return colors.success[500];
      case 'update':
        return colors.primary[500];
      case 'delete':
        return colors.error[500];
      default:
        return colors.neutral[500];
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
      <PageHeader
        title="Transaction History"
        subtitle="View all your account transactions and activity"
      />

      {/* Filters */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        <TextField
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.neutral[400] }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            maxWidth: { md: 400 },
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value as 'all' | Transaction['type'])}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="create">Created</MenuItem>
            <MenuItem value="update">Updated</MenuItem>
            <MenuItem value="delete">Deleted</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
          >
            <MenuItem value="date">Date (Newest)</MenuItem>
            <MenuItem value="amount">Amount (Highest)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Transactions List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Typography variant="body1" sx={{ color: colors.neutral[500] }}>Loading...</Typography>
        </Box>
      ) : filteredAndSortedTransactions.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon sx={{ fontSize: 64 }} />}
          title={searchQuery || filterType !== 'all' ? 'No transactions found' : 'No Transactions Yet'}
          description={
            searchQuery || filterType !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Your transaction history will appear here once you start managing your accounts.'
          }
        />
      ) : (
        <Card
          sx={{
            borderRadius: '20px',
            boxShadow: shadows.sm,
            border: `1px solid ${colors.neutral[200]}`,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <List disablePadding>
              {filteredAndSortedTransactions.map((transaction, index) => {
                const transactionColor = getTransactionColor(transaction.type);
                const isIncrease = transaction.type === 'update' &&
                  transaction.newBalance !== undefined &&
                  transaction.previousBalance !== undefined &&
                  transaction.newBalance > transaction.previousBalance;
                const changeAmount = transaction.type === 'update' && transaction.newBalance !== undefined && transaction.previousBalance !== undefined
                  ? Math.abs(transaction.newBalance - transaction.previousBalance)
                  : 0;

                return (
                  <React.Fragment key={transaction.id}>
                    <ListItem
                      sx={{
                        py: 3,
                        px: 3,
                        transition: transitions.base,
                        '&:hover': {
                          backgroundColor: colors.neutral[50],
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            backgroundColor: transactionColor + '15',
                            color: transactionColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getTransactionIcon(transaction.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Chip
                              label={getTransactionLabel(transaction.type)}
                              size="small"
                              sx={{
                                backgroundColor: transactionColor + '20',
                                color: transactionColor,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                              }}
                            />
                            {transaction.accountName && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.neutral[500],
                                  fontWeight: 500,
                                }}
                              >
                                {transaction.accountName}
                              </Typography>
                            )}
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: colors.neutral[900],
                              mb: 0.5,
                            }}
                          >
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: colors.neutral[500],
                              fontSize: '0.875rem',
                            }}
                          >
                            {formatDateTime(transaction.timestamp)}
                          </Typography>
                          {transaction.type === 'update' && transaction.previousBalance !== undefined && transaction.newBalance !== undefined && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.neutral[500],
                                fontSize: '0.875rem',
                                mt: 0.5,
                              }}
                            >
                              Balance: {formatCurrency(Math.abs(transaction.previousBalance))} →{' '}
                              {formatCurrency(Math.abs(transaction.newBalance))}
                            </Typography>
                          )}
                          {transaction.type === 'create' && transaction.newBalance !== undefined && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.neutral[500],
                                fontSize: '0.875rem',
                                mt: 0.5,
                              }}
                            >
                              Starting Balance: {formatCurrency(Math.abs(transaction.newBalance))}
                            </Typography>
                          )}
                        </Box>
                        {transaction.type === 'update' && changeAmount > 0 && (
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: isIncrease ? colors.success[500] : colors.error[500],
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isIncrease ? '+' : '-'}
                            {formatCurrency(changeAmount)}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    {index < filteredAndSortedTransactions.length - 1 && (
                      <Divider sx={{ mx: 3 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TransactionHistory;
