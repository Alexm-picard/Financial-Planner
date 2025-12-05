import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0Client = null;

// Initialize Auth0
export async function initAuth0() {
  try {
    console.log('🔐 Setting up Auth0...');

    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      throw new Error('Auth0 configuration missing! Please add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to your .env file.');
    }

    // Dynamically set redirect URI - always redirect to /login after authentication
    const redirectUri = window.location.origin + '/login';
    console.log('Redirect URI:', redirectUri);

    auth0Client = await createAuth0Client({
      domain: domain,
      clientId: clientId,
      authorizationParams: {
        redirect_uri: redirectUri, // Will be https://financial-planner-final-final.web.app/login in prod
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
        scope: 'openid profile email',
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    });

    // Handle the callback after login
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
      console.log('✅ Handling login callback...');
      
      try {
        await auth0Client.handleRedirectCallback();
        
        // Redirect to home page after successful login
        // Using window.location.href ensures full page reload with updated auth state
        window.location.href = '/';
        
        console.log('✅ Login successful!');
      } catch (callbackError) {
        console.error('Callback error:', callbackError);
        throw callbackError;
      }
    }

    console.log('✅ Auth0 ready!');
    return auth0Client;
  } catch (error: any) {
    console.error('❌ Auth0 error:', error);
    alert(`Auth0 Error: ${error.message}`);
    throw error; // Re-throw to let the app handle it
  }
}

// Login function
export async function login(options?: { screen_hint?: string; connection?: string }) {
  if (!auth0Client) {
    console.error('Auth0 not initialized!');
    throw new Error('Auth0 not initialized. Please wait for initialization to complete.');
  }

  const loginOptions: any = {};
  
  if (options?.screen_hint) {
    loginOptions.screen_hint = options.screen_hint;
  }
  
  if (options?.connection) {
    loginOptions.connection = options.connection;
  }

  await auth0Client.loginWithRedirect(loginOptions);
}

// Logout function
export async function logout() {
  if (!auth0Client) {
    console.error('Auth0 not initialized!');
    return;
  }

  // Dynamically set logout return URL
  const returnTo = window.location.origin;

  await auth0Client.logout({
    logoutParams: {
      returnTo: returnTo, // Will be https://financial-planner-final-final.web.app in prod
    },
  });
}

// Check if user is logged in
export async function isAuthenticated() {
  if (!auth0Client) return false;
  return await auth0Client.isAuthenticated();
}

// Get user info
export async function getUser() {
  if (!auth0Client) return null;
  return await auth0Client.getUser();
}

// Get access token silently
export async function getAccessTokenSilently(options?: { audience?: string }) {
  if (!auth0Client) {
    throw new Error('Auth0 not initialized');
  }
  return await auth0Client.getTokenSilently(options);
}

export { auth0Client };

