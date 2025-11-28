import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditCard,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useFinancialSummary } from '../hooks/useFinancialSummary';
import SummaryCard from '../components/dashboard/SummaryCard';
import AccountCard from '../components/dashboard/AccountCard';
import { Account, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { doc, updateDoc, deleteDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

const Home: React.FC = () => {
  const [user] = useAuthState(auth);
  const { accounts, isLoading: accountsLoading, addAccount, updateAccount, deleteAccount } = useAccounts(user?.uid || null);
  const { transactions, addTransaction } = useTransactions(user?.uid || null);
  const summary = useFinancialSummary(accounts);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isSweepDialogOpen, setIsSweepDialogOpen] = useState<boolean>(false);
  const [sweepTargetAccountId, setSweepTargetAccountId] = useState<string>('');
  const [isCreatingAccountForSweep, setIsCreatingAccountForSweep] = useState<boolean>(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState<boolean>(false);
  const [pendingPaymentAccount, setPendingPaymentAccount] = useState<Account | null>(null);

  const [newAccount, setNewAccount] = useState<Omit<Account, 'userId' | 'id'>>({
    name: '',
    balance: 0,
    dueDate: null,
    description: '',
    type: 'savings',
    monthlyPayment: null,
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
      const finalBalance = isCreatingAccountForSweep && selectedAccount
        ? (newAccount.type === 'debt' ? -Math.abs(newAccount.balance) : Math.abs(newAccount.balance)) + selectedAccount.balance
        : newAccount.type === 'debt' ? -Math.abs(newAccount.balance) : Math.abs(newAccount.balance);

      const accountId = await addAccount({
        ...newAccount,
        balance: finalBalance,
      });

      await addTransaction({
        accountId: accountId || '',
        accountName: newAccount.name,
        userId: user.uid,
        type: 'create',
        newBalance: finalBalance,
        description: `Created ${newAccount.type} account: ${newAccount.name}`,
      });

      if (isCreatingAccountForSweep && selectedAccount?.id) {
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'delete',
          previousBalance: selectedAccount.balance,
          description: `Deleted account ${selectedAccount.name} - swept ${formatCurrency(Math.abs(selectedAccount.balance))} to ${newAccount.name}`,
        });

        await deleteAccount(selectedAccount.id);
        setIsEditDialogOpen(false);
        setIsSweepDialogOpen(false);
        setSweepTargetAccountId('');
        setSelectedAccount(null);
        setIsCreatingAccountForSweep(false);
      }

      setNewAccount({
        name: '',
        balance: 0,
        dueDate: null,
        description: '',
        type: 'savings',
        monthlyPayment: null,
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
          userId: user.uid,
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
          userId: user.uid,
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
    if (!selectedAccount?.id) return;

    if (selectedAccount.balance === 0) {
      await performDeleteAccount();
    } else {
      setIsSweepDialogOpen(true);
    }
  };

  const performDeleteAccount = async (sweepToAccountId?: string) => {
    if (!user || !selectedAccount?.id) return;

    try {
      if (sweepToAccountId && selectedAccount.balance !== 0) {
        const targetAccount = accounts.find(acc => acc.id === sweepToAccountId);
        if (targetAccount?.id) {
          const targetAccountRef = doc(db, 'accounts', targetAccount.id);
          const newBalance = targetAccount.balance + selectedAccount.balance;

          await updateDoc(targetAccountRef, { balance: newBalance });

          await addTransaction({
            accountId: selectedAccount.id,
            accountName: selectedAccount.name,
            userId: user.uid,
            type: 'delete',
            previousBalance: selectedAccount.balance,
            description: `Deleted account ${selectedAccount.name} - swept ${formatCurrency(Math.abs(selectedAccount.balance))} to ${targetAccount.name}`,
          });
        }
      } else {
        await addTransaction({
          accountId: selectedAccount.id,
          accountName: selectedAccount.name,
          userId: user.uid,
          type: 'delete',
          previousBalance: selectedAccount.balance,
          description: `Deleted ${selectedAccount.type} account: ${selectedAccount.name}`,
        });
      }

      await deleteAccount(selectedAccount.id);
      setIsEditDialogOpen(false);
      setIsSweepDialogOpen(false);
      setSweepTargetAccountId('');
      setSelectedAccount(null);
      setIsCreatingAccountForSweep(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleEarlyPayment = async (account: Account) => {
    if (!user || !account.monthlyPayment || !account.id) return;

    const linkedAccount = accounts.find(acc => acc.id === account.monthlyPayment?.linkedAccountId);

    if (!linkedAccount?.id || linkedAccount.balance < account.monthlyPayment.amount) {
      return;
    }

    try {
      const paymentAmount = account.monthlyPayment.amount;
      const debtRef = doc(db, 'accounts', account.id);
      const savingsRef = doc(db, 'accounts', linkedAccount.id);
      const newDebtBalance = account.balance + paymentAmount;
      const newSavingsBalance = linkedAccount.balance - paymentAmount;

      const currentDueDate = new Date(account.dueDate + 'T00:00:00');
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      await updateDoc(debtRef, {
        balance: newDebtBalance,
        'monthlyPayment.nextPaymentDate': nextDueDate.toISOString().split('T')[0],
      });

      await updateDoc(savingsRef, {
        balance: newSavingsBalance,
      });

      await addTransaction({
        accountId: account.id,
        accountName: account.name,
        userId: user.uid,
        type: 'update',
        previousBalance: account.balance,
        newBalance: newDebtBalance,
        description: `Early payment from ${linkedAccount.name} to ${account.name}`,
      });
    } catch (error) {
      console.error('Error processing early payment:', error);
    } finally {
      setIsPaymentDialogOpen(false);
      setPendingPaymentAccount(null);
    }
  };

  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const debtAccounts = accounts.filter(acc => acc.type === 'debt');

  return (
      <Container maxWidth="xl" sx={{ maxWidth: '1400px !important' }}>
        {/* Summary Cards */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              mb: 0.5,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            Financial Overview
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#64748B',
              mb: 4,
            }}
          >
            Track your net worth, assets, and liabilities at a glance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Net Worth"
                value={formatCurrency(summary.netWorth)}
                icon={<AccountBalance />}
                color={summary.netWorth >= 0 ? 'success' : 'error'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Assets"
                value={formatCurrency(summary.totalAssets)}
                icon={<TrendingUp />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Liabilities"
                value={formatCurrency(summary.totalLiabilities)}
                icon={<TrendingDown />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Accounts"
                value={`${accounts.length} Total`}
                icon={<AccountBalance />}
                color="primary"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Accounts Section */}
        {accountsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : accounts.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 4,
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              border: '2px dashed rgba(226, 232, 240, 0.8)',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                mb: 3,
              }}
            >
              <AccountBalance sx={{ fontSize: 64 }} />
            </Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 1.5,
                color: '#0F172A',
                letterSpacing: '-0.01em',
              }}
            >
              No Accounts Yet
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#64748B',
                mb: 4,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              Get started by adding your first account to track your finances.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{
                minHeight: 52,
                px: 4,
              }}
            >
              Add Account
            </Button>
          </Box>
        ) : (
          <>
            {savingsAccounts.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    color: '#0F172A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Savings & Assets
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#64748B',
                    mb: 4,
                  }}
                >
                  Your savings accounts and assets
                </Typography>
                <Grid container spacing={3}>
                  {savingsAccounts.map((account) => (
                    <Grid item xs={12} sm={6} md={4} key={account.id}>
                      <AccountCard
                        account={account}
                        onEdit={(acc) => {
                          setSelectedAccount({ ...acc });
                          setIsEditDialogOpen(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {debtAccounts.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    color: '#0F172A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Debts & Liabilities
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: '#64748B',
                    mb: 4,
                  }}
                >
                  Track and manage your debts
                </Typography>
                <Grid container spacing={3}>
                  {debtAccounts.map((account) => (
                    <Grid item xs={12} sm={6} md={4} key={account.id}>
                      <AccountCard
                        account={account}
                        onEdit={(acc) => {
                          setSelectedAccount({ ...acc });
                          setIsEditDialogOpen(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}

        {/* Add Account FAB */}
        <Fab
          color="primary"
          aria-label="add account"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            boxShadow: '0px 10px 15px -3px rgba(99, 102, 241, 0.4), 0px 4px 6px -2px rgba(99, 102, 241, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0px 20px 25px -5px rgba(99, 102, 241, 0.4), 0px 10px 10px -5px rgba(99, 102, 241, 0.2)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>

        {/* Add Account Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Account Name"
              fullWidth
              variant="outlined"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newAccount.description}
              onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={newAccount.balance}
              onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
              sx={{ mb: 2 }}
            />
            <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                value={newAccount.type}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    type: e.target.value as 'savings' | 'debt',
                    dueDate: e.target.value === 'debt' ? newAccount.dueDate || new Date().toISOString().split('T')[0] : null,
                  })
                }
              >
                <FormControlLabel value="savings" control={<Radio />} label="Savings/Asset" />
                <FormControlLabel value="debt" control={<Radio />} label="Debt/Liability" />
              </RadioGroup>
            </FormControl>
            {newAccount.type === 'debt' && (
              <>
                <TextField
                  margin="dense"
                  label="Due Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={newAccount.dueDate || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Monthly Payment Amount"
                  type="number"
                  fullWidth
                  variant="outlined"
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
                  sx={{ mb: 2 }}
                />
                {newAccount.monthlyPayment && newAccount.monthlyPayment.amount > 0 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Link to Savings Account</InputLabel>
                    <Select
                      value={newAccount.monthlyPayment.linkedAccountId}
                      label="Link to Savings Account"
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          monthlyPayment: newAccount.monthlyPayment
                            ? { ...newAccount.monthlyPayment, linkedAccountId: e.target.value }
                            : null,
                        })
                      }
                    >
                      {savingsAccounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.balance)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddAccount}
              variant="contained"
              disabled={!newAccount.name || (newAccount.type === 'debt' && newAccount.balance === 0)}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogContent>
            {selectedAccount && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Account Name"
                  fullWidth
                  variant="outlined"
                  value={selectedAccount.name}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                  sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  value={selectedAccount.description}
                  onChange={(e) => setSelectedAccount({ ...selectedAccount, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Amount"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={Math.abs(selectedAccount.balance)}
                  onChange={(e) =>
                    setSelectedAccount({ ...selectedAccount, balance: parseFloat(e.target.value) || 0 })
                  }
                  sx={{ mb: 2 }}
                />
                <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                  <FormLabel component="legend">Account Type</FormLabel>
                  <RadioGroup
                    row
                    value={selectedAccount.type}
                    onChange={(e) =>
                      setSelectedAccount({
                        ...selectedAccount,
                        type: e.target.value as 'savings' | 'debt',
                        dueDate:
                          e.target.value === 'debt'
                            ? selectedAccount.dueDate || new Date().toISOString().split('T')[0]
                            : null,
                      })
                    }
                  >
                    <FormControlLabel value="savings" control={<Radio />} label="Savings/Asset" />
                    <FormControlLabel value="debt" control={<Radio />} label="Debt/Liability" />
                  </RadioGroup>
                </FormControl>
                {selectedAccount.type === 'debt' && (
                  <>
                    <TextField
                      margin="dense"
                      label="Due Date"
                      type="date"
                      fullWidth
                      variant="outlined"
                      value={selectedAccount.dueDate || ''}
                      onChange={(e) => setSelectedAccount({ ...selectedAccount, dueDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="dense"
                      label="Monthly Payment Amount"
                      type="number"
                      fullWidth
                      variant="outlined"
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
                      sx={{ mb: 2 }}
                    />
                    {selectedAccount.monthlyPayment && selectedAccount.monthlyPayment.amount > 0 && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Link to Savings Account</InputLabel>
                        <Select
                          value={selectedAccount.monthlyPayment.linkedAccountId}
                          label="Link to Savings Account"
                          onChange={(e) =>
                            setSelectedAccount({
                              ...selectedAccount,
                              monthlyPayment: selectedAccount.monthlyPayment
                                ? { ...selectedAccount.monthlyPayment, linkedAccountId: e.target.value }
                                : null,
                            })
                          }
                        >
                          {savingsAccounts
                            .filter(acc => acc.id !== selectedAccount.id)
                            .map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.balance)})
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteAccount} color="error">
              Delete
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateAccount}
              variant="contained"
              disabled={!selectedAccount?.name || (selectedAccount?.type === 'debt' && selectedAccount?.balance === 0)}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sweep Balance Dialog */}
        <Dialog open={isSweepDialogOpen} onClose={() => setIsSweepDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Sweep Balance</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Would you like to sweep the remaining balance into an existing account?
            </Typography>
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <RadioGroup
                value={sweepTargetAccountId}
                onChange={(e) => setSweepTargetAccountId(e.target.value)}
              >
                {accounts
                  .filter(acc => acc.type === selectedAccount?.type && acc.id !== selectedAccount?.id)
                  .map((account) => (
                    <FormControlLabel
                      key={account.id}
                      value={account.id}
                      control={<Radio />}
                      label={`${account.name} (${formatCurrency(account.balance)})`}
                    />
                  ))}
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSweepDialogOpen(false)}>No</Button>
            <Button
              onClick={() => {
                if (sweepTargetAccountId) {
                  performDeleteAccount(sweepTargetAccountId);
                } else {
                  setIsCreatingAccountForSweep(true);
                  setIsAddDialogOpen(true);
                  setIsSweepDialogOpen(false);
                }
              }}
              variant="contained"
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
};

export default Home;
