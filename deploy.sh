#!/bin/bash

# Financial Planner - Production Deployment Script
# This script deploys both frontend and backend to AWS EC2
# Run this script on your EC2 instance

set -e  # Exit on any error

echo "🚀 Starting Financial Planner Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/financial-planner"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIST="/var/www/financial-planner/dist"
NGINX_SITE="/etc/nginx/sites-available/financial-planner"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root (some commands need sudo)
if [ "$EUID" -eq 0 ]; then 
    print_warning "Running as root. Some commands may need adjustment."
fi

echo "Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed"
fi

# Check PM2
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    print_status "PM2 installed: $PM2_VERSION"
else
    print_error "PM2 not found. Installing..."
    sudo npm install -g pm2
    print_status "PM2 installed"
fi

# Check Nginx
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    print_status "Nginx installed: $NGINX_VERSION"
else
    print_error "Nginx not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y nginx
    sudo systemctl enable nginx
    print_status "Nginx installed and enabled"
fi

# Check MongoDB
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    print_status "MongoDB client found"
else
    print_warning "MongoDB client not found. Make sure MongoDB is installed and running."
fi

echo ""
echo "Step 2: Setting up project directory..."
echo ""

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    print_warning "Project directory not found: $PROJECT_DIR"
    print_warning "Please clone your repository or copy files to $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
print_status "Working directory: $(pwd)"

echo ""
echo "Step 3: Installing backend dependencies..."
echo ""

cd "$BACKEND_DIR"
if [ ! -f "package.json" ]; then
    print_error "package.json not found in backend directory"
    exit 1
fi

npm install --production
print_status "Backend dependencies installed"

echo ""
echo "Step 4: Setting up backend environment variables..."
echo ""

if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        print_warning "Creating .env from .env.example"
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        print_warning "⚠️  IMPORTANT: Edit $BACKEND_DIR/.env with your actual values!"
        print_warning "   Required: MONGO_URI, FRONTEND_URL"
    else
        print_error ".env file not found and no .env.example to copy"
        print_warning "Create $BACKEND_DIR/.env manually with required variables"
    fi
else
    print_status ".env file exists"
fi

echo ""
echo "Step 5: Creating logs directory..."
echo ""

mkdir -p "$BACKEND_DIR/logs"
print_status "Logs directory created"

echo ""
echo "Step 6: Building frontend..."
echo ""

cd "$PROJECT_DIR"

# Check for production environment file
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        print_warning "Creating .env.production from .env.production.example"
        cp ".env.production.example" ".env.production"
        print_warning "⚠️  IMPORTANT: Edit .env.production with your actual values!"
    else
        print_warning "No .env.production found. Using defaults."
    fi
fi

npm install
npm run build
print_status "Frontend built successfully"

echo ""
echo "Step 7: Setting up frontend static files..."
echo ""

# Create directory for frontend
sudo mkdir -p "$FRONTEND_DIST"
sudo chown -R $USER:$USER "$(dirname $FRONTEND_DIST)"

# Copy built files
cp -r dist/* "$FRONTEND_DIST/"
print_status "Frontend files copied to $FRONTEND_DIST"

echo ""
echo "Step 8: Configuring Nginx..."
echo ""

# Copy Nginx config
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    sudo cp "$PROJECT_DIR/nginx.conf" "$NGINX_SITE"
    print_status "Nginx configuration copied"
    
    # Update root path in config if needed
    sudo sed -i "s|root /var/www/financial-planner/dist;|root $FRONTEND_DIST;|g" "$NGINX_SITE"
    
    # Create symlink if it doesn't exist
    if [ ! -L "/etc/nginx/sites-enabled/financial-planner" ]; then
        sudo ln -s "$NGINX_SITE" /etc/nginx/sites-enabled/
        print_status "Nginx site enabled"
    fi
    
    # Remove default site if it exists
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        sudo rm /etc/nginx/sites-enabled/default
        print_status "Default Nginx site removed"
    fi
    
    # Test Nginx configuration
    if sudo nginx -t; then
        print_status "Nginx configuration is valid"
        sudo systemctl reload nginx
        print_status "Nginx reloaded"
    else
        print_error "Nginx configuration test failed!"
        exit 1
    fi
else
    print_error "nginx.conf not found in project directory"
    exit 1
fi

echo ""
echo "Step 9: Starting backend with PM2..."
echo ""

cd "$PROJECT_DIR"

# Stop existing PM2 process if running
pm2 stop financial-planner-backend 2>/dev/null || true
pm2 delete financial-planner-backend 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.cjs --env production
print_status "Backend started with PM2"

# Save PM2 process list
pm2 save
print_status "PM2 process list saved"

# Setup PM2 startup script
if [ ! -f ~/.pm2/dump.pm2 ]; then
    print_warning "Setting up PM2 startup script..."
    STARTUP_CMD=$(pm2 startup | grep "sudo")
    if [ ! -z "$STARTUP_CMD" ]; then
        print_warning "Run this command to enable PM2 on boot:"
        echo "$STARTUP_CMD"
    fi
fi

echo ""
echo "Step 10: Verifying deployment..."
echo ""

# Check backend health
sleep 2
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed!"
    print_warning "Check PM2 logs: pm2 logs financial-planner-backend"
fi

# Check Nginx
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_status "Nginx proxy working correctly"
else
    print_warning "Nginx proxy test failed (may need to check configuration)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify backend is running: pm2 status"
echo "2. Check backend logs: pm2 logs financial-planner-backend"
echo "3. Test API: curl http://localhost:5001/api/health"
echo "4. Test through Nginx: curl http://localhost/api/health"
echo "5. Visit your domain in a browser"
echo ""
echo "If PM2 startup script was shown above, run it to enable auto-start on reboot"
echo ""

