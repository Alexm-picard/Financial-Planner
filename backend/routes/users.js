const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
// Use the simple implementation that manually handles token flow
const { 
  getManagementToken,
  updateUserCustomId,
  updateUserDisplayName,
  getAuth0User,
  checkCustomIdAvailability 
} = require('../utils/auth0ManagementSimple');

const router = express.Router();

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Protected
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create or update user
// @access  Public (called from callback)
router.post('/', async (req, res) => {
  try {
    const { uid, name, email, picture } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'User ID (uid) is required'
      });
    }

    // Find existing user or create new one
    let user = await User.findOne({ uid });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      user.picture = picture || user.picture;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        uid,
        name,
        email,
        picture
      });
    }

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Protected
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/users/me/custom-id
// @desc    Get current user's custom ID from Auth0
// @access  Protected
router.get('/me/custom-id', auth, async (req, res) => {
  try {
    const userId = req.userId || req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not provided'
      });
    }

    // Try to get from Auth0 first
    try {
      const auth0User = await getAuth0User(userId);
      // Check both app_metadata and user_metadata for backward compatibility
      const customUserId = auth0User?.app_metadata?.customUserId || 
                           auth0User?.user_metadata?.custom_user_id || 
                           null;

      // Also sync to MongoDB for backward compatibility
      const mongoUser = await User.findOne({ uid: userId });
      if (mongoUser && mongoUser.customUserId !== customUserId) {
        mongoUser.customUserId = customUserId;
        await mongoUser.save();
      }

      return res.json({
        success: true,
        customUserId: customUserId,
        systemUserId: userId // Include system ID for reference (not displayed in UI)
      });
    } catch (auth0Error) {
      console.warn('Failed to fetch from Auth0, falling back to MongoDB:', auth0Error.message);
      
      // Fallback to MongoDB if Auth0 fails
      const user = await User.findOne({ uid: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.json({
        success: true,
        customUserId: user.customUserId || null,
        systemUserId: user.uid
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/users/me/custom-id/check
// @desc    Check if custom user ID is available (checks Auth0)
// @access  Protected
router.post('/me/custom-id/check', auth, async (req, res) => {
  try {
    const { customUserId } = req.body;
    const userId = req.userId || req.user?.uid;

    if (!customUserId) {
      return res.status(400).json({
        success: false,
        error: 'Custom User ID is required'
      });
    }

    // Get Management API token
    let token;
    try {
      token = await getManagementToken();
    } catch (tokenError) {
      console.warn('Failed to get Management API token, falling back to MongoDB:', tokenError.message);
    }

    // Check Auth0 first (if we have a token)
    if (token) {
      try {
        const available = await checkCustomIdAvailability(customUserId.toLowerCase(), token, userId);
        return res.json({
          success: true,
          available: available
        });
      } catch (auth0Error) {
        console.warn('Auth0 check failed, falling back to MongoDB:', auth0Error.message);
      }
    }
    
    // Fallback to MongoDB check
    const existingUser = await User.findOne({ 
      customUserId: customUserId.toLowerCase(),
      uid: { $ne: userId }
    });

    return res.json({
      success: true,
      available: !existingUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   PUT /api/users/me/custom-id
// @desc    Update current user's custom ID in Auth0 and MongoDB
// @access  Protected
router.put('/me/custom-id', auth, async (req, res) => {
  try {
    const { customUserId } = req.body;
    const userId = req.userId || req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not provided'
      });
    }

    if (!customUserId) {
      return res.status(400).json({
        success: false,
        error: 'Custom User ID is required'
      });
    }

    // Validate format
    const normalizedCustomId = customUserId.toLowerCase().trim();
    if (normalizedCustomId.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Custom User ID must be at least 3 characters'
      });
    }

    if (normalizedCustomId.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Custom User ID cannot exceed 50 characters'
      });
    }

    if (!/^[a-z0-9_-]+$/.test(normalizedCustomId)) {
      return res.status(400).json({
        success: false,
        error: 'Custom User ID can only contain lowercase letters, numbers, hyphens, and underscores'
      });
    }

    // Get Management API token
    let token;
    try {
      token = await getManagementToken();
    } catch (tokenError) {
      console.error('Failed to get Management API token:', tokenError.message);
      // Continue with MongoDB-only update if token fetch fails
    }

    // Check if custom ID is already taken by another user (check Auth0)
    if (token) {
      try {
        const isAvailable = await checkCustomIdAvailability(normalizedCustomId, token, userId);
        if (!isAvailable) {
          return res.status(409).json({
            success: false,
            error: 'This Custom User ID is already taken. Please choose another one.'
          });
        }
      } catch (auth0Error) {
        console.warn('Auth0 availability check failed, checking MongoDB:', auth0Error.message);
      }
    }
    
    // Fallback to MongoDB check
    const existingUser = await User.findOne({ 
      customUserId: normalizedCustomId,
      uid: { $ne: userId }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'This Custom User ID is already taken. Please choose another one.'
      });
    }

    // Update in Auth0 first (if we have a token)
    if (token) {
      try {
        await updateUserCustomId(userId, normalizedCustomId, token);
        console.log('Successfully updated custom ID in Auth0');
      } catch (auth0Error) {
        console.error('Failed to update in Auth0:', auth0Error);
        
        // Handle specific Auth0 errors
        if (auth0Error.statusCode === 429) {
          return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
          });
        }

        if (auth0Error.statusCode === 401 || auth0Error.statusCode === 403) {
          // Check if it's a client_credentials error
          if (auth0Error.message && auth0Error.message.includes('client_credentials')) {
            return res.status(500).json({
              success: false,
              error: 'Machine-to-Machine application required',
              message: 'Your Auth0 application does not support client_credentials grant. You need to create a Machine-to-Machine application. See AUTH0_SETUP.md for instructions.',
              fallback: 'Custom ID saved to database only (not synced to Auth0)'
            });
          }
          
          return res.status(500).json({
            success: false,
            error: 'Server authentication with Auth0 failed. Please contact support.',
            message: auth0Error.message
          });
        }

        // If Auth0 fails but we can still update MongoDB, continue
        console.warn('Auth0 update failed, updating MongoDB only:', auth0Error.message);
      }
    }

    // Also update MongoDB for backward compatibility
    try {
      const user = await User.findOneAndUpdate(
        { uid: userId },
        { customUserId: normalizedCustomId },
        { new: true, runValidators: true }
      );

      if (!user) {
        // User doesn't exist in MongoDB, but that's okay if Auth0 update succeeded
        console.warn('User not found in MongoDB, but Auth0 update may have succeeded');
      }
    } catch (mongoError) {
      // Handle duplicate key error
      if (mongoError.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'This Custom User ID is already taken. Please choose another one.'
        });
      }
      console.error('MongoDB update error:', mongoError);
    }

    res.json({
      success: true,
      customUserId: normalizedCustomId,
      message: 'Custom User ID updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error updating custom user ID:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update Custom User ID. Please try again.'
    });
  }
});

