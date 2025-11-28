import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Slider,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { auth } from '../firebase-config';
import { updateProfile } from 'firebase/auth';
import PageHeader from '../components/layout/PageHeader';
import PremiumCard from '../components/atoms/PremiumCard';
import { colors, shadows } from '../design-tokens';

const Settings: React.FC = () => {
  const { settings, updateSettings, isLoading, error, availableThemes } = useSettings();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (auth.currentUser?.displayName) {
      setDisplayName(auth.currentUser.displayName);
    }
  }, []);

  if (!auth.currentUser) {
    navigate('/login');
    return null;
  }

  const handleFontSizeChange = async (_event: Event, newValue: number | number[]) => {
    try {
      await updateSettings('fontSize', newValue as number);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleSelectChange = async (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    try {
      await updateSettings(name as keyof typeof settings, value);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    try {
      await updateSettings(name as keyof typeof settings, checked);
      setShowSuccess(true);
    } catch (error) {
      // Error is handled by context
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Customize your financial planner experience"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <PremiumCard>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: colors.neutral[900],
                }}
              >
                Theme
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.darkMode}
                        onChange={handleSwitchChange}
                        name="darkMode"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.primary[500],
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.primary[500],
                          },
                        }}
                      />
                    }
                    label="Dark Mode"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: colors.neutral[700],
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Color Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      label="Color Theme"
                      name="theme"
                      onChange={handleSelectChange}
                    >
                      {availableThemes.map((theme) => (
                        <MenuItem key={theme} value={theme}>
                          {capitalizeFirstLetter(theme)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </PremiumCard>
        </Grid>

        {/* Typography Settings */}
        <Grid item xs={12} md={6}>
          <PremiumCard>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: colors.neutral[900],
                }}
              >
                Typography
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Font Family</InputLabel>
                    <Select
                      value={settings.fontFamily}
                      label="Font Family"
                      name="fontFamily"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="Roboto">Roboto</MenuItem>
                      <MenuItem value="Arial">Arial</MenuItem>
                      <MenuItem value="Helvetica">Helvetica</MenuItem>
                      <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                      color: colors.neutral[700],
                      mb: 2,
                    }}
                  >
                    Font Size: {settings.fontSize}px
                  </Typography>
                  <Slider
                    value={settings.fontSize}
                    onChange={handleFontSizeChange}
                    min={12}
                    max={24}
                    step={1}
                    marks
                    sx={{
                      '& .MuiSlider-thumb': {
                        color: colors.primary[500],
                      },
                      '& .MuiSlider-track': {
                        color: colors.primary[500],
                      },
                      '& .MuiSlider-rail': {
                        color: colors.neutral[200],
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </PremiumCard>
        </Grid>

        {/* Formatting Settings */}
        <Grid item xs={12} md={6}>
          <PremiumCard>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: colors.neutral[900],
                }}
              >
                Formatting
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Currency Symbol</InputLabel>
                    <Select
                      value={settings.currencySymbol}
                      label="Currency Symbol"
                      name="currencySymbol"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="$">$ (USD)</MenuItem>
                      <MenuItem value="€">€ (EUR)</MenuItem>
                      <MenuItem value="£">£ (GBP)</MenuItem>
                      <MenuItem value="¥">¥ (JPY)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      name="dateFormat"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </PremiumCard>
        </Grid>

        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <PremiumCard>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: colors.neutral[900],
                }}
              >
                Profile
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{
                        minHeight: 48,
                      }}
                    >
                      Update Profile
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </PremiumCard>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{
            borderRadius: '12px',
            boxShadow: shadows.md,
          }}
        >
          Settings saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
