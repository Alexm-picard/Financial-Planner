import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase-config';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Plus, TrendingUp, Trash2, Loader2 } from 'lucide-react';

const TransactionHistory = () => {
  const [user] = useAuthState(auth);
  const { transactions, isLoading } = useTransactions(user?.uid || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | Transaction['type']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <TrendingUp className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'create':
        return 'bg-success/10 text-success';
      case 'update':
        return 'bg-primary/10 text-primary';
      case 'delete':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
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
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Transaction History</h2>
        <p className="text-muted-foreground">View all your account transactions and activity</p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-md"
        />
        <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | Transaction['type'])}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="create">Created</SelectItem>
            <SelectItem value="update">Updated</SelectItem>
            <SelectItem value="delete">Deleted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (Newest)</SelectItem>
            <SelectItem value="amount">Amount (Highest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedTransactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all' ? 'No transactions found' : 'No Transactions Yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredAndSortedTransactions.map((transaction) => {
                const transactionColor = getTransactionColor(transaction.type);
                const isIncrease = transaction.type === 'update' &&
                  transaction.newBalance !== undefined &&
                  transaction.previousBalance !== undefined &&
                  transaction.newBalance > transaction.previousBalance;
                const changeAmount = transaction.type === 'update' && transaction.newBalance !== undefined && transaction.previousBalance !== undefined
                  ? Math.abs(transaction.newBalance - transaction.previousBalance)
                  : 0;

                return (
                  <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${transactionColor}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={transactionColor}>
                            {getTransactionLabel(transaction.type)}
                          </Badge>
                          {transaction.accountName && (
                            <span className="text-sm text-muted-foreground">
                              {transaction.accountName}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold mb-1">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(transaction.timestamp)}
                        </p>
                        {transaction.type === 'update' && transaction.previousBalance !== undefined && transaction.newBalance !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Balance: {formatCurrency(Math.abs(transaction.previousBalance))} →{' '}
                            {formatCurrency(Math.abs(transaction.newBalance))}
                          </p>
                        )}
                        {transaction.type === 'create' && transaction.newBalance !== undefined && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Starting Balance: {formatCurrency(Math.abs(transaction.newBalance))}
                          </p>
                        )}
                      </div>
                      {transaction.type === 'update' && changeAmount > 0 && (
                        <p className={`text-lg font-bold ${isIncrease ? 'text-success' : 'text-destructive'}`}>
                          {isIncrease ? '+' : '-'}
                          {formatCurrency(changeAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistory;

