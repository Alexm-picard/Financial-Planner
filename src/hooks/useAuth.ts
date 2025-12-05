import { useState, useEffect, useCallback } from 'react';
import { getUser, isAuthenticated, login, logout, getAccessTokenSilently, auth0Client } from '@/lib/auth0';

/**
 * Custom hook to provide Auth0 authentication state and methods
 * Uses @auth0/auth0-spa-js directly instead of React SDK
 */
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      if (!auth0Client) {
        setIsLoading(true);
        return;
      }

      const authenticated = await isAuthenticated();
      setIsAuthenticatedState(authenticated);
      
      if (authenticated) {
        const userData = await getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Auth check error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout | null = null;

    const initCheck = async () => {
      // Wait for auth0Client to be initialized
      let attempts = 0;
      while (!auth0Client && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (mounted && auth0Client) {
        await checkAuth();
        
        // Set up polling to check auth state periodically (every 2 seconds)
        // This ensures we catch auth state changes after callbacks
        interval = setInterval(() => {
          if (mounted && auth0Client) {
            checkAuth();
          }
        }, 2000);
      } else if (mounted) {
        setIsLoading(false);
      }
    };

    initCheck();

    // Also check when URL changes (handles callback)
    const handleLocationChange = () => {
      if (mounted && auth0Client) {
        checkAuth();
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [checkAuth]);

  const loginWithRedirect = async (options?: { screen_hint?: string; connection?: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(options);
      // Note: login() will redirect, so we won't reach here
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      // Clear local state immediately
      setUser(null);
      setIsAuthenticatedState(false);
      // Note: logout() will redirect, so we might not reach here
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const getToken = async (options?: { audience?: string }) => {
    try {
      return await getAccessTokenSilently(options);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return {
    user: user || null,
    isLoading,
    isAuthenticated: isAuthenticatedState,
    error,
    loginWithRedirect,
    logout: handleLogout,
    getAccessTokenSilently: getToken,
    refreshUser,
  };
};

