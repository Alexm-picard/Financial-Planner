# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Financial Planner application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "harmony-hub-financial-planner")
4. Click **"Continue"**
5. (Optional) Enable Google Analytics - you can skip this for now
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

## Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "Harmony Hub Web")
3. **Do NOT** check "Also set up Firebase Hosting" for now
4. Click **"Register app"**
5. You'll see your Firebase configuration object - **copy this information** (you'll need it in Step 3)

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 3: Set Up Environment Variables

1. In your project root directory (`/Users/alexpicard/Desktop/harmony-hub`), create a `.env` file:

```bash
# Create .env file
touch .env
```

2. Add your Firebase configuration to the `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

3. Replace the placeholder values with your actual Firebase configuration values from Step 2.

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file should already be in `.gitignore`

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable the following sign-in providers:

### Email/Password Authentication:
1. Click on **"Email/Password"**
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### Google Authentication:
1. Click on **"Google"**
2. Toggle **"Enable"** to ON
3. Select a project support email (usually your email)
4. Click **"Save"**

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in test mode"** for now (we'll add security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

**Note:** Test mode allows read/write access for 30 days. We'll set up proper security rules in Step 6.

## Step 6: Configure Firestore Security Rules

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User collection - users can read/write their own user document
    match /user/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Accounts collection - users can only access their own accounts
    match /accounts/{accountId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Transactions collection - users can only access their own transactions
    match /transactions/{transactionId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"** to save the rules

## Step 7: Create Firestore Indexes (Optional but Recommended)

For better query performance, create indexes:

1. In Firestore Database, go to the **"Indexes"** tab
2. Click **"Create Index"**
3. Create the following indexes:

### Index 1: Accounts by userId
- Collection ID: `accounts`
- Fields to index:
  - `userId` (Ascending)
- Query scope: Collection
- Click **"Create"**

### Index 2: Transactions by userId
- Collection ID: `transactions`
- Fields to index:
  - `userId` (Ascending)
- Query scope: Collection
- Click **"Create"**

**Note:** Firebase may automatically suggest these indexes when you run queries. You can create them when prompted.

## Step 8: Verify Your Setup

1. Make sure your `.env` file is in the project root
2. Restart your development server if it's running:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

3. Open your browser and navigate to the login page
4. Try creating an account - you should be able to:
   - Register with email/password
   - Sign in with Google
   - Create accounts
   - Add transactions

## Step 9: Test the Application

1. **Test Authentication:**
   - Go to `/register` and create a new account
   - Log out and log back in
   - Try Google sign-in

2. **Test Account Management:**
   - Create a savings account
   - Create a debt account
   - Edit an account
   - Delete an account

3. **Test Transactions:**
   - Add a transaction
   - View transaction history
   - Filter transactions

4. **Test Other Features:**
   - View financial reports
   - Use the cost calculator
   - Check the calendar for payment dates

## Troubleshooting

### Issue: "Firebase: Error (auth/api-key-not-valid)"
- **Solution:** Check that your `VITE_FIREBASE_API_KEY` in `.env` matches your Firebase project

### Issue: "Missing or insufficient permissions"
- **Solution:** 
  1. Check Firestore security rules (Step 6)
  2. Make sure you're authenticated
  3. Verify the user ID matches the document's `userId` field

### Issue: "Firebase App named '[DEFAULT]' already exists"
- **Solution:** This usually means Firebase is initialized multiple times. Check that `firebase-config.ts` only initializes once.

### Issue: Environment variables not loading
- **Solution:**
  1. Make sure `.env` is in the project root (not in `src/`)
  2. Restart your dev server after creating/modifying `.env`
  3. Check that variable names start with `VITE_`

### Issue: "Collection 'accounts' not found"
- **Solution:** This is normal - Firestore creates collections automatically when you first write data. Just create an account and the collection will be created.

## Production Deployment Considerations

When deploying to production:

1. **Update Security Rules:**
   - Review and tighten Firestore security rules
   - Consider adding rate limiting
   - Add validation for data types

2. **Environment Variables:**
   - Set environment variables in your hosting platform
   - Never expose Firebase config in client-side code

3. **Firebase Hosting (Optional):**
   - Consider using Firebase Hosting for deployment
   - Set up custom domain if needed

4. **Monitoring:**
   - Enable Firebase Analytics
   - Set up error tracking
   - Monitor Firestore usage

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Firebase Console for authentication and database errors
3. Verify all environment variables are set correctly
4. Ensure Firestore security rules are published

