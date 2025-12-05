import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { AccountCard } from '@/components/AccountCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Account } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

const Accounts = () => {
  const { user } = useAuth();
  const { accounts, isLoading, updateAccount, deleteAccount } = useAccounts(user?.sub || null);
  const { addTransaction } = useTransactions(user?.sub || null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name');
  const [selectedTab, setSelectedTab] = useState<'all' | 'savings' | 'debt'>('all');

  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const debtAccounts = accounts.filter(acc => acc.type === 'debt');

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = selectedTab === 'all' 
      ? accounts 
      : selectedTab === 'savings' 
      ? savingsAccounts 
      : debtAccounts;

    if (searchQuery.trim()) {
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return Math.abs(b.balance) - Math.abs(a.balance);
        default:
          return 0;
      }
    });
  }, [accounts, selectedTab, searchQuery, sortBy, savingsAccounts, debtAccounts]);

  const handleEdit = (account: Account) => {
    // Navigate to home page where edit dialog is available
    window.location.href = '/';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Accounts</h2>
        <p className="text-muted-foreground">Manage your savings and debt accounts</p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-md"
        />
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'balance')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="balance">Balance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'all' | 'savings' | 'debt')}>
        <TabsList>
          <TabsTrigger value="all">All ({accounts.length})</TabsTrigger>
          <TabsTrigger value="savings">Savings ({savingsAccounts.length})</TabsTrigger>
          <TabsTrigger value="debt">Debt ({debtAccounts.length})</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAndSortedAccounts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-card border-2 border-dashed rounded-xl mt-6">
            <p className="text-muted-foreground">
              {searchQuery ? `No accounts found matching "${searchQuery}"` : `No ${selectedTab === 'all' ? '' : selectedTab} accounts yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAndSortedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                showActions={true}
              />
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Accounts;

