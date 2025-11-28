import React, { useState } from 'react';
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
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase-config';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import AccountCard from '../components/dashboard/AccountCard';
import { Account } from '../types';
import { formatCurrency } from '../utils/formatters';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const Accounts: React.FC = () => {
  const [user] = useAuthState(auth);
  const { accounts, isLoading, updateAccount, deleteAccount } = useAccounts(user?.uid || null);
  const { addTransaction } = useTransactions(user?.uid || null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'savings' | 'debt'>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const debtAccounts = accounts.filter(acc => acc.type === 'debt');

  const filteredAccounts = selectedTab === 'all' 
    ? accounts 
    : selectedTab === 'savings' 
    ? savingsAccounts 
    : debtAccounts;

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Accounts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/'}
          >
            Add Account
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3,
            }}
          >
            <Tab label={`All (${accounts.length})`} value="all" />
            <Tab label={`Savings (${savingsAccounts.length})`} value="savings" />
            <Tab label={`Debt (${debtAccounts.length})`} value="debt" />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredAccounts.length === 0 ? (
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
              No {selectedTab === 'all' ? '' : selectedTab} accounts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTab === 'all' 
                ? 'Get started by adding your first account.'
                : `You don't have any ${selectedTab} accounts yet.`}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAccounts.map((account) => (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <AccountCard
                  account={account}
                  onEdit={handleEdit}
                  showActions={true}
                />
              </Grid>
            ))}
          </Grid>
        )}

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
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
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
      </Box>
  );
};

export default Accounts;
