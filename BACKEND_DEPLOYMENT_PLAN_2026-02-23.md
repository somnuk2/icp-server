# ICP Backend Deployment Plan
**Date:** February 23, 2026  
**Target Server:** 10.2.0.6 (Port 22)  
**Target User:** sif-vm1  
**Deployment Type:** Full Backend Setup with Node.js and Express

---

## 📋 Server Information
| Item | Value |
|------|-------|
| **Server IP** | 10.2.0.6 |
| **SSH Port** | 22 |
| **Server User** | sif-vm1 |
| **New Password** | REDACTED_SSH_PASSWORD |
| **Backend Port** | 3000 (default) |
| **Database Server** | 10.2.0.5:3306 |
| **Database Name** | u486700931_icp |

---

## ✅ Pre-Deployment Checklist

### Phase 1: Prerequisites (Local)
- [ ] Verify all backend code is committed to git/backed up
- [ ] Test backend locally with `npm start` 
- [ ] Verify Node.js version compatibility (v16+ recommended)
- [ ] Confirm database connectivity to remote database (10.2.0.5)
- [ ] Generate and test environment configuration file
- [ ] Document any custom configurations or dependencies

### Phase 2: Server Preparation (Remote)
- [ ] SSH access verified to 10.2.0.6:22 with sif-vm1
- [ ] Update server OS and packages: `sudo apt update && sudo apt upgrade -y`
- [ ] Check available disk space: `df -h`
- [ ] Check available RAM: `free -h`
- [ ] Verify firewall rules (allow port 3000 if needed)

---

## 🚀 Deployment Steps

### Step 1: SSH Connection Setup
```bash
# Connect to server
ssh -p 22 sif-vm1@10.2.0.6

# Update password on first login if required
passwd

# Exit and reconnect to verify
exit
```

### Step 2: Install Node.js and npm
```bash
# Update package manager
sudo apt update

# Install Node.js and npm (LTS version recommended)
sudo apt install -y nodejs npm

# Verify installation
node --version
npm --version

# Expected output:
# v18.x.x or higher
# 9.x.x or higher
```

### Step 3: Install Git and Clone Backend Repository
```bash
# Install git
sudo apt install -y git

# Create application directory
mkdir -p /home/sif-vm1/apps
cd /home/sif-vm1/apps

# Clone repository (adjust URL as needed)
git clone https://your-repo-url/icp-project-app.git
cd icp-project-app/backend
```

### Step 4: Configure Environment Variables
```bash
# Navigate to backend directory
cd /home/sif-vm1/apps/icp-project-app/backend

# Create .env file in project root (parent directory)
cd ..
cat > .env << 'EOF'
# Database Configuration
DB_MODE=remote

# Local Database (XAMPP) - Not needed for production
DB_LOCAL_HOST=localhost
DB_LOCAL_PORT=3306
DB_LOCAL_DATABASE=u486700931_icp
DB_LOCAL_USER=u486700931_root
DB_LOCAL_PASSWORD=REDACTED_PASSWORD

# Remote Database (Production Server)
DB_REMOTE_HOST=10.2.0.5
DB_REMOTE_PORT=3306
DB_REMOTE_DATABASE=u486700931_icp
DB_REMOTE_USER=u486700931_root
DB_REMOTE_PASSWORD=REDACTED_PASSWORD

# Application Settings
NODE_ENV=production
PORT=3000
EOF

# Verify .env file created
cat .env
```

### Step 5: Install Dependencies
```bash
# Navigate to backend directory
cd /home/sif-vm1/apps/icp-project-app/backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 6: Initial Database Connection Test
```bash
# Test database connection before starting server
cd /home/sif-vm1/apps/icp-project-app/backend

# Run connection test
node test-db-connection.js

# Expected output: Connection successful message
```

### Step 7: Start Backend Server (Manual Test)
```bash
# Start server in foreground to check for errors
npm start

# Expected output:
# ==================================================
# 🚀 ICP Backend Server Starting...
# ==================================================
# 📊 Database Mode : REMOTE
# 🌐 Port          : 3000
# ==================================================
# ✅ Database connected [REMOTE] → 10.2.0.5:3306/u486700931_icp

# Press CTRL+C to stop
```

### Step 8: Setup Process Manager (PM2)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
pm2 start /home/sif-vm1/apps/icp-project-app/backend/server.js --name "icp-backend"

# Verify it's running
pm2 status

# Setup auto-restart on system reboot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup -u sif-vm1 --hp /home/sif-vm1
pm2 save

# View logs
pm2 logs icp-backend
```

### Step 9: Configure Firewall (if needed)
```bash
# Check firewall status
sudo ufw status

# If firewall is active, allow port 3000
sudo ufw allow 3000/tcp

# Verify rule added
sudo ufw status
```

