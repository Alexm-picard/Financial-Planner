# Harmony Hub - Financial Planner

A comprehensive financial planning application built with React, TypeScript, Firebase, and shadcn-ui.

## Features

- 🔐 **Authentication:** Secure login with email/password and Google OAuth
- 💰 **Account Management:** Track savings and debt accounts
- 📊 **Transaction History:** Complete audit trail of all financial activities
- 📈 **Financial Reports:** Visual analytics with charts and graphs
- 🧮 **Cost Calculator:** Multi-step calculator for tuition and expenses
- 📅 **Payment Calendar:** View scheduled debt payments
- ⚙️ **Settings:** Customize your profile and preferences

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **UI Framework:** shadcn-ui + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB
- **Authentication:** Auth0
- **Charts:** Recharts
- **Routing:** React Router v6
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Community Edition (v7.0 or higher)
- npm or yarn

### MongoDB Setup (macOS)

1. **Install MongoDB (if not already installed):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Remove conflicting MongoDB versions:**
   ```bash
   brew services stop mongodb-community@7.0
   brew uninstall mongodb-community@7.0
   brew services start mongodb-community
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   ```
   If successful, you'll see the MongoDB shell prompt.

4. **Kill any processes on port 5001 (if needed):**
   ```bash
   lsof -ti :5001 | xargs kill -9
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file in `backend/` directory:**
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
   PORT=5001
   ```

4. **Start MongoDB service (if not already running):**
   ```bash
   brew services start mongodb-community
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

   The backend should now be running on `http://localhost:5001`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file in project root (if using Auth0):**
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Start frontend development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

### Startup Order

**Important:** Start services in this order:

1. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

2. **Start backend:**
   ```bash
   cd backend && npm run dev
   ```

3. **Start frontend:**
   ```bash
   cd .. && npm run dev
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn-ui components
│   ├── AccountCard.tsx  # Account display card
│   ├── FinancialSummary.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAccounts.ts   # Account management
│   ├── useTransactions.ts
│   └── useFinancialSummary.ts
├── lib/                 # Utilities
│   ├── firebase-config.ts
│   ├── formatters.ts
│   └── utils.ts
├── pages/               # Page components
│   ├── Index.tsx        # Home/Dashboard
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Accounts.tsx
│   ├── TransactionHistory.tsx
│   ├── AddTransaction.tsx
│   ├── Reports.tsx
│   ├── CostCalculator.tsx
│   ├── Calendar.tsx
│   └── Settings.tsx
└── types/               # TypeScript definitions
    └── index.ts
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### PM2
- `npm run pm2:start` - Build frontend and start backend with PM2
- `npm run pm2:stop` - Stop the PM2 process
- `npm run pm2:restart` - Build frontend and restart PM2 process
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:status` - Check PM2 status
- `npm run pm2:delete` - Remove from PM2

## Backend Configuration

The backend requires:
- **MongoDB:** Database for accounts and transactions
- **Express:** REST API server
- **Auth0:** Authentication (configured in frontend)

### Backend Environment Variables

Create `backend/.env` with:
```env
MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
PORT=5001
```

**Important:** The backend loads its `.env` file from the `backend/` directory, not the project root.

## Features in Detail

### Account Management
- Create savings and debt accounts
- Set monthly payment schedules
- Link debt payments to savings accounts
- Track due dates and balances

### Transaction Tracking
- Automatic transaction creation on account changes
- Manual transaction entry
- Filter and search transactions
- View transaction history by account

### Financial Reports
- Net worth calculation
- Asset vs. liability breakdown
- Account balance trends over time
- Visual charts and graphs

### Cost Calculator
- Step-by-step tuition cost calculation
- Room and board options
- Meal plan selection
- Scholarship tracking
- Create debt account from calculated total

### Payment Calendar
- Visual calendar with payment dates
- Click dates to view scheduled payments
- Track multiple debt accounts

## Security

- Firestore security rules protect user data
- Authentication required for all protected routes
- User data isolated by user ID
- Environment variables for sensitive configuration

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Create hooks in `src/hooks/` for data management
4. Update types in `src/types/index.ts`

### Styling

- Uses Tailwind CSS utility classes
- shadcn-ui components for consistent UI
- Custom components follow design system

