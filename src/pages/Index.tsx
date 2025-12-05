import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { FinancialSummary } from '@/components/FinancialSummary';
import { AccountCard } from '@/components/AccountCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, CreditCard, Plus, Loader2 } from 'lucide-react';
import { Account } from '@/types';
import { formatCurrency } from '@/lib/formatters';

const Index = () => {
  const { user } = useAuth();
  const { accounts, isLoading: accountsLoading, addAccount, updateAccount, deleteAccount } = useAccounts(user?.sub || null);
  const { transactions, addTransaction } = useTransactions(user?.sub || null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState<Omit<Account, 'userId' | 'id'>>({
    name: '',
    balance: 0,
    dueDate: null,
    description: '',
    type: 'savings',
    monthlyPayment: null,
    incomeSchedule: null,
  });

  useEffect(() => {
    const pendingDebtAmount = localStorage.getItem('pendingDebtAmount');
    if (pendingDebtAmount) {
      setNewAccount({
        ...newAccount,
        type: 'debt',
        balance: parseFloat(pendingDebtAmount),
      });
      setIsAddDialogOpen(true);
      localStorage.removeItem('pendingDebtAmount');
    }
  }, []);

  const handleAddAccount = async () => {
    if (!user) return;

    try {
      const accountId = await addAccount(newAccount);

      if (accountId) {
        await addTransaction({
          accountId,
          accountName: newAccount.name,
          userId: user.sub,
          type: 'create',
          newBalance: newAccount.type === 'debt' ? -Math.abs(newAccount.balance) : Math.abs(newAccount.balance),
          description: `Created ${newAccount.type} account: ${newAccount.name}`,
        });
      }

      setNewAccount({
        name: '',
        balance: 0,
        dueDate: null,
        description: '',
        type: 'savings',
        monthlyPayment: null,
        incomeSchedule: null,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!user || !selectedAccount?.id) return;

    try {
      const newBalance = selectedAccount.type === 'debt'
        ? -Math.abs(selectedAccount.balance)
        : Math.abs(selectedAccount.balance);

      if (selectedAccount.type === 'debt' && newBalance === 0) {
        await deleteAccount(selectedAccount.id);
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.sub,
          type: 'delete',
          previousBalance: selectedAccount.balance,
          description: `Paid off and deleted account ${selectedAccount.name}`,
        });
      } else {
        await updateAccount(selectedAccount.id, {
          ...selectedAccount,
          balance: newBalance,
        });

        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.sub,
          type: 'update',
          previousBalance: selectedAccount.balance,
          newBalance: newBalance,
          description: `Updated account ${selectedAccount.name}`,
        });
      }

      setIsEditDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !selectedAccount?.id) return;

    try {
      await addTransaction({
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        userId: user.sub,
        type: 'delete',
        previousBalance: selectedAccount.balance,
        description: `Deleted ${selectedAccount.type} account: ${selectedAccount.name}`,
      });

      await deleteAccount(selectedAccount.id);
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const debtAccounts = accounts.filter(acc => acc.type === 'debt');

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
        </h2>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </header>

      <FinancialSummary accounts={accounts} />

      {accountsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 px-4 bg-card border-2 border-dashed rounded-xl">
          <div className="inline-flex p-3 rounded-xl bg-muted mb-3">
            <Wallet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Accounts Yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first account to track your finances.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-1">Savings & Assets</h3>
              <p className="text-muted-foreground">Your savings accounts and assets</p>
            </div>
            {savingsAccounts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-card border-2 border-dashed rounded-xl">
                <div className="inline-flex p-3 rounded-xl bg-muted mb-3">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No savings accounts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savingsAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => {
                      setSelectedAccount({ ...acc });
                      setIsEditDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-1">Debts & Liabilities</h3>
              <p className="text-muted-foreground">Track and manage your debts</p>
            </div>
            {debtAccounts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-card border-2 border-dashed rounded-xl">
                <div className="inline-flex p-3 rounded-xl bg-muted mb-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No debt accounts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debtAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => {
                      setSelectedAccount({ ...acc });
                      setIsEditDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Button
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsAddDialogOpen(true)}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new savings or debt account to track your finances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="e.g., Savings Account"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">
                {newAccount.incomeSchedule 
                  ? `Amount paid ${newAccount.incomeSchedule.frequency === 'weekly' ? 'Per week' : newAccount.incomeSchedule.frequency === 'bi-weekly' ? 'Bi-weekly' : 'Per Month'}`
                  : 'Amount'}
              </Label>
              <Input
                id="balance"
                type="number"
                value={newAccount.balance}
                onChange={(e) => {
                  const balance = parseFloat(e.target.value) || 0;
                  setNewAccount({ 
                    ...newAccount, 
                    balance,
                    incomeSchedule: newAccount.incomeSchedule
                      ? { ...newAccount.incomeSchedule, estimatedEarnings: balance }
                      : null
                  });
                }}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <RadioGroup
                value={newAccount.incomeSchedule ? 'income' : newAccount.type}
                onValueChange={(value) => {
                  if (value === 'income') {
                    setNewAccount({
                      ...newAccount,
                      type: 'savings',
                      incomeSchedule: {
                        payDayDate: newAccount.incomeSchedule?.payDayDate || new Date().toISOString().split('T')[0],
                        estimatedEarnings: newAccount.balance || newAccount.incomeSchedule?.estimatedEarnings || 0,
                        frequency: newAccount.incomeSchedule?.frequency || 'monthly',
                      },
                      dueDate: null,
                      monthlyPayment: null,
                    });
                  } else {
                    setNewAccount({
                      ...newAccount,
                      type: value as 'savings' | 'debt',
                      dueDate: value === 'debt' ? newAccount.dueDate || new Date().toISOString().split('T')[0] : null,
                      incomeSchedule: null,
                    });
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="savings" id="savings" />
                  <Label htmlFor="savings">Savings/Asset</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debt" id="debt" />
                  <Label htmlFor="debt">Debt/Liability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income/Payday</Label>
                </div>
              </RadioGroup>
            </div>
            {newAccount.incomeSchedule && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="payDayDate">Pay Day Date</Label>
                  <Input
                    id="payDayDate"
                    type="date"
                    value={newAccount.incomeSchedule.payDayDate || ''}
                    onChange={(e) => {
                      const payDayDate = e.target.value;
                      setNewAccount({
                        ...newAccount,
                        incomeSchedule: payDayDate
                          ? {
                              payDayDate,
                              estimatedEarnings: newAccount.balance || newAccount.incomeSchedule?.estimatedEarnings || 0,
                              frequency: newAccount.incomeSchedule?.frequency || 'monthly',
                            }
                          : null,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newAccount.incomeSchedule.frequency || 'monthly'}
                    onValueChange={(value) =>
                      setNewAccount({
                        ...newAccount,
                        incomeSchedule: newAccount.incomeSchedule
                          ? { ...newAccount.incomeSchedule, frequency: value as 'weekly' | 'bi-weekly' | 'monthly' }
                          : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {newAccount.type === 'debt' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newAccount.dueDate || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment Amount</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    value={newAccount.monthlyPayment?.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setNewAccount({
                        ...newAccount,
                        monthlyPayment: amount > 0
                          ? {
                              amount,
                              linkedAccountId: newAccount.monthlyPayment?.linkedAccountId || '',
                              nextPaymentDate: newAccount.dueDate || '',
                            }
                          : null,
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                {newAccount.monthlyPayment && newAccount.monthlyPayment.amount > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="linkedAccount">Link to Savings Account</Label>
                    <Select
                      value={newAccount.monthlyPayment.linkedAccountId}
                      onValueChange={(value) =>
                        setNewAccount({
                          ...newAccount,
                          monthlyPayment: newAccount.monthlyPayment
                            ? { ...newAccount.monthlyPayment, linkedAccountId: value }
                            : null,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingsAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id || ''}>
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAccount}
              disabled={!newAccount.name || (newAccount.type === 'debt' && newAccount.balance === 0)}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update your account information.
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedAccount.description}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-balance">
                  {selectedAccount.incomeSchedule 
                    ? `Amount paid ${selectedAccount.incomeSchedule.frequency === 'weekly' ? 'Per week' : selectedAccount.incomeSchedule.frequency === 'bi-weekly' ? 'Bi-weekly' : 'Per Month'}`
                    : 'Amount'}
                </Label>
                <Input
                  id="edit-balance"
                  type="number"
                  value={Math.abs(selectedAccount.balance)}
                  onChange={(e) => {
                    const balance = parseFloat(e.target.value) || 0;
                    setSelectedAccount({ 
                      ...selectedAccount, 
                      balance,
                      incomeSchedule: selectedAccount.incomeSchedule
                        ? { ...selectedAccount.incomeSchedule, estimatedEarnings: balance }
                        : null
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  value={selectedAccount.incomeSchedule ? 'income' : selectedAccount.type}
                  onValueChange={(value) => {
                    if (value === 'income') {
                      setSelectedAccount({
                        ...selectedAccount,
                        type: 'savings',
                        incomeSchedule: {
                          payDayDate: selectedAccount.incomeSchedule?.payDayDate || new Date().toISOString().split('T')[0],
                          estimatedEarnings: Math.abs(selectedAccount.balance) || selectedAccount.incomeSchedule?.estimatedEarnings || 0,
                          frequency: selectedAccount.incomeSchedule?.frequency || 'monthly',
                        },
                        dueDate: null,
                        monthlyPayment: null,
                      });
                    } else {
                      setSelectedAccount({
                        ...selectedAccount,
                        type: value as 'savings' | 'debt',
                        dueDate:
                          value === 'debt'
                            ? selectedAccount.dueDate || new Date().toISOString().split('T')[0]
                            : null,
                        incomeSchedule: null,
                      });
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id="edit-savings" />
                    <Label htmlFor="edit-savings">Savings/Asset</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debt" id="edit-debt" />
                    <Label htmlFor="edit-debt">Debt/Liability</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="edit-income" />
                    <Label htmlFor="edit-income">Income/Payday</Label>
                  </div>
                </RadioGroup>
              </div>
              {selectedAccount.incomeSchedule && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-payDayDate">Pay Day Date</Label>
                    <Input
                      id="edit-payDayDate"
                      type="date"
                      value={selectedAccount.incomeSchedule.payDayDate || ''}
                      onChange={(e) => {
                        const payDayDate = e.target.value;
                        setSelectedAccount({
                          ...selectedAccount,
                          incomeSchedule: payDayDate
                            ? {
                                payDayDate,
                                estimatedEarnings: Math.abs(selectedAccount.balance) || selectedAccount.incomeSchedule?.estimatedEarnings || 0,
                                frequency: selectedAccount.incomeSchedule?.frequency || 'monthly',
                              }
                            : null,
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-frequency">Frequency</Label>
                    <Select
                      value={selectedAccount.incomeSchedule.frequency || 'monthly'}
                      onValueChange={(value) =>
                        setSelectedAccount({
                          ...selectedAccount,
                          incomeSchedule: selectedAccount.incomeSchedule
                            ? { ...selectedAccount.incomeSchedule, frequency: value as 'weekly' | 'bi-weekly' | 'monthly' }
                            : null,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedAccount.type === 'debt' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dueDate">Due Date</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={selectedAccount.dueDate || ''}
                      onChange={(e) => setSelectedAccount({ ...selectedAccount, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-monthlyPayment">Monthly Payment Amount</Label>
                    <Input
                      id="edit-monthlyPayment"
                      type="number"
                      value={selectedAccount.monthlyPayment?.amount || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        setSelectedAccount({
                          ...selectedAccount,
                          monthlyPayment: amount > 0
                            ? {
                                amount,
                                linkedAccountId: selectedAccount.monthlyPayment?.linkedAccountId || '',
                                nextPaymentDate: selectedAccount.dueDate || '',
                              }
                            : null,
                        });
                      }}
                    />
                  </div>
                  {selectedAccount.monthlyPayment && selectedAccount.monthlyPayment.amount > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-linkedAccount">Link to Savings Account</Label>
                      <Select
                        value={selectedAccount.monthlyPayment.linkedAccountId}
                        onValueChange={(value) =>
                          setSelectedAccount({
                            ...selectedAccount,
                            monthlyPayment: selectedAccount.monthlyPayment
                              ? { ...selectedAccount.monthlyPayment, linkedAccountId: value }
                              : null,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {savingsAccounts
                            .filter(acc => acc.id !== selectedAccount.id)
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id || ''}>
                                {account.name} ({formatCurrency(account.balance)})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAccount}
              disabled={!selectedAccount?.name || (selectedAccount?.type === 'debt' && selectedAccount?.balance === 0)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
