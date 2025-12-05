const { ManagementClient } = require('auth0');

let managementClient = null;

/**
 * Get or create Auth0 Management API client
 * Uses client_credentials flow automatically
 * Reuses client instance for efficiency
 */
function getManagementClient() {
  if (!managementClient) {
    if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Auth0 Management API credentials not configured. Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET in your .env file.');
    }

    try {
      managementClient = new ManagementClient({
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        // The ManagementClient automatically uses client_credentials grant
        // and requests tokens for the Management API audience
        scope: 'read:users update:users'
      });
      
      console.log('Auth0 Management Client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Auth0 Management Client:', error);
      throw new Error(`Auth0 Management Client initialization failed: ${error.message}`);
    }
  }

  return managementClient;
}

/**
 * Update user's custom user ID in Auth0 user_metadata
 * @param {string} auth0UserId - Auth0 user ID (e.g., "auth0|123456")
 * @param {string} customUserId - New custom user ID
 * @returns {Promise<Object>} Updated user object
 */
async function updateUserCustomId(auth0UserId, customUserId) {
  const management = getManagementClient();

  try {
    const updatedUser = await management.users.update(
      { id: auth0UserId },
      {
        user_metadata: {
          custom_user_id: customUserId
        }
      }
    );

    console.log('User custom ID updated in Auth0:', {
      auth0UserId,
      customUserId,
      timestamp: new Date().toISOString()
    });

    return updatedUser;
  } catch (error) {
    // Check for specific Auth0 errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      let errorMessage = 'Auth0 Management API authentication failed. ';
      
      if (error.message && error.message.includes('client_credentials')) {
        errorMessage += 'Your application does not support Machine-to-Machine (client_credentials) grant. ';
        errorMessage += 'You need to create a Machine-to-Machine application in Auth0 Dashboard. ';
        errorMessage += 'See AUTH0_SETUP.md for instructions.';
      } else {
        errorMessage += 'Ensure your application is authorized for the Management API with update:users scope.';
      }
      
      console.error('Auth0 Management API authentication failed:', {
        message: error.message,
        statusCode: error.statusCode,
        hint: errorMessage
      });
      throw new Error(errorMessage);
    }

    console.error('Auth0 Management API error:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error
    });

    throw error;
  }
}

/**
 * Get user data from Auth0
 * @param {string} auth0UserId - Auth0 user ID
 * @returns {Promise<Object>} User object
 */
async function getAuth0User(auth0UserId) {
  const management = getManagementClient();

  try {
    const user = await management.users.get({ id: auth0UserId });
    return user;
  } catch (error) {
    console.error('Failed to fetch Auth0 user:', error.message);
    throw error;
  }
}

/**
 * Check if custom user ID is already taken by another user
 * @param {string} customUserId - Custom ID to check
 * @param {string} currentAuth0UserId - Current user's Auth0 ID (to exclude from check)
 * @returns {Promise<boolean>} True if available, false if taken
 */
async function isCustomUserIdAvailable(customUserId, currentAuth0UserId) {
  const management = getManagementClient();

  try {
    // Search for users with this custom_user_id in user_metadata
    // Note: Auth0 search query syntax requires v3 search engine
    const users = await management.users.getAll({
      search_engine: 'v3',
      q: `user_metadata.custom_user_id:"${customUserId}"`
    });

    // Filter out current user
    const otherUsers = users.data.filter(u => u.user_id !== currentAuth0UserId);

    return otherUsers.length === 0;
  } catch (error) {
    // Check for specific Auth0 errors
    if (error.statusCode === 401 || error.statusCode === 403) {
      let errorMessage = 'Auth0 Management API authentication failed. ';
      
      if (error.message && error.message.includes('client_credentials')) {
        errorMessage += 'Your application does not support Machine-to-Machine (client_credentials) grant. ';
        errorMessage += 'You need to create a Machine-to-Machine application in Auth0 Dashboard.';
      } else {
        errorMessage += 'Ensure your application is authorized for the Management API with read:users scope.';
      }
      
      console.error('Auth0 Management API authentication failed:', {
        message: error.message,
        statusCode: error.statusCode,
        hint: errorMessage
      });
      throw new Error(errorMessage);
    }
    
    if (error.statusCode === 429) {
      console.error('Auth0 rate limit exceeded');
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    console.error('Custom ID availability check failed:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error
    });
    
    // Re-throw to allow fallback handling in routes
    throw error;
  }
}

module.exports = {
  getManagementClient,
  updateUserCustomId,
  getAuth0User,
  isCustomUserIdAvailable
};

