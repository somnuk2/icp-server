# ICP Backend Deployment - Quick Reference Guide

## 🚀 Quick Start (Manual Deployment)

### 1. Connect via SSH
```bash
ssh -p 22 sif-vm1@10.2.0.6
```

### 2. Update System and Install Node.js
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git curl
node --version
npm --version
```

### 3. Create Application Directory
```bash
mkdir -p /home/sif-vm1/apps/icp-project-app/backend
cd /home/sif-vm1/apps/icp-project-app
```

### 4. Copy Backend Files (from local machine)
```bash
# From your Windows machine in PowerShell
scp -r -P 22 backend/ sif-vm1@10.2.0.6:/home/sif-vm1/apps/icp-project-app/backend
scp -P 22 .env sif-vm1@10.2.0.6:/home/sif-vm1/apps/icp-project-app/.env
```

### 5. Install Dependencies
```bash
cd /home/sif-vm1/apps/icp-project-app/backend
npm install --production
```

### 6. Test Database Connection
```bash
node test-db-connection.js
```

### 7. Install PM2 and Start Server
```bash
sudo npm install -g pm2
pm2 start server.js --name "icp-backend" --env production
pm2 startup
pm2 save
```

### 8. Configure Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

### 9. Test Backend
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/db-info
```

---

## 🔧 Essential Commands

### PM2 Process Management
```bash
# Start
pm2 start server.js --name "icp-backend"

# Stop
pm2 stop icp-backend

# Restart
pm2 restart icp-backend

# Delete
pm2 delete icp-backend

# Status
pm2 status

# View logs (real-time)
pm2 logs icp-backend

# View last 100 lines
pm2 logs icp-backend --lines 100

# Monit (resource usage)
pm2 monit

# Save state for auto-restart
pm2 startup
pm2 save
```

### Database Verification
```bash
# Test connectivity
node test-db-connection.js

# Verify database records
mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp -e "SELECT COUNT(*) FROM member;"
```

### System Information
```bash
# Check Node.js version
node --version
npm --version

# Check disk space
df -h
df -h /home

# Check memory usage
free -h

# Check CPU usage
top
ps aux | grep node

# Check listening ports
netstat -lntp | grep 3000
# or
ss -lntp | grep 3000

# Check firewall status
sudo ufw status
sudo ufw status numbered
```

### Log Monitoring
```bash
# View all PM2 logs
pm2 logs

# View specific app logs
pm2 logs icp-backend

# Follow new entries
pm2 logs icp-backend --follow

# Save logs to file
pm2 logs icp-backend > backend.log

# Clear logs
pm2 flush
```

---

## 🧪 API Testing

### Health Check
```bash
curl http://10.2.0.6:3000/health
```

**Expected Response:**
```json
{"status":"OK","dbMode":"remote","timestamp":"2026-02-23T..."}
```

### Database Connection Info
```bash
curl http://10.2.0.6:3000/api/db-info
```

**Expected Response:**
```json
{"mode":"remote","host":"10.2.0.5","port":3306,"database":"u486700931_icp"}
```

### Test Login (adjust credentials)
```bash
curl -X POST http://10.2.0.6:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Institutes List
```bash
curl http://10.2.0.6:3000/api/institutes
```

### Get Members List
```bash
curl http://10.2.0.6:3000/api/members
```

---

## 🔍 Troubleshooting

### Issue: Port already in use
```bash
# Find process on port 3000
sudo lsof -i :3000
# or
netstat -lntp | grep 3000

# Kill the process
sudo kill -9 <PID>

# Or change port in .env file
```

### Issue: Cannot connect to database
```bash
# Test MongoDB connectivity
telnet 10.2.0.5 3306

# Verify credentials
mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp

# Check firewall rules on DB server
# (Contact DBA or system admin)
```

### Issue: PM2 not starting on boot
```bash
# Regenerate startup script
pm2 startup

# Verify cron job
crontab -l

# Check PM2 logs
pm2 logs

# Manually restart if needed
pm2 restart all
```

### Issue: High memory or CPU usage
```bash
# Monitor in real-time
pm2 monit

# Check what's consuming resources
ps aux | grep node
top

# Restart app to clear memory
pm2 restart icp-backend

# Check for memory leaks in application
# Review logs for errors
```

### Issue: Backend starts but no connections
```bash
# Verify port is listening
sudo netstat -lntp | grep 3000

# Check node process
ps aux | grep "node server.js"

# View error logs
pm2 logs icp-backend