### Step 10: Setup Reverse Proxy with Nginx (Optional but Recommended)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/icp-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name 10.2.0.6;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the configuration
sudo ln -s /etc/nginx/sites-available/icp-backend /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on startup
sudo systemctl enable nginx
```

---

## 🧪 Testing and Verification

### Test 1: Backend Health Check
```bash
# From local machine or server
curl http://10.2.0.6:3000/health

# Expected response:
# {"status":"OK","dbMode":"remote","timestamp":"2026-02-23T..."}
```

### Test 2: Database Info Endpoint
```bash
curl http://10.2.0.6:3000/api/db-info

# Expected response:
# {"mode":"remote","host":"10.2.0.5","port":3306,"database":"u486700931_icp"}
```

### Test 3: API Authentication Test
```bash
# Test login endpoint
curl -X POST http://10.2.0.6:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Test 4: Verify PM2 Status
```bash
ssh sif-vm1@10.2.0.6
pm2 status
pm2 logs icp-backend
```

---

## 📊 Backend API Routes Available

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Server health check |
| `/api/db-info` | GET | Database connection info |
| `/api/auth` | POST/GET | Authentication endpoints |
| `/api/institutes` | GET/POST/PUT/DELETE | Institute management |
| `/api/faculties` | GET/POST/PUT/DELETE | Faculty management |
| `/api/degrees` | GET/POST/PUT/DELETE | Degree management |
| `/api/departments` | GET/POST/PUT/DELETE | Department management |
| `/api/members` | GET/POST/PUT/DELETE | Member management |
| `/api/individuals` | GET/POST/PUT/DELETE | Individual management |
| `/api/plans` | GET/POST/PUT/DELETE | Plan management |
| `/api/plan-careers` | GET/POST/PUT/DELETE | Plan career mapping |
| `/api/qualifications` | GET/POST/PUT/DELETE | Qualification management |
| `/api/careers` | GET/POST/PUT/DELETE | Career management |
| `/api/reports` | GET/POST | Report generation |

---

## 🔍 Troubleshooting

### Issue: Connection timeout to 10.2.0.5
```bash
# Check if database server is reachable
ping 10.2.0.5
telnet 10.2.0.5 3306

# Verify firewall allows port 3306
sudo ufw status
```

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change port in .env file
```

### Issue: PM2 not starting on boot
```bash
# Regenerate startup script
pm2 startup
pm2 save

# Verify it's added to crontab
crontab -l
```

### Issue: Permission denied errors
```bash
# Check directory permissions
ls -la /home/sif-vm1/apps/icp-project-app/

# Fix if needed
sudo chown -R sif-vm1:sif-vm1 /home/sif-vm1/apps/icp-project-app/
sudo chmod -R 755 /home/sif-vm1/apps/icp-project-app/
```

---

## 📋 Monitoring and Maintenance

### View Server Logs
```bash
# View PM2 logs (real-time)
pm2 logs icp-backend

# View last 100 lines
pm2 logs icp-backend --lines 100

# Save logs to file
pm2 logs icp-backend > app.log
```

### System Resource Monitoring
```bash
# Check server CPU and memory
top

# Check disk space
df -h

# Check running processes
ps aux | grep node
```

### Restart Services
```bash
# Restart backend
pm2 restart icp-backend

# Restart all services
pm2 restart all

# Stop backend
pm2 stop icp-backend

# Delete from PM2
pm2 delete icp-backend
```

---

## 🔐 Security Checklist

- [ ] SSH key-based authentication configured (recommended)
- [ ] Disable SSH password login if possible
- [ ] Configure firewall with minimal open ports
- [ ] Enable HTTPS with SSL certificate (if using Nginx)
- [ ] Set strong database credentials
- [ ] Restrict database access to specific IPs
- [ ] Enable monitoring and alerts
- [ ] Regular backups configured
- [ ] API rate limiting configured (if needed)
- [ ] Environment variables secured (.env not in git repo)

---

## 📝 Deployment Checklist - Final

- [ ] Node.js installed successfully
- [ ] Dependencies installed without errors
- [ ] Environment file (.env) configured correctly
- [ ] Database connection test passed
- [ ] Backend starts without errors
- [ ] PM2 process manager configured
- [ ] Health check endpoint responds
- [ ] API endpoints accessible
- [ ] Firewall rules configured
- [ ] Nginx reverse proxy operational (if used)
- [ ] Error logs reviewed and verified
- [ ] Monitoring and logging setup complete

---

## 📞 Support and Contact

**Deployment Support:** [Contact Backend Maintainer]  
**Database Support:** DBA Team (Database: 10.2.0.5)  
**Server Support:** System Administration Team

---

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Stop the running backend
pm2 stop icp-backend

# Remove from PM2
pm2 delete icp-backend

# Revert to previous version (if needed)
cd /home/sif-vm1/apps/icp-project-app
git checkout previous-stable-version

# Navigate to backend and reinstall
cd backend
npm install

# Start again
pm2 start server.js --name "icp-backend"
```

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** Ready for Deployment


