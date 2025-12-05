import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { accountService } from '@/services/accountService';
import { transactionService } from '@/services/transactionService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'savings' | 'debt';
}

const AddTransaction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    description: '',
    transactionType: 'deposit' as 'deposit' | 'withdraw' | 'payoff',
  });
  const [loading, setLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.sub) return;

      try {
        const response = await accountService.getAll(user.sub);
        
        // Convert MongoDB _id to id
        const accountsData: Account[] = response.map((account: any) => ({
          id: account.id || account._id,
          ...account
        })) as Account[];
        
        setAccounts(accountsData);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub || formData.amount === '') return;
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!user?.sub || formData.amount === '') return;

    try {
      const account = accounts.find(a => a.id === formData.accountId);
      if (!account) return;

      let amount = parseFloat(formData.amount);
      if (account.type === 'debt') {
        amount = Math.abs(amount);
      } else {
        amount = formData.transactionType === 'deposit' ? Math.abs(amount) : -Math.abs(amount);
      }

      const newBalance = account.balance + amount;

      // Update account balance via API
      await accountService.update(formData.accountId, { balance: newBalance });

      // Create transaction record via API
      await transactionService.create({
        accountId: formData.accountId,
        accountName: account.name,
        userId: user.sub,
        type: 'update',
        previousBalance: account.balance,
        newBalance: newBalance,
        description: formData.description
      });

      navigate('/');
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const getTransactionTypeOptions = () => {
    const selectedAccount = accounts.find(a => a.id === formData.accountId);
    if (!selectedAccount) return [];

    if (selectedAccount.type === 'debt') {
      return [{ value: 'payoff', label: 'Debt Payment' }];
    } else {
      return [
        { value: 'deposit', label: 'Deposit' },
        { value: 'withdraw', label: 'Withdraw' }
      ];
    }
  };

  const getSelectedAccount = () => {
    return accounts.find(a => a.id === formData.accountId);
  };

  const getTransactionTypeLabel = () => {
    const options = getTransactionTypeOptions();
    const option = options.find(opt => opt.value === formData.transactionType);
    return option ? option.label : '';
  };

  useEffect(() => {
    if (formData.accountId) {
      const selectedAccount = accounts.find(a => a.id === formData.accountId);
      setFormData(prev => ({
        ...prev,
        transactionType: selectedAccount?.type === 'debt' ? 'payoff' : 'deposit'
      }));
    }
  }, [formData.accountId, accounts]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
          <CardDescription>
            Record a deposit, withdrawal, or debt payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.accountId && (
              <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(value) => setFormData({ ...formData, transactionType: value as 'deposit' | 'withdraw' | 'payoff' })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTransactionTypeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                placeholder="Transaction description"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.accountId || formData.amount === '' || !formData.description}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Transaction'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the transaction details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Account:</strong> {getSelectedAccount()?.name}</p>
            <p><strong>Transaction Type:</strong> {getTransactionTypeLabel()}</p>
            <p><strong>Amount:</strong> ${typeof formData.amount === 'number' ? Math.abs(formData.amount).toFixed(2) : parseFloat(formData.amount || '0').toFixed(2)}</p>
            <p><strong>Description:</strong> {formData.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit}>
              Confirm Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddTransaction;

