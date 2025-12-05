const axios = require('axios');

/**
 * Auth0 Management API Helper Functions
 * 
 * These functions use client_credentials grant to authenticate with Auth0 Management API.
 * Requires a Machine-to-Machine (M2M) application in Auth0.
 * 
 * Environment variables required:
 * - AUTH0_DOMAIN: Your Auth0 tenant domain (e.g., "your-tenant.auth0.com")
 * - AUTH0_M2M_CLIENT_ID: Machine-to-Machine application Client ID
 * - AUTH0_M2M_CLIENT_SECRET: Machine-to-Machine application Client Secret
 */

// Cache for the access token to avoid unnecessary requests
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get a Management API access token using client_credentials grant
 * 
 * This function:
 * 1. Makes a POST request to Auth0's /oauth/token endpoint
 * 2. Uses client_credentials grant type (Machine-to-Machine)
 * 3. Requests token for the Management API audience
 * 4. Returns the access token for use in Management API calls
 * 
 * @returns {Promise<string>} Access token for Management API
 */
async function getManagementToken() {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached Management API token');
    return cachedToken;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      'Auth0 Management API credentials not configured. ' +
      'Please set AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, and AUTH0_M2M_CLIENT_SECRET in your .env file.'
    );
  }

  try {
    console.log('Requesting Management API token from Auth0...');
    
    // Request token using client_credentials grant
    const response = await axios.post(`https://${domain}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials'
    });

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('No access token received from Auth0');
    }

    // Cache the token (expires_in is in seconds, convert to milliseconds)
    // Subtract 60 seconds as a safety margin
    cachedToken = access_token;
    tokenExpiry = Date.now() + ((expires_in - 60) * 1000);

    console.log('Successfully obtained Management API token');
    return access_token;

  } catch (error) {
    console.error('Failed to get Management API token:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Clear cached token on error
    cachedToken = null;
    tokenExpiry = null;

    // Provide helpful error messages
    if (error.response?.status === 403) {
      throw new Error(
        'Auth0 rejected client_credentials grant. ' +
        'Ensure your application is a Machine-to-Machine type and is authorized for Management API.'
      );
    }

    if (error.response?.status === 401) {
      throw new Error(
        'Invalid Auth0 credentials. ' +
        'Check AUTH0_M2M_CLIENT_ID and AUTH0_M2M_CLIENT_SECRET in your .env file.'
      );
    }

    throw new Error(`Failed to get Management API token: ${error.message}`);
  }
}

/**
 * Check if a custom user ID is already taken by another user
 * 
 * This function:
 * 1. Searches Auth0 users for the customUserId in app_metadata
 * 2. Excludes the current user from the search
 * 3. Returns true if available, false if taken
 * 
 * @param {string} customId - The custom user ID to check
 * @param {string} token - Management API access token
 * @param {string} currentAuth0UserId - Current user's Auth0 ID (to exclude from check)
 * @returns {Promise<boolean>} True if available, false if taken
 */
async function checkCustomIdAvailability(customId, token, currentAuth0UserId = null) {
  const domain = process.env.AUTH0_DOMAIN;

  if (!domain) {
    throw new Error('AUTH0_DOMAIN not configured');
  }

  if (!token) {
    throw new Error('Management API token is required');
  }

  try {
    console.log(`Checking availability of custom ID: ${customId}`);

    // Search for users with this customUserId in app_metadata
    // Auth0 search uses Lucene query syntax
    const searchQuery = `app_metadata.customUserId:"${customId}"`;
    
    const response = await axios.get(
      `https://${domain}/api/v2/users`,
      {
        params: {
          search_engine: 'v3',
          q: searchQuery
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const users = response.data || [];

    // Filter out the current user if provided
    const otherUsers = currentAuth0UserId 
      ? users.filter(user => user.user_id !== currentAuth0UserId)
      : users;

    const isAvailable = otherUsers.length === 0;

    console.log(`Custom ID "${customId}" is ${isAvailable ? 'available' : 'taken'}`);
    
    return isAvailable;

  } catch (error) {
    console.error('Failed to check custom ID availability:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // If it's an auth error, re-throw with helpful message
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(
        'Auth0 Management API authentication failed. ' +
        'Check that your Machine-to-Machine app is authorized with read:users permission.'
      );
    }

    throw new Error(`Failed to check custom ID availability: ${error.message}`);
  }
}

/**
 * Update a user's custom user ID in Auth0 app_metadata
 * 
 * This function:
 * 1. Makes a PATCH request to update the user's app_metadata
 * 2. Sets customUserId in the metadata
 * 3. Returns the updated user object
 * 
 * @param {string} auth0UserId - Auth0 user ID (e.g., "auth0|123456")
 * @param {string} customId - New custom user ID to set
 * @param {string} token - Management API access token
 * @returns {Promise<Object>} Updated user object from Auth0
 */
async function updateUserCustomId(auth0UserId, customId, token) {
  const domain = process.env.AUTH0_DOMAIN;

  if (!domain) {
    throw new Error('AUTH0_DOMAIN not configured');
  }

  if (!token) {
    throw new Error('Management API token is required');
  }

  try {
    console.log(`Updating custom ID for user ${auth0UserId} to "${customId}"`);

    // Update user's app_metadata with the custom ID
    // Note: This merges with existing app_metadata, it doesn't replace it
    const response = await axios.patch(
      `https://${domain}/api/v2/users/${auth0UserId}`,
      {
        app_metadata: {
          customUserId: customId
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Successfully updated custom ID in Auth0:', {
      userId: auth0UserId,
      customId: customId,
      timestamp: new Date().toISOString()
    });

    return response.data;

  } catch (error) {
    console.error('Failed to update custom ID in Auth0:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Provide helpful error messages
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(
        'Auth0 Management API authentication failed. ' +
        'Check that your Machine-to-Machine app is authorized with update:users permission.'
      );
    }

    if (error.response?.status === 404) {
      throw new Error(`User not found in Auth0: ${auth0UserId}`);
    }

    if (error.response?.status === 429) {
      throw new Error('Auth0 rate limit exceeded. Please try again later.');
    }

    throw new Error(`Failed to update custom ID in Auth0: ${error.message}`);
  }
}

/**
 * Update a user's display name in Auth0
 * 
 * This function:
 * 1. Makes a PATCH request to update the user's name field
 * 2. Updates the name property directly
 * 3. Returns the updated user object
 * 
 * @param {string} auth0UserId - Auth0 user ID (e.g., "auth0|123456")
 * @param {string} displayName - New display name to set
 * @param {string} token - Management API access token
 * @returns {Promise<Object>} Updated user object from Auth0
 */
async function updateUserDisplayName(auth0UserId, displayName, token) {
  const domain = process.env.AUTH0_DOMAIN;

  if (!domain) {
    throw new Error('AUTH0_DOMAIN not configured');
  }

  if (!token) {
    throw new Error('Management API token is required');
  }

  try {
    console.log(`Updating display name for user ${auth0UserId} to "${displayName}"`);

    // Update user's name field directly
    const response = await axios.patch(
      `https://${domain}/api/v2/users/${auth0UserId}`,
      {
        name: displayName
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Successfully updated display name in Auth0:', {
      userId: auth0UserId,
      displayName: displayName,
      timestamp: new Date().toISOString()
    });

    return response.data;

  } catch (error) {
    console.error('Failed to update display name in Auth0:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Provide helpful error messages
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(
        'Auth0 Management API authentication failed. ' +
        'Check that your Machine-to-Machine app is authorized with update:users permission.'
      );
    }

    if (error.response?.status === 404) {
      throw new Error(`User not found in Auth0: ${auth0UserId}`);
    }

    if (error.response?.status === 429) {
      throw new Error('Auth0 rate limit exceeded. Please try again later.');
    }

    throw new Error(`Failed to update display name in Auth0: ${error.message}`);
  }
}

/**
 * Get user data from Auth0 Management API
 * 
 * @param {string} auth0UserId - Auth0 user ID
 * @param {string} token - Management API access token (optional, will fetch if not provided)
 * @returns {Promise<Object>} User object from Auth0
 */
async function getAuth0User(auth0UserId, token = null) {
  const domain = process.env.AUTH0_DOMAIN;

  if (!domain) {
    throw new Error('AUTH0_DOMAIN not configured');
  }

  try {
    // Get token if not provided
    const accessToken = token || await getManagementToken();

    const response = await axios.get(
      `https://${domain}/api/v2/users/${auth0UserId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error('Failed to fetch user from Auth0:', {
      message: error.message,
      status: error.response?.status
    });

    if (error.response?.status === 404) {
      throw new Error(`User not found in Auth0: ${auth0UserId}`);
    }

    throw new Error(`Failed to fetch user from Auth0: ${error.message}`);
  }
}

module.exports = {
  getManagementToken,
  checkCustomIdAvailability,
  updateUserCustomId,
  updateUserDisplayName,
  getAuth0User
};

