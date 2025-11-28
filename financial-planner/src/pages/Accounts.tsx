import React, { useState, useMemo } from 'react';
import {
  Box,
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
  Tabs,
  Tab,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import AccountCard from '../components/dashboard/AccountCard';
import EmptyState from '../components/molecules/EmptyState';
import SkeletonCard from '../components/molecules/SkeletonCard';
import PageHeader from '../components/layout/PageHeader';
import { Account } from '../types';
import { formatCurrency } from '../utils/formatters';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { colors } from '../design-tokens';

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { accounts, isLoading, updateAccount, deleteAccount } = useAccounts(user?.uid || null);
  const { addTransaction } = useTransactions(user?.uid || null);
  
  const [selectedTab, setSelectedTab] = useState<'all' | 'savings' | 'debt'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'date'>('name');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const debtAccounts = accounts.filter(acc => acc.type === 'debt');

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = selectedTab === 'all' 
      ? accounts 
      : selectedTab === 'savings' 
      ? savingsAccounts 
      : debtAccounts;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return Math.abs(b.balance) - Math.abs(a.balance);
        case 'date':
          // Sort by creation date if available, otherwise by name
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [accounts, selectedTab, searchQuery, sortBy, savingsAccounts, debtAccounts]);

  const handleEdit = (account: Account) => {
    setSelectedAccount({ ...account });
    setIsEditDialogOpen(true);
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

  return (
    <Box>
      <PageHeader
        title="Accounts"
        subtitle="Manage your savings and debt accounts"
        action={{
          label: 'Add Account',
          icon: <AddIcon />,
          onClick: () => navigate('/'),
        }}
      />

      {/* Filters and Search */}
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
          placeholder="Search accounts..."
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
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value as 'name' | 'balance' | 'date')}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="balance">Balance</MenuItem>
            <MenuItem value="date">Date</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            borderBottom: `1px solid ${colors.neutral[200]}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9375rem',
              minHeight: 48,
            },
            '& .Mui-selected': {
              fontWeight: 600,
              color: colors.primary[500],
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All
                <Chip
                  label={accounts.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: selectedTab === 'all' ? colors.primary[50] : colors.neutral[100],
                    color: selectedTab === 'all' ? colors.primary[600] : colors.neutral[600],
                  }}
                />
              </Box>
            }
            value="all"
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Savings
                <Chip
                  label={savingsAccounts.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: selectedTab === 'savings' ? colors.success[50] : colors.neutral[100],
                    color: selectedTab === 'savings' ? colors.success[600] : colors.neutral[600],
                  }}
                />
              </Box>
            }
            value="savings"
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Debt
                <Chip
                  label={debtAccounts.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: selectedTab === 'debt' ? colors.error[50] : colors.neutral[100],
                    color: selectedTab === 'debt' ? colors.error[600] : colors.neutral[600],
                  }}
                />
              </Box>
            }
            value="debt"
          />
        </Tabs>
      </Box>

      {/* Results */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      ) : filteredAndSortedAccounts.length === 0 ? (
        <EmptyState
          icon={
            searchQuery ? (
              <SearchIcon sx={{ fontSize: 64 }} />
            ) : selectedTab === 'savings' ? (
              <AccountBalanceIcon sx={{ fontSize: 64 }} />
            ) : selectedTab === 'debt' ? (
              <CreditCardIcon sx={{ fontSize: 64 }} />
            ) : (
              <AccountBalanceIcon sx={{ fontSize: 64 }} />
            )
          }
          title={
            searchQuery
              ? 'No accounts found'
              : `No ${selectedTab === 'all' ? '' : selectedTab} accounts yet`
          }
          description={
            searchQuery
              ? `No accounts match "${searchQuery}". Try a different search term.`
              : selectedTab === 'all'
              ? 'Get started by adding your first account to track your finances.'
              : `You don't have any ${selectedTab} accounts yet. Add one to get started.`
          }
          action={
            !searchQuery
              ? {
                  label: 'Add Account',
                  onClick: () => navigate('/'),
                }
              : undefined
          }
        />
      ) : (
        <>
          {searchQuery && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: colors.neutral[500] }}>
                Found {filteredAndSortedAccounts.length} account{filteredAndSortedAccounts.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Typography>
            </Box>
          )}
          <Grid container spacing={3}>
            {filteredAndSortedAccounts.map((account) => (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <AccountCard
                  account={account}
                  onEdit={handleEdit}
                  showActions={true}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colors.neutral[900] }}>Edit Account</DialogTitle>
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
                <FormLabel component="legend" sx={{ fontWeight: 600, color: colors.neutral[900] }}>
                  Account Type
                </FormLabel>
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
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAccount}
            variant="contained"
            disabled={!selectedAccount?.name || (selectedAccount?.type === 'debt' && selectedAccount?.balance === 0)}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;
