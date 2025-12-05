# Custom User ID Feature - Complete Fix

## What Was Fixed

### 1. **Component State Management** ✅
- **Separated loading states**: `loadingCustomId` (initial load) vs `savingCustomId` (save operation)
- **Input field**: Only disabled during save, NOT during initial load
- **Error handling**: All error paths properly clear loading states
- **User feedback**: Clear error messages displayed to users

### 2. **API Client Configuration** ✅
- **Relative URLs**: Uses `/api/*` in production (works with Nginx proxy)
- **Timeout**: 10-second timeout prevents hanging requests
- **Error messages**: User-friendly error messages for all scenarios
- **Auth0 tokens**: Properly included in Authorization header

### 3. **Backend Endpoint** ✅
- **GET `/api/users/me/custom-id`**: Fetches current custom ID
- **PUT `/api/users/me/custom-id`**: Updates custom ID
- **POST `/api/users/me/custom-id/check`**: Checks availability
- **Validation**: Format validation (3-50 chars, alphanumeric + dash/underscore)
- **Uniqueness**: Checks both Auth0 and MongoDB
- **Error responses**: Proper HTTP status codes (400, 409, 500)

### 4. **MongoDB Integration** ✅
- **Schema**: User model with `customUserId` field
- **Index**: Unique index on `customUserId` (sparse, allows nulls)
- **Validation**: Schema-level validation
- **Error handling**: Graceful handling of duplicate key errors

### 5. **Error Handling** ✅
- **Network errors**: "Cannot connect to server" message
- **Validation errors**: Specific format error messages
- **Duplicate errors**: "This user ID is already taken"
- **Auth errors**: "Please log in again"
- **Loading states**: Always cleared on ANY error

## Key Changes Made

### Frontend (`src/pages/Settings.tsx`)

1. **Separated Loading States**:
   ```typescript
   const [loadingCustomId, setLoadingCustomId] = useState(false); // Initial load
   const [savingCustomId, setSavingCustomId] = useState(false); // Save operation
   ```

2. **Input Field Only Disabled During Save**:
   ```typescript
   disabled={savingCustomId} // NOT loadingCustomId
   ```

3. **Error Handling Always Clears State**:
   ```typescript
   } finally {
     setLoadingCustomId(false); // ALWAYS clears
   }
   ```

4. **Debounced Availability Check**:
   - Waits 500ms after user stops typing
   - Prevents excessive API calls

### API Service (`src/services/api.ts`)

1. **Relative URLs**:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 
     (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');
   ```

2. **Timeout**:
   ```typescript
   timeout: 10000, // 10 seconds
   ```

3. **User-Friendly Error Messages**:
   - Network errors → "Cannot connect to server"
   - Timeout → "Request timed out"
   - 409 → "This value is already taken"
   - 500+ → "Server error"

## Testing Instructions

### 1. Test MongoDB Connection

```bash
# On EC2 instance
mongosh

# In MongoDB shell
use harmonyhub
db.users.find().limit(1)
exit
```

**Expected**: Should connect and show user documents.

### 2. Test Backend API Endpoint

```bash
# Get Auth0 token from browser (DevTools → Application → Local Storage)
# Look for token or run in browser console:
# const token = await getAccessTokenSilently();

# Test GET endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/users/me/custom-id?userId=YOUR_USER_ID

# Test PUT endpoint
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"customUserId":"test123"}' \
     http://localhost:5001/api/users/me/custom-id?userId=YOUR_USER_ID

# Test availability check
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"customUserId":"test123"}' \
     http://localhost:5001/api/users/me/custom-id/check?userId=YOUR_USER_ID
```

**Expected**: Should return JSON responses with success/error.

### 3. Test Through Nginx Proxy

```bash
# Test through Nginx (production setup)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost/api/users/me/custom-id?userId=YOUR_USER_ID
```

**Expected**: Should work the same as direct backend call.

### 4. Test Frontend Component

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Navigate to Settings page**
4. **Try to edit custom user ID field**
5. **Check for API calls**:
   - Should see GET `/api/users/me/custom-id` on page load
   - Should see POST `/api/users/me/custom-id/check` when typing
   - Should see PUT `/api/users/me/custom-id` when saving

**Expected**:
- Input field should be clickable (not disabled)
- Save button should only show "Saving..." during actual save
- Error messages should appear if something fails

### 5. Verify Auth0 Token

**In browser console**:
```javascript
// Check if token exists
const token = await getAccessTokenSilently();
console.log('Token:', token ? 'Present' : 'Missing');

