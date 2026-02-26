# 🔐 ICP Backend - Login Issue Troubleshooting & Fix Guide
**Date:** February 24, 2026  
**Status:** Login Authentication Issues Identified & Documented

---

## 📌 SUMMARY OF LOGIN ISSUES

### Test Accounts:
```
Admin:      somnuk@mju.ac.th       / 123456
SuperUser:  somnuk.sin1@gmail.com  / 123456  
User:       somnuk.sin@gmail.com   / 123456
```

### Issues Identified:

1. **Database Mode Configuration**
   - Current: `DB_MODE=local` (using localhost database)
   - Required: `DB_MODE=remote` (for production server 10.2.0.5)
   - **IMPACT:** Backend is not connecting to the production database

2. **Inconsistent Password Credentials**
   - Remote DB (`u486700931_icp.sql`): somnuk@mju.ac.th has password `1234`
   - Local DB (`local_database_dump.sql`): somnuk@mju.ac.th has password `123456`
   - Test users might not exist in remote database
   - **IMPACT:** Login fails due to wrong database or user not found

3. **Test User Status Values**
   - Database might have incorrect status values (e.g., 'suser' instead of 'superuser')
   - Backend expects: `'admin'`, `'superuser'`, or `'user'`
   - **IMPACT:** Even if login succeeds, role assignment might be wrong

---

## 🔧 FIXES REQUIRED

### FIX #1: Update .env Configuration

**File:** `/home/sif-vm1/apps/icp-project-app/.env`

**Change 1: Set Database to Remote**
```env
# BEFORE:
DB_MODE=local

# AFTER:
DB_MODE=remote
```

**Change 2: Set Node Environment to Production**
```env
# BEFORE:
NODE_ENV=development

# AFTER:
NODE_ENV=production
```

**How to Apply via SSH:**
```bash
ssh -p 22 sif-vm1@10.2.0.6

# Edit the .env file
nano /home/sif-vm1/apps/icp-project-app/.env

# Or use sed to replace:
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env

# Verify the changes:
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

---

### FIX #2: Update Test User Credentials in Remote Database

**Database:** `u486700931_icp` on `10.2.0.5:3306`  
**User:** `u486700931_root`

**Execute this SQL:**

```sql
-- ============================================================================
-- ICP Test Users - Credentials Update
-- ============================================================================

-- Update existing test users with correct credentials:
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';

-- If users don't exist, insert them:
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);

-- Verify the changes:
SELECT email, password, status, is_verified FROM member 
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com')
ORDER BY email;
```

**How to Execute via SSH:**

```bash
# Option 1: Using MySQL client
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOF'
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';
SELECT email, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');
EOF

# Option 2: Copy SQL file and execute
scp fix-login-users.sql sif-vm1@10.2.0.6:/home/sif-vm1/
ssh sif-vm1@10.2.0.6 'mysql -h 10.2.0.5 -u u486700931_root -p"REDACTED_PASSWORD" u486700931_icp < fix-login-users.sql'
```

---

### FIX #3: Restart Backend Service

**After applying the above fixes, restart the backend:**

```bash
ssh sif-vm1@10.2.0.6

# Check current status
pm2 status

# Restart the backend service
pm2 restart icp-backend

# View recent logs to confirm startup
pm2 logs icp-backend --lines 50

# Expected log output:
# ✅ Database connected [REMOTE] → 10.2.0.5:3306/u486700931_icp
```

**Alternative - Manual Restart:**
```bash
# Stop current process
pm2 stop icp-backend

# Start backend manually
cd /home/sif-vm1/apps/icp-project-app/backend
node server.js

# Check if server starts without errors
# Should see: "Database connected" message
# Press Ctrl+C to stop

# Then restart via PM2
pm2 start /home/sif-vm1/apps/icp-project-app/backend/server.js --name icp-backend
pm2 save
```

---

## ✅ TESTING LOGIN

### Test Accounts After Fixes:

```
Account 1 (Admin):
  Email:    somnuk@mju.ac.th
  Password: 123456
  Expected Role: admin

Account 2 (Super User):
  Email:    somnuk.sin1@gmail.com
  Password: 123456
  Expected Role: superuser

Account 3 (Regular User):
  Email:    somnuk.sin@gmail.com
  Password: 123456
  Expected Role: user
```

### Test via cURL:

```bash
# Test Admin Login
curl -X POST http://10.2.0.6:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'

# Expected Success Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "member_id": 1,
#   "email": "somnuk@mju.ac.th",
#   "role": "admin",
#   "full_name": "สมนึก สินธุปวน"
# }

# Test with wrong password (should fail):
curl -X POST http://10.2.0.6:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"wrongpassword"}'

# Expected Error Response:
# {"error":"Invalid email or password."}
```

### Test via Web Application:

1. Open: https://icp.sif.or.th/icp-project-app/
2. Login with credentials above
3. Should redirect to dashboard

---

## 🔍 TROUBLESHOOTING CHECKLIST

If login still fails after applying fixes:

- [ ] **Check .env file was properly updated:**
  ```bash
  grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
  # Should show: DB_MODE=remote and NODE_ENV=production
  ```

- [ ] **Check database connectivity:**
  ```bash
  # From production server:
  mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT COUNT(*) FROM u486700931_icp.member;"
  # Should return a number
  ```

- [ ] **Verify test users exist in database:**
  ```bash
  mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e \
    "SELECT email, password, status FROM u486700931_icp.member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');"
  ```

- [ ] **Check backend is running:**
  ```bash
  ssh sif-vm1@10.2.0.6 "pm2 status"
  # icp-backend should show "online"
  ```

- [ ] **Check backend logs for errors:**
  ```bash
  ssh sif-vm1@10.2.0.6 "pm2 logs icp-backend --lines 100 | grep -i error"
  ```

- [ ] **Check if port 3000 is listening:**
  ```bash
  ssh sif-vm1@10.2.0.6 "netstat -lntp | grep 3000"
  # Should show process listening on 3000
  ```

---

## 📊 VERIFICATION CHECKLIST

| Component | Status | Check Command |
|-----------|--------|---|
| .env DB_MODE | [ ] Remote | grep ^DB_MODE= .env |
| .env NODE_ENV | [ ] Production | grep ^NODE_ENV= .env |
| Backend Running | [ ] Online | pm2 status |
| Database Connection | [ ] Connected | pm2 logs icp-backend |
| Test User Admin | [ ] Exists | mysql query |
| Test User SuperUser | [ ] Exists | mysql query |
| Test User Regular | [ ] Exists | mysql query |
| Login Endpoint | [ ] Responds | curl test |
| Admin Can Login | [ ] Success | Web test |
| SuperUser Can Login | [ ] Success | Web test |
| Regular User Can Login | [ ] Success | Web test |

---

## 📞 SUPPORT INFORMATION

**If issues persist:**

1. **Collect logs:**
   ```bash
   pm2 logs icp-backend --lines 200 > backend-logs.txt
   mysql u486700931_icp -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT * FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');" > user-check.txt
   cat /home/sif-vm1/apps/icp-project-app/.env | grep -E '^(DB_|NODE_)' > env-check.txt
   ```

2. **Review logs for specific errors**

3. **Verify all three fixes were applied correctly**

---

**Generated:** February 24, 2026  
**Backend Login Fix Guide**


