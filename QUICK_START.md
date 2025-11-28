# Quick Start Guide

Get your Financial Planner application up and running in minutes!

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Google account (for Firebase)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

Follow the detailed guide in `FIREBASE_SETUP.md`, or use these quick steps:

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Get Configuration:**
   - In Firebase Console, click the Web icon (`</>`)
   - Register your app
   - Copy the configuration values

3. **Create `.env` file:**
   ```bash
   # In project root
   touch .env
   ```

4. **Add to `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Enable Authentication:**
   - Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

6. **Create Firestore Database:**
   - Firebase Console → Firestore Database
   - Click "Create database"
   - Start in test mode
   - Choose location

7. **Set Security Rules:**
   - Firestore Database → Rules tab
   - Copy rules from `FIREBASE_SETUP.md` (Step 6)
   - Click "Publish"

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal)

### 4. Test the Application

1. Navigate to the login page
2. Click "Sign Up" to create an account
3. Create your first account (savings or debt)
4. Add a transaction
5. Explore the reports and other features!

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Firebase (if you install Firebase CLI)
firebase login
firebase init
firebase deploy
```

## Project Structure

```
harmony-hub/
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configs
│   ├── pages/          # Page components
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── .env               # Environment variables (create this)
└── package.json       # Dependencies
```

## Key Features

- ✅ **Authentication:** Email/password and Google sign-in
- ✅ **Account Management:** Create, edit, delete savings and debt accounts
- ✅ **Transactions:** Track all account changes
- ✅ **Reports:** Financial charts and analytics
- ✅ **Cost Calculator:** Calculate tuition costs
- ✅ **Calendar:** View scheduled payments
- ✅ **Settings:** User profile management

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Check your `.env` file has correct values
- Restart dev server after changing `.env`

### "Missing or insufficient permissions"
- Check Firestore security rules are published
- Verify you're logged in

### Environment variables not working
- Ensure `.env` is in project root
- Variable names must start with `VITE_`
- Restart dev server

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Next Steps

1. **Customize the UI:** Modify components in `src/components/`
2. **Add Features:** Extend functionality in `src/pages/`
3. **Deploy:** Use Firebase Hosting or your preferred platform
4. **Monitor:** Set up Firebase Analytics

## Getting Help

- Check `FIREBASE_SETUP.md` for detailed Firebase setup
- Review browser console for errors
- Check Firebase Console for database/auth issues

## Development Tips

1. **Hot Reload:** Changes auto-reload in browser
2. **TypeScript:** Type errors shown in IDE
3. **Linting:** Run `npm run lint` before committing
4. **Firebase Emulator:** Consider using for local development

Happy coding! 🚀

