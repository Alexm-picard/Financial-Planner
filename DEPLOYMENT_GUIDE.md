# Deployment Guide

Complete guide for deploying your Financial Planner application to production.

## 🚀 Deployment Options

1. **Firebase Hosting** (Recommended - easiest with Firebase)
2. **Vercel** (Great for React apps, automatic deployments)
3. **Netlify** (Simple drag-and-drop or Git integration)
4. **Other static hosts** (Any static hosting service)

---

## Option 1: Firebase Hosting (Recommended)

Since you're already using Firebase, this is the easiest option.

### Prerequisites

```bash
npm install -g firebase-tools
```

### Step 1: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate.

### Step 2: Initialize Firebase Hosting

```bash
firebase init hosting
```

**Answer the prompts:**

1. **Select Firebase project:** Choose `financial-planner-final-final`
2. **What do you want to use as your public directory?** → `dist`
3. **Configure as a single-page app?** → `Yes`
4. **Set up automatic builds and deploys with GitHub?** → `No` (or Yes if you want)
5. **File dist/index.html already exists. Overwrite?** → `No`

### Step 3: Build Your App

```bash
npm run build
```

This creates the `dist` folder with your production build.

### Step 4: Deploy

```bash
firebase deploy --only hosting
```

### Step 5: Access Your App

Your app will be live at:
```
https://financial-planner-final-final.web.app
```

Or your custom domain if configured.

### Firebase Hosting Configuration

Your `firebase.json` should look like this:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Environment Variables for Production

Firebase Hosting doesn't support `.env` files directly. You have two options:

**Option A: Use Firebase Functions (Advanced)**
- Set environment variables in Firebase Functions
- More complex setup

**Option B: Build-time variables (Recommended)**
- Your `.env` file is already used during `npm run build`
- The values are baked into the build
- Make sure your `.env` has production values before building

**Important:** Since Vite embeds env variables at build time, your `.env` values are included in the build. For production, you might want to:

1. Create a `.env.production` file:
```env
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_domain
# ... etc
```

2. Build with production mode:
```bash
npm run build
```

### Custom Domain (Optional)

1. Firebase Console → Hosting → Add custom domain
2. Follow the verification steps
3. Update DNS records as instructed

---

## Option 2: Vercel (Easiest for Git Integration)

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Code pushed to repository

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Web (Recommended)

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add all 6 Firebase variables:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
7. Click "Deploy"

### Step 3: Deploy via CLI (Alternative)

```bash
vercel
```

Follow the prompts. When asked about environment variables, add them or set them later in the dashboard.

### Step 4: Access Your App

Vercel will give you a URL like:
```
https://your-project.vercel.app
```

### Automatic Deployments

Vercel automatically deploys on every push to your main branch!

---

## Option 3: Netlify

### Step 1: Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
```

### Step 2: Build Your App

```bash
npm run build
```

### Step 3: Deploy via Web (Recommended)

1. Go to https://app.netlify.com
2. Sign up/Login
3. Drag and drop your `dist` folder
4. Or connect to Git for automatic deployments

### Step 4: Configure Environment Variables

1. Site settings → Environment variables
2. Add all 6 Firebase variables
3. Redeploy

### Step 5: Deploy via CLI (Alternative)

```bash
netlify login
netlify init
netlify deploy --prod
```

### Step 4: Access Your App

Netlify will give you a URL like:
```
https://your-project.netlify.app
```

---

## Option 4: Other Static Hosts

Any static hosting service works. Just:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your host

3. **Configure environment variables** (if supported)

Popular options:
- **GitHub Pages** (free, but needs setup)
- **AWS S3 + CloudFront**
- **Cloudflare Pages**
- **Render**
- **Railway**

---

## Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Build works locally:**
  ```bash
  npm run build
  npm run preview  # Test the build
  ```

- [ ] **Environment variables set:**
  - Production Firebase config in `.env.production` or hosting platform
  - All 6 variables configured

- [ ] **Firebase Security Rules:**
  - Update Firestore rules for production
  - Consider stricter rules than test mode

- [ ] **Firebase Authentication:**
  - Authorized domains include your production URL
  - Firebase Console → Authentication → Settings → Authorized domains

- [ ] **Test production build:**
  ```bash
  npm run build
  npm run preview
  ```
  - Test all features
  - Verify Firebase connection works

- [ ] **Optimize:**
  - Check bundle size
  - Consider code splitting if bundle is large

---

## Post-Deployment Steps

### 1. Update Firebase Authorized Domains

1. Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your production domain (e.g., `your-app.web.app`)

### 2. Update Firestore Security Rules

Make sure your production rules are secure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /user/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    match /accounts/{accountId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Test Production Site

- [ ] Register a new account
- [ ] Create accounts
- [ ] Add transactions
- [ ] View reports
- [ ] Test all features

### 4. Set Up Monitoring (Optional)

- Firebase Analytics
- Error tracking (Sentry, etc.)
- Performance monitoring

---

## Continuous Deployment

### GitHub Actions (Firebase)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: financial-planner-final-final
```

### Vercel/Netlify

Both automatically deploy on Git push if connected to your repository.

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working

- Verify variable names start with `VITE_`
- Check hosting platform has variables set
- Rebuild after adding variables

### Firebase Errors in Production

- Check authorized domains in Firebase Console
- Verify security rules are published
- Check browser console for specific errors

### Routing Issues (404 on refresh)

- Ensure SPA configuration is set
- Check rewrite rules (Firebase) or redirects (others)

---

## Quick Deploy Commands

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

---

## Recommended: Firebase Hosting

Since you're already using Firebase, **Firebase Hosting is the recommended choice** because:

✅ Same project, easy integration  
✅ Free tier is generous  
✅ Fast CDN  
✅ Easy custom domain  
✅ Automatic SSL  
✅ Simple deployment process  

---

## Next Steps

1. Choose your hosting platform
2. Follow the specific guide above
3. Deploy!
4. Test your production site
5. Share your app! 🎉