// Decode token (just payload, safe)
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
}
```

**Expected**: Should show token and payload with user info.

## Debug Checklist

### ✅ Is MongoDB Connected?

```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh --eval "db.adminCommand('ping')"
```

**Fix if not connected**:
```bash
sudo systemctl start mongod
```

### ✅ Does Backend Endpoint Exist?

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs financial-planner-backend --lines 50

# Test health endpoint
curl http://localhost:5001/api/health
```

**Fix if not running**:
```bash
cd /home/ubuntu/financial-planner
npm run restart
```

### ✅ Is Auth0 Token Being Sent?

**In browser DevTools → Network tab**:
1. Click on a failed API request
2. Go to "Headers" tab
3. Look for "Authorization: Bearer ..."

**Expected**: Should see Authorization header with token.

**Fix if missing**: Check Auth0 configuration in `.env.production`.

### ✅ Is Component Handling Errors?

**In browser console**, you should see:
- Error logs if API calls fail
- No infinite loops
- Loading states clearing

**Check component state**:
```javascript
// In browser console on Settings page
// The component should not be stuck in loading state
```

### ✅ Are Loading States Cleared?

**Check the code**:
- All `try/catch` blocks have `finally` blocks
- `finally` blocks always clear loading states
- No early returns without clearing state

## Common Issues and Fixes

### Issue: "Cannot click into input field"

**Cause**: Input is disabled because `loadingCustomId` is stuck as `true`.

**Fix**: 
1. Hard refresh page (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify backend is running: `pm2 status`
4. Rebuild frontend if needed

### Issue: "Save button stuck on 'Saving...'"

**Cause**: `savingCustomId` is stuck as `true` because error didn't clear it.

**Fix**: 
1. Check browser console for error
2. Verify API endpoint is accessible
3. Hard refresh page
4. Check backend logs: `pm2 logs financial-planner-backend`

### Issue: "ERR_CONNECTION_REFUSED"

**Cause**: Backend not running or wrong URL.

**Fix**:
1. Check backend: `pm2 status`
2. Start backend: `npm run restart`
3. Verify URL: Should be `/api` in production, not `localhost:5001`
4. Check `.env.production`: `VITE_API_URL=/api`

### Issue: "This Custom User ID is already taken"

**Cause**: ID is actually taken, or duplicate check is failing.

**Fix**:
1. Try a different ID
2. Check MongoDB: `db.users.find({customUserId: "yourid"})`
3. Check backend logs for duplicate key errors

### Issue: "Request timed out"

**Cause**: Backend is slow or not responding.

**Fix**:
1. Check backend logs: `pm2 logs financial-planner-backend`
2. Check MongoDB connection
3. Check Auth0 Management API (if using)
4. Increase timeout in `api.ts` if needed

## Deployment Steps

After making changes:

```bash
# On EC2 instance
cd /home/ubuntu/financial-planner

# Rebuild frontend
npm run build

# Copy to web directory
cp -r dist/* /var/www/financial-planner/dist/

# Restart backend (if backend code changed)
npm run restart

# Reload Nginx
sudo systemctl reload nginx

# Verify
pm2 status
curl http://localhost:5001/api/health
curl http://localhost/api/health
```

## Environment Variables Required

### Frontend (`.env.production`):
```env
VITE_API_URL=/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-api-audience
```

### Backend (`backend/.env`):
```env
PORT=5001
HOST=0.0.0.0
NODE_ENV=production
FRONTEND_URL=https://financial-planner.alexpicard.info
MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_M2M_CLIENT_ID=your_m2m_client_id
AUTH0_M2M_CLIENT_SECRET=your_m2m_client_secret
AUTH0_AUDIENCE=https://your-api-audience
```

## Verification

After deployment, verify:

1. ✅ Input field is clickable
2. ✅ Can type in the field
3. ✅ Save button works
4. ✅ Error messages appear when appropriate
5. ✅ Loading states clear properly
6. ✅ Custom ID saves to MongoDB
7. ✅ Duplicate IDs are rejected
8. ✅ Format validation works

## Summary

The feature is now **production-ready** with:
- ✅ Proper state management
- ✅ Error handling
- ✅ User feedback
- ✅ Validation
- ✅ Uniqueness checks
- ✅ Timeout protection
- ✅ Relative URLs for production

