import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import AccountCard from '../components/dashboard/AccountCard';
import EmptyState from '../components/molecules/EmptyState';
import PageHeader from '../components/layout/PageHeader';
import { Account, ChartData } from '../types';
import { formatCurrency } from '../utils/formatters';
import { colors, shadows } from '../design-tokens';

const Reports: React.FC = () => {
  const [user] = useAuthState(auth);
  const { accounts, isLoading } = useAccounts(user?.uid || null);
  const { transactions } = useTransactions(user?.uid || null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  const chartData = useMemo(() => {
    if (!selectedAccount) return [];

    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccount.id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const now = new Date();
    const filterDate = (() => {
      switch (dateRange) {
        case 'month':
          return new Date(now.getFullYear(), now.getMonth(), 1);
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          return new Date(now.getFullYear(), quarter * 3, 1);
        case 'year':
          return new Date(now.getFullYear(), 0, 1);
        default:
          return new Date(0);
      }
    })();

    const filteredTransactions = accountTransactions.filter(t => {
      if (dateRange === 'all') return true;
      return t.timestamp >= filterDate;
    });

    const data: ChartData[] = [];
    let currentBalance = 0;

    const createTransaction = filteredTransactions.find(t => t.type === 'create');
    if (createTransaction) {
      currentBalance = createTransaction.newBalance || 0;
      data.push({
        date: createTransaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.abs(currentBalance),
      });
    }

    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'update') {
        currentBalance = transaction.newBalance || currentBalance;
        data.push({
          date: transaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.abs(currentBalance),
        });
      }
    });

    return data;
  }, [selectedAccount, transactions, dateRange]);

  const pieChartData = useMemo(() => {
    const savings = accounts.filter(acc => acc.type === 'savings');
    const debt = accounts.filter(acc => acc.type === 'debt');
    
    return [
      {
        name: 'Savings',
        value: savings.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      },
      {
        name: 'Debt',
        value: debt.reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      },
    ];
  }, [accounts]);

  const COLORS = [colors.success[500], colors.error[500]];

  const totalAssets = accounts
    .filter(acc => acc.type === 'savings')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
  
  const totalLiabilities = accounts
    .filter(acc => acc.type === 'debt')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  return (
    <Box>
      <PageHeader
        title="Financial Reports"
        subtitle="Analyze your financial trends and account history"
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Typography variant="body1" sx={{ color: colors.neutral[500] }}>Loading...</Typography>
        </Box>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Typography sx={{ fontSize: 64 }}>📊</Typography>}
          title="No Accounts Found"
          description="Add accounts to view financial reports and analytics."
        />
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.neutral[500], mb: 1, fontWeight: 500 }}
                  >
                    Total Assets
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: colors.success[500],
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(totalAssets)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.neutral[500], mb: 1, fontWeight: 500 }}
                  >
                    Total Liabilities
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: colors.error[500],
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(totalLiabilities)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.neutral[500], mb: 1, fontWeight: 500 }}
                  >
                    Net Worth
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: totalAssets - totalLiabilities >= 0 ? colors.success[500] : colors.error[500],
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(totalAssets - totalLiabilities)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: colors.neutral[900],
                    }}
                  >
                    Asset Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: '20px',
                  boxShadow: shadows.sm,
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: colors.neutral[900],
                    }}
                  >
                    Account Overview
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {accounts.slice(0, 5).map((account) => (
                      <Box
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          border: `1px solid ${colors.neutral[200]}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: colors.neutral[50],
                            borderColor: colors.primary[200],
                            transform: 'translateY(-2px)',
                            boxShadow: shadows.sm,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: colors.neutral[900] }}>
                            {account.name}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: account.balance < 0 ? colors.error[500] : colors.success[500],
                            }}
                          >
                            {formatCurrency(Math.abs(account.balance))}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Account Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: colors.neutral[900],
              }}
            >
              Select an Account to View History
            </Typography>
            <Grid container spacing={3}>
              {accounts.map((account) => (
                <Grid item xs={12} sm={6} md={4} key={account.id}>
                  <AccountCard
                    account={account}
                    onClick={() => setSelectedAccount(account)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* Account History Dialog */}
      <Dialog
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: colors.neutral[900] }}>
          Transaction History - {selectedAccount?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAccount && (
            <Box sx={{ mb: 3, mt: 1 }}>
              <TextField
                select
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'all' | 'month' | 'quarter' | 'year')}
                fullWidth
                sx={{ mb: 3 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </TextField>
            </Box>
          )}
          {chartData.length > 0 ? (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
                  <XAxis dataKey="date" stroke={colors.neutral[500]} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke={colors.neutral[500]}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${colors.neutral[200]}`,
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke={selectedAccount?.type === 'debt' ? colors.error[500] : colors.success[500]}
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: colors.neutral[500] }}>
                No transaction history available for this account{dateRange !== 'all' ? ' in the selected time period' : ''}.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSelectedAccount(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
