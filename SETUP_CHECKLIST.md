# Setup Checklist

Use this checklist to ensure you've completed all setup steps.

## ✅ Pre-Setup

- [ ] Node.js installed (v18+)
- [ ] npm or yarn installed
- [ ] Code editor ready (VS Code recommended)
- [ ] Google account for Firebase

## ✅ Firebase Project Setup

- [ ] Created Firebase project at https://console.firebase.google.com/
- [ ] Project name chosen
- [ ] Project created successfully

## ✅ Firebase Web App Registration

- [ ] Clicked Web icon (`</>`) in Firebase Console
- [ ] Registered web app with nickname
- [ ] Copied Firebase configuration values
- [ ] Configuration values saved somewhere safe

## ✅ Environment Variables

- [ ] Created `.env` file in project root
- [ ] Added `VITE_FIREBASE_API_KEY=...`
- [ ] Added `VITE_FIREBASE_AUTH_DOMAIN=...`
- [ ] Added `VITE_FIREBASE_PROJECT_ID=...`
- [ ] Added `VITE_FIREBASE_STORAGE_BUCKET=...`
- [ ] Added `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
- [ ] Added `VITE_FIREBASE_APP_ID=...`
- [ ] Verified all values are correct (no placeholders)

## ✅ Firebase Authentication

- [ ] Opened Authentication section in Firebase Console
- [ ] Enabled "Email/Password" sign-in method
- [ ] Enabled "Google" sign-in method
- [ ] Selected project support email for Google auth

## ✅ Firestore Database

- [ ] Opened Firestore Database section
- [ ] Clicked "Create database"
- [ ] Selected "Start in test mode"
- [ ] Chose database location
- [ ] Database created successfully

## ✅ Firestore Security Rules

- [ ] Opened Firestore Rules tab
- [ ] Copied security rules from FIREBASE_SETUP.md
- [ ] Pasted rules into editor
- [ ] Clicked "Publish" to save rules
- [ ] Verified rules are active (no errors)

## ✅ Firestore Indexes (Optional)

- [ ] Created index for `accounts` collection (userId field)
- [ ] Created index for `transactions` collection (userId field)
- [ ] Or clicked "Create Index" when prompted by Firebase

## ✅ Local Development Setup

- [ ] Ran `npm install` successfully
- [ ] `.env` file is in project root
- [ ] Restarted dev server after creating `.env`
- [ ] No errors in terminal

## ✅ Application Testing

### Authentication
- [ ] Can access `/register` page
- [ ] Can create account with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Can sign out

### Account Management
- [ ] Can create savings account
- [ ] Can create debt account
- [ ] Can edit account details
- [ ] Can delete account
- [ ] Accounts appear in Accounts page

### Transactions
- [ ] Can add manual transaction
- [ ] Transactions appear in history
- [ ] Can filter transactions
- [ ] Can search transactions

### Other Features
- [ ] Financial summary displays correctly
- [ ] Reports page shows charts
- [ ] Cost calculator works
- [ ] Calendar displays payment dates
- [ ] Settings page accessible

## ✅ Verification

- [ ] No console errors in browser
- [ ] No errors in terminal
- [ ] Firebase Console shows user in Authentication
- [ ] Firestore shows collections (accounts, transactions, user)
- [ ] Data persists after page refresh

## 🚨 Troubleshooting Checklist

If something isn't working:

- [ ] Checked browser console for errors
- [ ] Checked terminal for errors
- [ ] Verified `.env` file exists and has correct values
- [ ] Restarted dev server after `.env` changes
- [ ] Checked Firebase Console for errors
- [ ] Verified Firestore rules are published
- [ ] Confirmed authentication methods are enabled
- [ ] Checked network tab for failed requests

## 📝 Next Steps After Setup

- [ ] Customize application branding
- [ ] Add more features if needed
- [ ] Set up production environment
- [ ] Configure Firebase Hosting (optional)
- [ ] Set up monitoring and analytics

## 🎉 Completion

Once all items are checked:
- [ ] Application is fully functional
- [ ] Ready for development
- [ ] Ready for deployment (after production setup)

---

**Need Help?** Refer to:
- [QUICK_START.md](./QUICK_START.md) for quick reference
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions
- [README.md](./README.md) for project overview