// @route   PUT /api/users/me/display-name
// @desc    Update current user's display name in Auth0 and MongoDB
// @access  Protected
router.put('/me/display-name', auth, async (req, res) => {
  try {
    const { displayName } = req.body;
    const userId = req.userId || req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not provided'
      });
    }

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Display name is required'
      });
    }

    const trimmedDisplayName = displayName.trim();

    // Get Management API token
    let token;
    try {
      token = await getManagementToken();
    } catch (tokenError) {
      console.error('Failed to get Management API token:', tokenError.message);
      // Continue with MongoDB-only update if token fetch fails
    }

    // Update in Auth0 first (if we have a token)
    if (token) {
      try {
        await updateUserDisplayName(userId, trimmedDisplayName, token);
        console.log('Successfully updated display name in Auth0');
      } catch (auth0Error) {
        console.error('Failed to update in Auth0:', auth0Error);
        
        // Handle specific Auth0 errors
        if (auth0Error.statusCode === 429) {
          return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
          });
        }

        if (auth0Error.statusCode === 401 || auth0Error.statusCode === 403) {
          // Check if it's a client_credentials error
          if (auth0Error.message && auth0Error.message.includes('client_credentials')) {
            return res.status(500).json({
              success: false,
              error: 'Machine-to-Machine application required',
              message: 'Your Auth0 application does not support client_credentials grant. You need to create a Machine-to-Machine application. See AUTH0_SETUP.md for instructions.',
              fallback: 'Display name saved to database only (not synced to Auth0)'
            });
          }
          
          return res.status(500).json({
            success: false,
            error: 'Server authentication with Auth0 failed. Please contact support.',
            message: auth0Error.message
          });
        }

        // If Auth0 fails but we can still update MongoDB, continue
        console.warn('Auth0 update failed, updating MongoDB only:', auth0Error.message);
      }
    }

    // Also update MongoDB for backward compatibility
    try {
      const user = await User.findOneAndUpdate(
        { uid: userId },
        { name: trimmedDisplayName },
        { new: true, runValidators: true }
      );

      if (!user) {
        // User doesn't exist in MongoDB, but that's okay if Auth0 update succeeded
        console.warn('User not found in MongoDB, but Auth0 update may have succeeded');
      }
    } catch (mongoError) {
      console.error('MongoDB update error:', mongoError);
    }

    res.json({
      success: true,
      displayName: trimmedDisplayName,
      message: 'Display name updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error updating display name:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update Display Name. Please try again.'
    });
  }
});

module.exports = router;
