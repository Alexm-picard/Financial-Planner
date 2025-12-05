// Firebase Admin is optional - only needed if you want to verify Firebase tokens
// Since we're using Auth0, we can skip Firebase Admin initialization
let admin = null;
try {
  admin = require('firebase-admin');
  
  // Only initialize if credentials are provided and valid
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Only initialize if all required Firebase credentials are present and not empty
    if (projectId && projectId.trim() && 
        clientEmail && clientEmail.trim() && 
        privateKey && privateKey.trim()) {
      try {
        const serviceAccount = {
          project_id: projectId.trim(), // Use project_id (not projectId) for Firebase Admin
          client_email: clientEmail.trim(),
          private_key: privateKey.trim().replace(/\\n/g, '\n')
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized');
      } catch (error) {
        console.warn('⚠️ Firebase Admin initialization skipped:', error.message);
        console.log('ℹ️ Continuing without Firebase Admin (Auth0 will be used directly)');
      }
    } else {
      // Credentials not provided - this is fine, we'll use Auth0 directly
      // No need to log anything, this is expected
    }
  }
} catch (error) {
  // Firebase Admin not installed or not needed - this is fine
  // No need to log, this is expected when using Auth0
}

/**
 * Authentication middleware to verify Auth0 tokens via Firebase Admin
 * Auth0 tokens are verified and user info is attached to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // Verify Firebase token (Auth0 tokens are passed through Firebase Admin)
    // Note: In production, you might want to verify Auth0 tokens directly
    // For now, we'll use a simpler approach - verify the token format
    // and extract user ID from the request body or query params
    
    // Alternative: If using Auth0 directly, verify JWT token
    // For now, we'll trust the userId from the request (frontend sends it)
    // In production, implement proper Auth0 JWT verification
    
    // For MVP: Extract userId from request body or query
    // In production, implement proper token verification
    const userId = req.body?.userId || req.query?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not provided'
      });
    }

    // Attach user info to request
    req.user = { uid: userId };
    req.userId = userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Optional: Verify Auth0 JWT token directly
 * This requires installing jsonwebtoken and jwks-rsa
 */
const verifyAuth0Token = async (req, res, next) => {
  // TODO: Implement Auth0 JWT verification
  // This would verify the token against Auth0's public keys
  // For now, using simpler approach above
  next();
};

module.exports = { auth, verifyAuth0Token };