## Running with PM2

PM2 is a process manager for Node.js applications that keeps your app running in the background and automatically restarts it if it crashes.

### Prerequisites

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Build the frontend:**
   The backend serves the built frontend from the `dist` folder, so you need to build it first:
   ```bash
   npm run build
   ```

### Quick Start

**Start the application:**
```bash
npm run pm2:start
```

**Stop the application:**
```bash
npm run pm2:stop
```

**Restart the application:**
```bash
npm run pm2:restart
```

**View logs:**
```bash
npm run pm2:logs
```

**Check status:**
```bash
npm run pm2:status
```

### PM2 Commands Directly

You can also use PM2 commands directly:

```bash
# Start
pm2 start ecosystem.config.cjs

# Stop
pm2 stop financial-planner-backend

# Restart
pm2 restart financial-planner-backend

# View logs
pm2 logs financial-planner-backend

# Monitor in real-time
pm2 monit

# Delete from PM2
pm2 delete financial-planner-backend
```

### Auto-start on System Reboot

To make PM2 start automatically on system reboot:

```bash
# Save current PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions provided by the command above
```

### Logs

PM2 logs are stored in the `backend/logs/` directory:
- `pm2-error.log` - Error logs
- `pm2-out.log` - Output logs
- `pm2-combined.log` - Combined logs

## Production Deployment

### Server Configuration

The server is configured to listen on `0.0.0.0` to accept external connections. This is required for production deployments.

### Option 1: Nginx Reverse Proxy (Recommended)

This is the recommended approach for production. It allows you to:
- Use standard HTTP (80) and HTTPS (443) ports
- Work with Cloudflare SSL
- Hide the backend port from external access
- Add additional security headers

#### Setup Steps:

1. **Install Nginx (if not already installed):**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Copy the Nginx configuration:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/financial-planner
   ```

3. **Create symlink to enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/financial-planner /etc/nginx/sites-enabled/
   ```

4. **Update the server_name in the config:**
   Edit `/etc/nginx/sites-available/financial-planner` and change `financial-planner.alexpicard.info` to your domain.

5. **Test Nginx configuration:**
   ```bash
   sudo nginx -t
   ```

6. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

7. **Ensure your app is running with PM2:**
   ```bash
   npm run pm2:start
   ```

8. **Configure DNS:**
   Point your domain (e.g., `financial-planner.alexpicard.info`) to your server's IP address.

9. **Configure Cloudflare (if using):**
   - Add your domain to Cloudflare
   - Set SSL/TLS encryption mode to "Flexible" (if using HTTP) or "Full" (if using HTTPS)
   - Cloudflare will handle SSL termination

Your app will now be accessible at:
- `http://financial-planner.alexpicard.info`
- `https://financial-planner.alexpicard.info` (via Cloudflare)

### Option 2: Direct Port Access (Less Ideal)

If you prefer not to use Nginx, you can access the app directly on port 5001:

1. **Open port 5001 in your firewall:**
   ```bash
   sudo ufw allow 5001/tcp
   ```

2. **Ensure your app is running with PM2:**
   ```bash
   npm run pm2:start
   ```

3. **Access your app:**
   - `http://financial-planner.alexpicard.info:5001`

**Note:** This approach requires Cloudflare Flexible SSL if you want HTTPS, and exposes the backend port directly.

### Verification

Test that your server is accessible:

```bash
# From your local machine or server
curl http://financial-planner.alexpicard.info:5001

# Or if using Nginx (port 80):
curl http://financial-planner.alexpicard.info
```

You should see the HTML content of your React app.

**Check API health:**
```bash
curl http://financial-planner.alexpicard.info:5001/api/health
```

### Cloudflare SSL Configuration

For Auth0 SPA SDK to work properly, you need HTTPS. With Cloudflare:

1. **Flexible SSL (HTTP to Cloudflare, HTTPS to users):**
   - Set SSL/TLS encryption mode to "Flexible"
   - Your server can run on HTTP (port 80)
   - Cloudflare handles SSL termination

2. **Full SSL (HTTPS end-to-end):**
   - Set SSL/TLS encryption mode to "Full" or "Full (strict)"
   - Your server needs HTTPS (port 443) or use Nginx with SSL
   - More secure but requires SSL certificate on server

