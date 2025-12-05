# Production Deployment Guide - AWS EC2

Complete guide for deploying Financial Planner backend and frontend to AWS EC2.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Security Group Configuration](#ec2-security-group-configuration)
3. [Initial Server Setup](#initial-server-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [PM2 Process Management](#pm2-process-management)
8. [Environment Variables](#environment-variables)
9. [Testing and Verification](#testing-and-verification)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS EC2 instance running (Ubuntu 20.04+ or Amazon Linux 2)
- SSH access to EC2 instance
- Domain name pointing to EC2 public IP (optional but recommended)
- MongoDB installed and running on EC2 (or remote MongoDB connection string)
- Auth0 account with application configured

---

## EC2 Security Group Configuration

**CRITICAL:** Only these ports should be open:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Nginx) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (future) |

**DO NOT open port 5001** - Backend should only be accessible through Nginx proxy on localhost.

**Why?** Security best practice: Backend is not exposed directly to the internet, only through Nginx which can add security headers, rate limiting, and SSL termination.

---

## Initial Server Setup

### 1. Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
# or
ssh -i your-key.pem ec2-user@your-ec2-ip  # For Amazon Linux
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y  # Ubuntu
# or
sudo yum update -y  # Amazon Linux
```

### 3. Install Node.js 18.x

**Ubuntu:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Verify installation (should show v18.x.x)
```

**Amazon Linux:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
node -v
```

### 4. Install PM2 Globally

```bash
sudo npm install -g pm2
pm2 -v  # Verify installation
```

### 5. Install Nginx

**Ubuntu:**
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Amazon Linux:**
```bash
sudo amazon-linux-extras install nginx1 -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Install MongoDB (if not using remote MongoDB)

**Ubuntu:**
```bash
# Follow MongoDB installation guide for Ubuntu
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

**Amazon Linux:**
```bash
# Follow MongoDB installation guide for Amazon Linux
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-amazon-linux/
```

---

## Backend Deployment

### 1. Clone/Copy Project to EC2

```bash
# Option A: Clone from Git
cd /home/ubuntu
git clone your-repo-url financial-planner
cd financial-planner

# Option B: Copy files via SCP from local machine
# From your local machine:
# scp -r -i your-key.pem ./financial-planner ubuntu@your-ec2-ip:/home/ubuntu/
```

### 2. Install Backend Dependencies

```bash
cd /home/ubuntu/financial-planner/backend
npm install --production
```

### 3. Create Backend Environment File

```bash
cd /home/ubuntu/financial-planner/backend
nano .env
```

**Required variables:**
```env
PORT=5001
HOST=0.0.0.0
NODE_ENV=production

# Frontend URL for CORS (your domain)
FRONTEND_URL=https://financial-planner.alexpicard.info

# MongoDB connection string
MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
# OR for remote MongoDB:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/harmonyhub

# Auth0 (if using Management API)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_M2M_CLIENT_ID=your_m2m_client_id
AUTH0_M2M_CLIENT_SECRET=your_m2m_client_secret
AUTH0_AUDIENCE=https://your-api-audience
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### 4. Create Logs Directory

```bash
mkdir -p /home/ubuntu/financial-planner/backend/logs
```

### 5. Test Backend Manually (Optional)

```bash
cd /home/ubuntu/financial-planner/backend
node server.js
# Should see: "🚀 Server running on port 5001"
# Press Ctrl+C to stop
```

---

## Frontend Deployment

### 1. Install Frontend Dependencies

```bash
cd /home/ubuntu/financial-planner
npm install
```

### 2. Create Production Environment File

```bash
cd /home/ubuntu/financial-planner
nano .env.production
```

**Required variables:**
```env
# Use relative URL - Nginx will proxy /api/* to backend
VITE_API_URL=/api

# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=https://your-api-audience
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### 3. Build Frontend

```bash
cd /home/ubuntu/financial-planner
npm run build
```

This creates a `dist/` directory with production-ready static files.

### 4. Copy Frontend to Web Directory

```bash
# Create web directory
sudo mkdir -p /var/www/financial-planner/dist
sudo chown -R $USER:$USER /var/www/financial-planner

# Copy built files
cp -r /home/ubuntu/financial-planner/dist/* /var/www/financial-planner/dist/
```

---

## Nginx Configuration

### 1. Copy Nginx Configuration

```bash
sudo cp /home/ubuntu/financial-planner/nginx.conf /etc/nginx/sites-available/financial-planner
```

### 2. Update Server Name (if needed)

```bash
sudo nano /etc/nginx/sites-available/financial-planner
```

Change `server_name financial-planner.alexpicard.info _;` to your domain, or keep `_` for default.

### 3. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/financial-planner /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm /etc/nginx/sites-enabled/default
```

### 4. Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

---

## PM2 Process Management

### 1. Start Backend with PM2

```bash
cd /home/ubuntu/financial-planner
pm2 start ecosystem.config.cjs --env production
```

### 2. Save PM2 Process List

```bash
pm2 save
```

### 3. Setup PM2 to Start on Boot

```bash
pm2 startup
```

This will output a command like:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Run the command it shows you** (it will be different for your system).

### 4. Verify PM2 Status

```bash
pm2 status
pm2 logs financial-planner-backend
```

---

## Environment Variables

### Backend Environment Variables

Location: `/home/ubuntu/financial-planner/backend/.env`

**Required:**
- `PORT=5001` - Backend port
- `HOST=0.0.0.0` - Listen on all interfaces
- `FRONTEND_URL` - Your domain (for CORS)
- `MONGO_URI` - MongoDB connection string

**Optional (for Auth0 Management API):**
- `AUTH0_DOMAIN`
- `AUTH0_M2M_CLIENT_ID`
- `AUTH0_M2M_CLIENT_SECRET`
- `AUTH0_AUDIENCE`

### Frontend Environment Variables

Location: `/home/ubuntu/financial-planner/.env.production`

**Required:**
- `VITE_API_URL=/api` - Relative URL (Nginx proxies to backend)
- `VITE_AUTH0_DOMAIN` - Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Your Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Your Auth0 API audience

**Why relative URL?** 
- Works in both dev and production
- No need to change code between environments
- Nginx handles routing automatically

---

## Testing and Verification

### 1. Test Backend Directly

```bash
curl http://localhost:5001/api/health
```

**Expected response:**
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

### 2. Test Backend Through Nginx

```bash
curl http://localhost/api/health
```

**Expected:** Same JSON response as above.

### 3. Test Frontend

```bash
curl http://localhost
```

**Expected:** HTML content of your React app.

### 4. Test from Browser

1. Open your domain in browser: `http://financial-planner.alexpicard.info`
2. Open browser DevTools (F12) → Network tab
3. Try logging in
4. Check for API calls to `/api/*` endpoints
5. Verify they return 200 status codes

### 5. Check PM2 Status

```bash
pm2 status
pm2 logs financial-planner-backend --lines 50
```

### 6. Check Nginx Status

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend Not Starting

**Check PM2 logs:**
```bash
pm2 logs financial-planner-backend
```

**Common issues:**
- MongoDB not running: `sudo systemctl start mongod`
- Missing environment variables: Check `.env` file
- Port already in use: `lsof -ti:5001 | xargs kill -9`

**Restart backend:**
```bash
pm2 restart financial-planner-backend
```

### Nginx Not Proxying Correctly

**Check Nginx error log:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Test Nginx configuration:**
```bash
sudo nginx -t
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

### Frontend Shows ERR_CONNECTION_REFUSED

**Check:**
1. Backend is running: `pm2 status`
2. Backend is listening: `curl http://localhost:5001/api/health`
3. Nginx is running: `sudo systemctl status nginx`
4. Frontend files exist: `ls -la /var/www/financial-planner/dist/`

### Auth0 Issues

**Verify Auth0 configuration:**
1. Check `.env.production` has correct Auth0 values
2. Rebuild frontend: `npm run build`
3. Copy new build: `cp -r dist/* /var/www/financial-planner/dist/`
4. Check Auth0 Dashboard → Applications → Your App → Settings:
   - Allowed Callback URLs: `https://your-domain.com/login`
   - Allowed Logout URLs: `https://your-domain.com`
   - Allowed Web Origins: `https://your-domain.com`

### CORS Errors

**Check backend CORS configuration:**
- `FRONTEND_URL` in `backend/.env` must match your domain
- Restart backend: `pm2 restart financial-planner-backend`

### MongoDB Connection Issues

**Check MongoDB:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Test connection
mongosh
# or
mongo
```

**Update connection string in `backend/.env`:**
```env
MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
```

---

## Quick Reference Commands

### PM2 Commands
```bash
pm2 status                          # View status
pm2 logs financial-planner-backend  # View logs
pm2 restart financial-planner-backend  # Restart
pm2 stop financial-planner-backend     # Stop
pm2 delete financial-planner-backend   # Remove
pm2 save                            # Save process list
```

### Nginx Commands
```bash
sudo nginx -t                       # Test config
sudo systemctl reload nginx         # Reload config
sudo systemctl restart nginx        # Restart
sudo systemctl status nginx         # Check status
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Deployment Commands
```bash
# Rebuild and redeploy frontend
cd /home/ubuntu/financial-planner
npm run build
cp -r dist/* /var/www/financial-planner/dist/
sudo systemctl reload nginx

# Restart backend
pm2 restart financial-planner-backend

# View all logs
pm2 logs financial-planner-backend
sudo tail -f /var/log/nginx/access.log
```

---

## Security Checklist

- [ ] Only ports 22, 80, 443 open in Security Group
- [ ] Port 5001 NOT exposed publicly
- [ ] Environment variables in `.env` files (not committed to git)
- [ ] MongoDB authentication enabled (if using remote MongoDB)
- [ ] Auth0 configured with correct callback/logout URLs
- [ ] Nginx serving static files (not Node.js)
- [ ] PM2 auto-restart enabled
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`

---

## Automated Deployment Script

Use the provided `deploy.sh` script for automated deployment:

```bash
cd /home/ubuntu/financial-planner
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Check and install prerequisites
2. Install dependencies
3. Build frontend
4. Configure Nginx
5. Start backend with PM2
6. Verify deployment

**Note:** You still need to manually create `.env` and `.env.production` files before running the script.

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs financial-planner-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check backend health: `curl http://localhost:5001/api/health`
4. Verify environment variables are set correctly
5. Review this guide's troubleshooting section

