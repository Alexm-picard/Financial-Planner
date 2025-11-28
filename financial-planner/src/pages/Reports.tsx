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
  CircularProgress,
  useTheme,
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
import { Account, ChartData } from '../types';
import { formatCurrency } from '../utils/formatters';

const Reports: React.FC = () => {
  const [user] = useAuthState(auth);
  const { accounts, isLoading } = useAccounts(user?.uid || null);
  const { transactions } = useTransactions(user?.uid || null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!selectedAccount) return [];

    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccount.id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const data: ChartData[] = [];
    let currentBalance = 0;

    const createTransaction = accountTransactions.find(t => t.type === 'create');
    if (createTransaction) {
      currentBalance = createTransaction.newBalance || 0;
      data.push({
        date: createTransaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.abs(currentBalance),
      });
    }

    accountTransactions.forEach(transaction => {
      if (transaction.type === 'update') {
        currentBalance = transaction.newBalance || currentBalance;
        data.push({
          date: transaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.abs(currentBalance),
        });
      }
    });

    return data;
  }, [selectedAccount, transactions]);

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

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  return (
    <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Financial Reports
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : accounts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              No accounts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add accounts to view financial reports and analytics.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Account Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {accounts.slice(0, 5).map((account) => (
                        <Box
                          key={account.id}
                          onClick={() => setSelectedAccount(account)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {account.name}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: account.balance < 0 ? 'error.main' : 'success.main',
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

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
          </>
        )}

        {/* Account History Dialog */}
        <Dialog
          open={Boolean(selectedAccount)}
          onClose={() => setSelectedAccount(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction History - {selectedAccount?.name}
          </DialogTitle>
          <DialogContent>
            {chartData.length > 0 ? (
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke={selectedAccount?.type === 'debt' ? theme.palette.error.main : theme.palette.success.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No transaction history available for this account.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAccount(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default Reports;
