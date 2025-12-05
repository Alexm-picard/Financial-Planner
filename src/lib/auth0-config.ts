// Auth0 configuration for React SDK
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// Validate Auth0 configuration
if (!auth0Domain || !auth0ClientId) {
  console.error('Auth0 configuration missing! Please add VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID to your .env file.');
  console.error('See AUTH0_QUICK_START.md for setup instructions.');
}

// Hardcoded base URL - must match Auth0 Dashboard configuration
const BASE_URL = 'http://localhost:8080';
const REDIRECT_URI = `${BASE_URL}/callback`;
const LOGOUT_REDIRECT_URI = BASE_URL;

export const auth0Config = {
  domain: auth0Domain || 'placeholder.auth0.com',
  clientId: auth0ClientId || 'placeholder',
  authorizationParams: {
    redirect_uri: REDIRECT_URI,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
    scope: 'openid profile email',
  },
  // Logout configuration - must match Auth0 Dashboard Allowed Logout URLs
  logoutParams: {
    returnTo: LOGOUT_REDIRECT_URI,
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};

