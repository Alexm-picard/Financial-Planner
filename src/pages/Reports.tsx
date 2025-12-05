import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { AccountCard } from '@/components/AccountCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account, ChartData } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const { accounts, isLoading } = useAccounts(user?.sub || null);
  const { transactions } = useTransactions(user?.sub || null);
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

  const COLORS = ['#22c55e', '#ef4444'];

  const totalAssets = accounts
    .filter(acc => acc.type === 'savings')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
  
  const totalLiabilities = accounts
    .filter(acc => acc.type === 'debt')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Financial Reports</h2>
        <p className="text-muted-foreground">Analyze your financial trends and account history</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Add accounts to view financial reports and analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-success">{formatCurrency(totalAssets)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${totalAssets - totalLiabilities >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalAssets - totalLiabilities)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
              </CardHeader>
              <CardContent>
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
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts.slice(0, 5).map((account) => (
                    <div
                      key={account.id}
                      onClick={() => setSelectedAccount(account)}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{account.name}</p>
                        <p className={account.balance < 0 ? 'text-destructive' : 'text-success'}>
                          {formatCurrency(Math.abs(account.balance))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Select an Account to View History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={() => setSelectedAccount(account)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <Dialog open={Boolean(selectedAccount)} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History - {selectedAccount?.name}</DialogTitle>
            <DialogDescription>
              View the balance history for this account
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as 'all' | 'month' | 'quarter' | 'year')}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              {chartData.length > 0 ? (
                <div className="h-[400px]">
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
                        stroke={selectedAccount.type === 'debt' ? '#ef4444' : '#22c55e'}
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transaction history available for this account{dateRange !== 'all' ? ' in the selected time period' : ''}.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;

