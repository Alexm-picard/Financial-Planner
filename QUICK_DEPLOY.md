# Quick Deployment Reference

## One-Command Deployment (After Initial Setup)

```bash
cd /home/ubuntu/financial-planner && ./deploy.sh
```

## Manual Step-by-Step Commands

### 1. Initial Setup (One-time)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

### 2. Deploy Backend

```bash
# Navigate to project
cd /home/ubuntu/financial-planner

# Install backend dependencies
cd backend
npm install --production

# Create .env file (copy from template)
cp env.template .env
nano .env  # Edit with your values

# Create logs directory
mkdir -p logs

# Start with PM2
cd ..
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Follow the command it shows
```

### 3. Deploy Frontend

```bash
# Navigate to project root
cd /home/ubuntu/financial-planner

# Create production env file
cp env.production.template .env.production
nano .env.production  # Edit with your values

# Install and build
npm install
npm run build

# Copy to web directory
sudo mkdir -p /var/www/financial-planner/dist
sudo chown -R $USER:$USER /var/www/financial-planner
cp -r dist/* /var/www/financial-planner/dist/
```

### 4. Configure Nginx

```bash
# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/financial-planner

# Enable site
sudo ln -s /etc/nginx/sites-available/financial-planner /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verify

```bash
# Test backend
curl http://localhost:5001/api/health

# Test through Nginx
curl http://localhost/api/health

# Check PM2
pm2 status
pm2 logs financial-planner-backend
```

## Environment Variables Quick Reference

### Backend (.env)
```env
PORT=5001
HOST=0.0.0.0
NODE_ENV=production
FRONTEND_URL=https://financial-planner.alexpicard.info
MONGO_URI=mongodb://127.0.0.1:27017/harmonyhub
```

### Frontend (.env.production)
```env
VITE_API_URL=/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://your-api-audience
```

## Common Commands

```bash
# Restart backend
pm2 restart financial-planner-backend

# View logs
pm2 logs financial-planner-backend

# Rebuild frontend
cd /home/ubuntu/financial-planner
npm run build
cp -r dist/* /var/www/financial-planner/dist/
sudo systemctl reload nginx

# Check services
pm2 status
sudo systemctl status nginx
curl http://localhost:5001/api/health
```

## Troubleshooting Quick Fixes

```bash
# Backend not starting
pm2 logs financial-planner-backend
cd backend && node server.js  # Test manually

# Nginx issues
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Port conflict
lsof -ti:5001 | xargs kill -9
pm2 restart financial-planner-backend

# MongoDB connection
sudo systemctl status mongod
mongosh  # Test connection
```

