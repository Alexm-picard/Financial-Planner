# Quick Deploy Guide 🚀

Fastest way to deploy your Financial Planner app.

## Firebase Hosting (Recommended - 5 minutes)

### Step 1: Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login

```bash
firebase login
```

### Step 3: Initialize Hosting (if not done)

```bash
firebase init hosting
```

**Quick answers:**
- Select project: `financial-planner-final-final`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub auto-deploy: `No` (or Yes if you want)

### Step 4: Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

### Done! 🎉

Your app is live at: `https://financial-planner-final-final.web.app`

---

## Vercel (Alternative - 3 minutes)

### Via Web (Easiest):

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repo
5. Settings:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
6. Add environment variables (all 6 Firebase vars)
7. Deploy!

### Via CLI:

```bash
npm install -g vercel
vercel
```

---

## One-Command Deploy Script

Create a deploy script in `package.json`:

```json
"scripts": {
  "deploy": "npm run build && firebase deploy --only hosting"
}
```

Then just run:
```bash
npm run deploy
```

---

## That's it! Your app is live! 🎊