# Test locally first
curl http://localhost:3000/health
```

---

## 📊 Backend Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/api/db-info` | GET | Database connection info |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/institutes` | GET/POST/PUT/DELETE | Institute management |
| `/api/faculties` | GET/POST/PUT/DELETE | Faculty management |
| `/api/members` | GET/POST/PUT/DELETE | Member management |
| `/api/individuals` | GET/POST/PUT/DELETE | Individual records |
| `/api/plans` | GET/POST/PUT/DELETE | Plan management |
| `/api/qualifications` | GET/POST/PUT/DELETE | Qualification management |
| `/api/careers` | GET/POST/PUT/DELETE | Career management |
| `/api/reports` | GET/POST | Report generation |
| `/api/dashboard` | GET | Dashboard data |

---

## 🔐 Security Checklist

- [ ] SSH key-based authentication configured
- [ ] Disable SSH password login (no password)
- [ ] Firewall configured with only necessary ports
- [ ] Database password secured (not in git)
- [ ] SSL/TLS certificate installed and configured
- [ ] API rate limiting implemented (if needed)
- [ ] CORS configured appropriately
- [ ] Environment variables secured
- [ ] Regular security updates applied
- [ ] Logs monitored and reviewed
- [ ] Backups configured and tested
- [ ] Disaster recovery plan in place

---

## 🔄 Backup and Recovery

### Backup Database
```bash
# Local backup
mysqldump -h 10.2.0.5 -u u486700931_root -p u486700931_icp > backup.sql

# Or use SSH to remote backup
ssh -p 22 sif-vm1@10.2.0.6 "mysqldump -h 10.2.0.5 -u u486700931_root -p u486700931_icp" > remote-backup.sql
```

### Backup Application
```bash
# Backup entire app directory
tar -czf icp-backend-backup-$(date +%Y%m%d).tar.gz /home/sif-vm1/apps/icp-project-app/

# Copy to local machine
scp -r -P 22 sif-vm1@10.2.0.6:/home/sif-vm1/apps/icp-project-app ./backup-$(date +%Y%m%d)/
```

### Quick Rollback
```bash
# Stop the current version
pm2 stop icp-backend

# Restore from backup
tar -xzf icp-backend-backup-20260223.tar.gz

# Or restore from git
cd /home/sif-vm1/apps/icp-project-app
git checkout <previous-commit-hash>

# Reinstall dependencies
cd backend
npm install

# Start again
pm2 start server.js
```

---

## 📧 Support & Escalation

**Backend Issues:**
- Check PM2 logs: `pm2 logs icp-backend`
- Check system resources: `pm2 monit`
- Review application errors

**Database Issues:**
- Database Server: 10.2.0.5
- Contact: DBA Team
- Verify connectivity: `telnet 10.2.0.5 3306`

**Server Access Issues:**
- SSH Port: 22
- Username: sif-vm1
- Contact: System Administration

---

## 📝 Environment File (.env)

```dotenv
# Database Configuration
DB_MODE=remote

# Remote Database Settings
DB_REMOTE_HOST=10.2.0.5
DB_REMOTE_PORT=3306
DB_REMOTE_DATABASE=u486700931_icp
DB_REMOTE_USER=u486700931_root
DB_REMOTE_PASSWORD=REDACTED_PASSWORD

# Application Settings
NODE_ENV=production
PORT=3000
```

---

## 🎯 Deployment Monitoring

### Daily Checks
```bash
# Check service status
pm2 status

# Check logs for errors
pm2 logs icp-backend | tail -20

# Check system resources
pm2 monit

# Test health endpoint
curl http://10.2.0.6:3000/health
```

### Weekly Checks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check disk usage
df -h

# Check database size
mysql -h 10.2.0.5 -u u486700931_root -p -E <<< "SELECT table_name, round(((data_length + index_length) / 1024 / 1024), 2) FROM information_schema.tables WHERE table_schema = 'u486700931_icp';"

# Backup application and database
```

### Monthly Checks
```bash
# Full system security review
sudo ufw status
sudo apt list --upgradable

# Database maintenance
mysql -h 10.2.0.5 -u u486700931_root -p u486700931_icp -e "CHECK TABLE member; OPTIMIZE TABLE member;"

# Performance analysis
# Review PM2 memory usage trends
pm2 logs icp-backend | grep ERROR
```

---

## 📞 Contact Information

| Role | Contact |
|------|---------|
| Backend Developer | [Your Name] |
| DevOps/SysAdmin | [Admin Name] |
| Database Admin | [DBA Name] |
| Project Manager | [PM Name] |

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** Active and Ready for Use