### Firewall Configuration

Ensure your firewall allows necessary ports:

```bash
# For Nginx (Option 1)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# For direct access (Option 2)
sudo ufw allow 5001/tcp

# Check firewall status
sudo ufw status
```

### Security Considerations

1. **Keep PM2 running:** Ensure PM2 auto-starts on reboot:
   ```bash
   pm2 save
   pm2 startup
   ```

2. **Update regularly:** Keep your system and dependencies updated

3. **Use environment variables:** Never commit `.env` files with secrets

4. **Monitor logs:** Regularly check PM2 and Nginx logs for issues

## Deployment

### Firebase Hosting (Alternative - Frontend Only)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login:
   ```bash
   firebase login
   ```

3. Initialize:
   ```bash
   firebase init hosting
   ```

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Other Platforms

- **Vercel:** Connect GitHub repo, set environment variables
- **Netlify:** Drag and drop `dist` folder, set environment variables
- **Any static host:** Upload `dist` folder after `npm run build`

## Environment Variables

### Frontend (project root `.env`):
- `VITE_API_URL` - Backend API URL (default: `http://localhost:5001/api`)

### Backend (`backend/.env`):
- `MONGO_URI` - MongoDB connection string (default: `mongodb://127.0.0.1:27017/harmonyhub`)
- `PORT` - Backend server port (default: `5001`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Troubleshooting

### ERR_CONNECTION_REFUSED - Backend Not Reachable

**Quick Diagnosis:**

1. **Check if backend is running:**
   ```bash
   npm run check:port
   # Or manually: lsof -i :5001
   ```

2. **Test backend directly:**
   ```bash
   npm run check:backend
   # Or: curl http://localhost:5001/api/health
   ```

3. **If backend is not running:**
   ```bash
   cd backend
   npm run dev
   ```

**Common Causes:**
- Backend not started
- Backend crashed (check logs)
- Wrong port number
- Port already in use

### Backend won't start

1. **MongoDB URI is undefined:**
   - Ensure `backend/.env` exists with `MONGO_URI` set
   - Verify the backend loads `.env` from `backend/` directory

2. **Port 5001 already in use:**
   ```bash
   cd backend
   npm run kill:port
   # Or manually: lsof -ti :5001 | xargs kill -9
   ```

3. **MongoDB connection failed:**
   - Verify MongoDB is running: `brew services list | grep mongodb` (macOS)
   - Start MongoDB: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
   - Test connection: `mongosh`

4. **Backend crashes on startup:**
   - Check backend logs for errors
   - Verify all dependencies installed: `cd backend && npm install`
   - Check environment variables are set correctly

### Frontend Can't Connect to Backend

1. **Check API URL configuration:**
   - Frontend `.env`: `VITE_API_URL=http://localhost:5001/api`
   - Verify in browser DevTools → Network tab

2. **Test backend endpoints:**
   ```bash
   curl http://localhost:5001/api/health
   curl http://localhost:5001/api
   ```

3. **Check browser console:**
   - Open DevTools (F12) → Console tab
   - Look for connection errors
   - Check Network tab for failed requests

4. **Verify CORS configuration:**
   - Backend should allow your frontend origin
   - Check `backend/server.js` CORS settings

### Debugging Commands

```bash
# Check backend status
npm run check:backend

# Check if port is in use
npm run check:port

# Kill process on port 5001
cd backend && npm run kill:port

# View PM2 logs (if using PM2)
npm run pm2:logs

# View PM2 status
npm run pm2:status
```

### MongoDB Issues on macOS

If you have conflicting MongoDB versions:
```bash
brew services stop mongodb-community@7.0
brew uninstall mongodb-community@7.0
brew services start mongodb-community
```

### MongoDB Issues on Linux/Ubuntu

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod

# Test connection
mongosh
```

## Support

For issues and questions:
1. Check browser console (F12) for errors
2. Check backend terminal for error messages
3. Verify backend is running: `npm run check:backend`
4. Check PM2 logs if using PM2: `npm run pm2:logs`

## Acknowledgments

- Built with [shadcn-ui](https://ui.shadcn.com/)
- Powered by [Firebase](https://firebase.google.com/)
- Charts by [Recharts](https://recharts.org/)
