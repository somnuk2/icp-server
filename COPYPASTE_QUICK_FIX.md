# 🚀 ICP Login Fix - Copy-Paste Quick Commands

**สถานการณ์:** Login ไม่ผ่าน  
**วิธี:** Copy-paste commands ที่นี่ไปรันบน SSH  
**ระยะเวลา:** ~5 นาที  
**ความเสี่ยง:** ต่ำ (มี backup)

---

## 📋 STEP 0: SSH เข้า Server

**Windows PowerShell / Command Prompt:**

```powershell
ssh -p 22 sif-vm1@10.2.0.6
```

**When prompted for password, paste:**
```
REDACTED_SSH_PASSWORD
```

**Expected result:**
```
sif-vm1@vm1:~$
```

---

## 📋 STEP 1: Check Current Configuration

```bash
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**Expected output (if broken):**
```
DB_MODE=local
NODE_ENV=development
```

**Expected output (if fixed):**
```
DB_MODE=remote
NODE_ENV=production
```

---

## 📋 STEP 2: Fix Configuration (Backup First)

```bash
# Backup .env
cp /home/sif-vm1/apps/icp-project-app/.env /home/sif-vm1/apps/icp-project-app/.env.backup.$(date +%s)

# Fix DB_MODE
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env

# Fix NODE_ENV
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env

# Verify
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**Verify result shows:**
```
DB_MODE=remote
NODE_ENV=production
```

---

## 📋 STEP 3: Setup Test Users in Database

### 3a. Check current test users:
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
"SELECT email, password, status, is_verified FROM member \
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com') \
ORDER BY email;"
```

### 3b. Update/Insert test users:
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'ENDSQL'

-- Update existing test users
UPDATE member SET password='123456', status='admin', is_verified=1 
WHERE email='somnuk@mju.ac.th';

UPDATE member SET password='123456', status='superuser', is_verified=1 
WHERE email='somnuk.sin1@gmail.com';

UPDATE member SET password='123456', status='user', is_verified=1 
WHERE email='somnuk.sin@gmail.com';

-- Insert if not exists
INSERT IGNORE INTO member (email, password, full_name, status, is_verified, created_at) VALUES
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1, NOW()),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1, NOW()),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1, NOW());

ENDSQL
```

### 3c. Verify users created:
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
"SELECT email, password, status, is_verified FROM member \
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com') \
ORDER BY email;"
```

**Verify result (all should show password='123456'):**
```
| email                  | password | status     | is_verified |
|------------------------|----------|------------|------------|
| somnuk@mju.ac.th       | 123456   | admin      | 1          |
| somnuk.sin1@gmail.com  | 123456   | superuser  | 1          |
| somnuk.sin@gmail.com   | 123456   | user       | 1          |
```

---

## 📋 STEP 4: Restart Backend

```bash
# Go to app directory
cd /home/sif-vm1/apps/icp-project-app

# Check current status
pm2 status

# Restart backend
pm2 restart icp-backend

# Wait 5 seconds
sleep 5

# Check new status (should show 'online')
pm2 status
```

**Verify: status column shows "online"**

---

## 📋 STEP 5: Verify Logs

```bash
# View last 20 lines of logs
pm2 logs icp-backend --lines 20 --nostream
```

**Look for:**
```
✓ Database connected
✓ Server running on port 3000
✓ API endpoints ready
```

---

## 📋 STEP 6: Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'
```

**Expected response (should contain token or success):**
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "email": "somnuk@mju.ac.th",
    "status": "admin"
  }
}
```

---

## 📋 STEP 7: Test Web Login (from Browser)

1. Open browser
2. Visit: https://icp.sif.or.th/icp-project-app/
3. Login with:
   - Email: `somnuk@mju.ac.th`
   - Password: `123456`

**Expected: Dashboard loads ✓**

---

## ✅ Complete - All Done!

If you see success at STEP 7, login issue is **FIXED** ✓

---

## ❌ If Something Goes Wrong

### Error: SSH "Permission denied"
```bash
# Double-check password (case-sensitive):
# Password: REDACTED_SSH_PASSWORD

# Or verify server is reachable:
# From your Windows: ping 10.2.0.6
```

### Error: "mysql: command not found"
```bash
# MySQL may not be in PATH, try full path:
/usr/bin/mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e "SELECT 1"
```

### Error: "Can't connect to MySQL server"
```bash
# Verify database is accessible:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"

# If fails, check:
# - IP address 10.2.0.5 is correct
# - Port 3306 is open
# - Credentials are correct (u486700931_root / REDACTED_PASSWORD)
```

### Error: "Backend still offline"
```bash
# Check error logs:
pm2 logs icp-backend --lines 50 --nostream

# Try manual start:
cd /home/sif-vm1/apps/icp-project-app
npm install  # May need to install dependencies
pm2 start backend/server.js --name icp-backend
```

### Error: "API returns 404 or error"
```bash
# Check if Node.js backend is actually running:
ps aux | grep node

# Check listening ports:
netstat -tlnp | grep 3000

# Check if Nginx is proxying correctly:
sudo nginx -t
sudo tail -20 /var/log/nginx/error.log
```

### Error: "Can login API but not web"
```bash
# Clear browser cache: Ctrl+Shift+Delete
# Check Nginx proxy:
sudo cat /etc/nginx/sites-enabled/*.conf | grep -A5 "proxy_pass"
# Check CORS:
curl -X OPTIONS http://localhost:3000/api/auth/login -v
```

---

## 🔧 Alternative: Use Full Automated Script

If manual commands are too tedious, run this instead (after SSH):

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/.../fix-login-complete.sh
chmod +x fix-login-complete.sh
bash fix-login-complete.sh
```

Or paste the contents of `fix-login-complete.sh` if URL is not accessible.

---

## 🚨 Emergency Rollback

If something breaks:

```bash
# Restore from backup
cp /home/sif-vm1/apps/icp-project-app/.env.backup.* /home/sif-vm1/apps/icp-project-app/.env

# List backups:
ls -la /home/sif-vm1/apps/icp-project-app/.env.backup.*

# Use the latest one:
cp /home/sif-vm1/apps/icp-project-app/.env.backup.[HIGHEST-NUMBER] /home/sif-vm1/apps/icp-project-app/.env

# Restart
pm2 restart icp-backend
```

---

## 📞 Still Having Issues?

Collect these logs and contact support:

```bash
# 1. Configuration
grep -E '^(DB_|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env

# 2. Database status
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"

# 3. Backend logs
pm2 logs icp-backend --lines 50 --nostream

# 4. Nginx logs
sudo tail -50 /var/log/nginx/error.log

# 5. System info
uname -a
node --version
npm --version
mysql --version
```

Send all output to support.

---

**Time estimate:** 5 minutes  
**Difficulty:** Beginner-friendly ⭐  
**Reliability:** High ✓


