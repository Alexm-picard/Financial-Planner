# Firebase Configuration Values - Where to Find Them

This guide shows you exactly where to find each Firebase configuration value.

## Step 1: Access Your Firebase Project

1. Go to https://console.firebase.google.com/
2. Select your project (or create a new one)
3. Click the **gear icon** (⚙️) next to "Project Overview"
4. Select **"Project settings"**

## Step 2: Find Your Web App Configuration

### Option A: If You Already Registered a Web App

1. In Project settings, scroll down to **"Your apps"** section
2. Find your web app (icon: `</>`)
3. Click on it to see the configuration
4. You'll see code that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Option B: If You Haven't Registered a Web App Yet

1. In Project settings, scroll to **"Your apps"** section
2. Click the **Web icon** (`</>`)
3. Register your app:
   - Enter app nickname (e.g., "Harmony Hub")
   - **DO NOT** check "Also set up Firebase Hosting"
   - Click **"Register app"**
4. Copy the configuration values shown

## Step 3: Map Values to Environment Variables

Here's how each Firebase config value maps to your `.env` file:

| Firebase Config Key | Your .env Variable | Example Value |
|---------------------|-------------------|---------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `appId` | `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` |

## Step 4: Create Your .env File

Create a file named `.env` in your project root (`/Users/alexpicard/Desktop/harmony-hub/.env`)

```env
# Copy these values from Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important:** 
- Replace the example values with YOUR actual values from Firebase
- Don't include quotes around the values
- Don't include commas
- Each value should be on its own line

## Visual Guide: Firebase Console Navigation

```
Firebase Console
├── Project Overview
│   └── ⚙️ Project settings (click here)
│       ├── General tab
│       │   └── Your apps section
│       │       └── </> Web app (click to see config)
│       │           └── Config values here!
│       ├── Service accounts tab
│       └── Usage and billing tab
```

## Quick Reference: What Each Value Does

- **API Key**: Public key for Firebase services (safe to expose in client)
- **Auth Domain**: Domain for Firebase Authentication
- **Project ID**: Unique identifier for your Firebase project
- **Storage Bucket**: Cloud Storage bucket name
- **Messaging Sender ID**: For Firebase Cloud Messaging
- **App ID**: Unique identifier for this web app

## Verification

After creating your `.env` file:

1. ✅ Check that all 6 variables are present
2. ✅ Verify no values say "your-..." or "123456..."
3. ✅ Make sure there are no extra spaces
4. ✅ Restart your dev server: `npm run dev`

## Common Mistakes to Avoid

❌ **Don't** include the `const firebaseConfig = {` part
❌ **Don't** include quotes around values
❌ **Don't** include commas
❌ **Don't** use the example values - use YOUR actual values
❌ **Don't** commit `.env` to git (it's in `.gitignore`)

✅ **Do** copy exact values from Firebase Console
✅ **Do** restart dev server after creating/changing `.env`
✅ **Do** verify values match what's in Firebase Console

## Still Can't Find It?

1. **Make sure you're in the right project:**
   - Check project name in top-left of Firebase Console
   - Switch projects if needed

2. **Check if web app is registered:**
   - If you don't see a web app, register one (see Option B above)

3. **Try the alternative method:**
   - Go to Project settings
   - Scroll to "SDK setup and configuration"
   - Select "Config" tab
   - Copy values from there

## Example: Complete .env File

Here's what a complete `.env` file should look like (with fake values):

```env
VITE_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
VITE_FIREBASE_AUTH_DOMAIN=my-financial-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-financial-app
VITE_FIREBASE_STORAGE_BUCKET=my-financial-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321098
VITE_FIREBASE_APP_ID=1:987654321098:web:abc123def456ghi789
```

**Remember:** These are example values. Use YOUR actual values from Firebase!

