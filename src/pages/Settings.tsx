import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState<string | null>(null);
  const [customUserId, setCustomUserId] = useState('');
  const [originalCustomUserId, setOriginalCustomUserId] = useState<string | null>(null);
  const [loadingDisplayName, setLoadingDisplayName] = useState(false);
  const [loadingCustomId, setLoadingCustomId] = useState(false); // For initial load
  const [savingCustomId, setSavingCustomId] = useState(false); // For save operation
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [customIdError, setCustomIdError] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user data
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      setOriginalDisplayName(user.name);
    }
  }, [user]);

  // Load custom user ID
  useEffect(() => {
    const loadCustomUserId = async () => {
      if (!user?.sub) {
        setLoadingCustomId(false);
        setLoadError(null);
        return;
      }

      try {
        setLoadingCustomId(true);
        setLoadError(null);
        
        const response = await userService.getCustomUserId(user.sub);
        
        setCustomUserId(response.customUserId || '');
        setOriginalCustomUserId(response.customUserId || null);
        setLoadError(null);
      } catch (error: any) {
        console.error('Error loading custom user ID:', error);
        
        // Determine user-friendly error message
        let errorMessage = 'Failed to load custom user ID';
        if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setLoadError(errorMessage);
        // Set empty values on error so user can still interact
        setCustomUserId('');
        setOriginalCustomUserId(null);
      } finally {
        // ALWAYS clear loading state, even on error
        setLoadingCustomId(false);
      }
    };

    loadCustomUserId();
  }, [user]);

  const handleUpdateDisplayName = async () => {
    if (!user?.sub) return;

    if (displayName === originalDisplayName) {
      toast({
        title: 'No changes',
        description: 'Display name has not changed',
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: 'Error',
        description: 'Display name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setLoadingDisplayName(true);
    try {
      const updatedDisplayName = await userService.updateDisplayName(user.sub, displayName);
      setOriginalDisplayName(updatedDisplayName);
      
      // Update local user state immediately so UI updates right away
      if (user) {
        user.name = updatedDisplayName;
      }
      
      toast({
        title: 'Success',
        description: 'Display name updated successfully!',
      });
      
      // Refresh user data from Auth0 to ensure consistency
      // This will update all references to user.name throughout the app
      await refreshUser();
    } catch (error: any) {
      console.error('Error updating display name:', error);
      const errorMessage = error.message || 'Failed to update display name';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingDisplayName(false);
    }
  };

  const handleCustomUserIdChange = (value: string) => {
    setCustomUserId(value);
    setCustomIdError('');

    // Basic validation
    if (value && value.length < 3) {
      setCustomIdError('Custom User ID must be at least 3 characters');
      return;
    }

    if (value && value.length > 50) {
      setCustomIdError('Custom User ID cannot exceed 50 characters');
      return;
    }

    if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
      setCustomIdError('Custom User ID can only contain letters, numbers, hyphens, and underscores');
      return;
    }
  };

  // Debounce timer for availability check
  const availabilityCheckTimer = useRef<NodeJS.Timeout | null>(null);

  const handleCheckAvailability = async () => {
    if (!user?.sub || !customUserId || customUserId === originalCustomUserId) {
      setCustomIdError('');
      return;
    }

    // Don't check if there are validation errors
    if (customIdError && !customIdError.includes('already taken')) {
      return;
    }

    // Clear previous timer
    if (availabilityCheckTimer.current) {
      clearTimeout(availabilityCheckTimer.current);
    }

    // Debounce: wait 500ms after user stops typing
    availabilityCheckTimer.current = setTimeout(async () => {
      try {
        setCheckingAvailability(true);
        const available = await userService.checkCustomUserIdAvailability(user.sub, customUserId);
        
        if (!available) {
          setCustomIdError('This Custom User ID is already taken. Please choose another one.');
        } else {
          // Clear error if it was about availability
          if (customIdError.includes('already taken')) {
            setCustomIdError('');
          }
        }
      } catch (error: any) {
        console.error('Error checking availability:', error);
        // Don't set error if it's just a network issue - let user try to save
        if (error.message?.includes('already taken') || error.message?.includes('409')) {
          setCustomIdError('This Custom User ID is already taken. Please choose another one.');
        }
        // Silently fail for network errors - user can still try to save
      } finally {
        setCheckingAvailability(false);
      }
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (availabilityCheckTimer.current) {
        clearTimeout(availabilityCheckTimer.current);
      }
    };
  }, []);

  const handleUpdateCustomUserId = async () => {
    if (!user?.sub) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your custom user ID',
        variant: 'destructive',
      });
      return;
    }

    if (!customUserId.trim()) {
      setCustomIdError('Custom User ID is required');
      return;
    }

    if (customUserId === originalCustomUserId) {
      toast({
        title: 'No changes',
        description: 'Custom User ID has not changed',
      });
      return;
    }

    if (customIdError && !customIdError.includes('already taken')) {
      return;
    }

    // Validate format before saving
    const trimmed = customUserId.trim();
    if (trimmed.length < 3) {
      setCustomIdError('Custom User ID must be at least 3 characters');
      return;
    }
    if (trimmed.length > 50) {
      setCustomIdError('Custom User ID cannot exceed 50 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setCustomIdError('Custom User ID can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setSavingCustomId(true);
    setCustomIdError('');
    
    try {
      const updatedCustomId = await userService.updateCustomUserId(user.sub, trimmed);
      setOriginalCustomUserId(updatedCustomId);
      setCustomUserId(updatedCustomId); // Update to normalized value
      setCustomIdError('');
      setLoadError(null);
      
      toast({
        title: 'Success',
        description: 'Custom User ID updated successfully!',
      });
    } catch (error: any) {
      console.error('Error updating custom user ID:', error);
      
      // Determine user-friendly error message
      let errorMessage = 'Failed to update Custom User ID';
      
      if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Cannot connect to server. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('already taken') || error.message?.includes('409')) {
        errorMessage = 'This Custom User ID is already taken. Please choose another one.';
      } else if (error.message?.includes('client_credentials') || error.message?.includes('Machine-to-Machine')) {
        errorMessage = 'Server configuration issue. Custom ID saved to database only.';
        toast({
          title: 'Configuration Required',
          description: 'You need to create a Machine-to-Machine application in Auth0. Custom ID saved to database only.',
          variant: 'destructive',
          duration: 8000,
        });
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCustomIdError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // ALWAYS clear saving state, even on error
      setSavingCustomId(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your financial planner experience</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    disabled={loadingDisplayName}
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateDisplayName}
                    disabled={loadingDisplayName || displayName === originalDisplayName || !displayName.trim()}
                  >
                    {loadingDisplayName ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customUserId">Custom User ID</Label>
                {loadingCustomId && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </p>
                )}
                {loadError && (
                  <p className="text-sm text-destructive mb-2">
                    ⚠️ {loadError} You can still set a custom user ID below.
                  </p>
                )}
                <div className="flex gap-2">
                  <Input
                    id="customUserId"
                    value={customUserId}
                    onChange={(e) => handleCustomUserIdChange(e.target.value)}
                    placeholder="Enter your custom user ID"
                    disabled={savingCustomId} // Only disable during save, not during load
                    className={customIdError ? 'border-destructive' : ''}
                    onBlur={handleCheckAvailability}
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateCustomUserId}
                    disabled={
                      savingCustomId || 
                      loadingCustomId || 
                      checkingAvailability || 
                      (!!customIdError && !customIdError.includes('already taken')) || 
                      customUserId === originalCustomUserId || 
                      !customUserId.trim()
                    }
                  >
                    {savingCustomId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
                {customIdError && (
                  <p className="text-sm text-destructive">{customIdError}</p>
                )}
                {!customIdError && !savingCustomId && customUserId && customUserId !== originalCustomUserId && (
                  <p className="text-sm text-muted-foreground">
                    Click "Save" to update your Custom User ID
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Choose a unique ID (3-50 characters, letters, numbers, hyphens, and underscores only)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Financial Planner Information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                This financial planner helps you manage your savings and debt accounts, track transactions, and analyze your financial health.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

