#!/bin/bash
# Stable Update Script for ICP Project
# Location: /home/sif-vm1/update-from-github.sh

set -e

# Configuration
PROJECT_DIR="/var/www/apps/icp-project-app"
BACKEND_DIR="$PROJECT_DIR/backend"
NVM_DIR="$HOME/.nvm"
NODE_VERSION="20.20.0"

# Load NVM and setup Node
echo "⚙️  Loading NVM..."
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use $NODE_VERSION || nvm install $NODE_VERSION

# Add NPM binaries to PATH (for pm2, quasar, etc)
export PATH="$HOME/.nvm/versions/node/v$NODE_VERSION/bin:$PATH"

# Check tools
echo "📦 Node: $(node -v)"
echo "📦 NPM: $(npm -v)"

# ICP Project Update
echo "------- UPDATING ICP PROJECT -------"
cd $PROJECT_DIR

echo "📥 Fetching and Reseting to latest code from GitHub..."
git fetch origin master
git reset --hard origin/master

echo "🧹 Cleaning old dependencies and build files..."
rm -rf node_modules package-lock.json dist/spa

echo "🏗️ Installing Frontend dependencies (Full Clean)..."
npm install --include=optional

echo "🏗️ Building Frontend (Quasar)..."
npx quasar build

if [ ! -d "dist/spa" ]; then
  echo "❌ Error: Build failed, dist/spa directory not found!"
  exit 1
fi

echo "📂 Deploying Frontend files to /var/www/icp-project-app..."
# Using sudo because /var/www may have restricted permissions
sudo rm -rf /var/www/icp-project-app/*
sudo cp -rv dist/spa/* /var/www/icp-project-app/

echo "🚀 Updating Backend..."
cd $BACKEND_DIR
rm -rf node_modules package-lock.json
npm install --omit=dev --include=optional

# Restart PM2 process
echo "🔄 Checking PM2..."
PM2_BIN=$(which pm2 || echo "$HOME/.nvm/versions/node/v$NODE_VERSION/bin/pm2")

if [ ! -f "$PM2_BIN" ]; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
    PM2_BIN=$(which pm2)
fi

echo "🔄 Restarting PM2 process [icp-backend]..."
$PM2_BIN restart icp-backend --update-env || $PM2_BIN start server.js --name icp-backend

echo "✅ Update Complete!"
$PM2_BIN status


