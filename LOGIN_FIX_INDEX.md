# 📑 ICP Login Fix - Documents & Tools Index

**Problem:** Login ไม่ผ่าน https://icp.sif.or.th/icp-project-app/  
**Date:** 24 Feb 2026  
**Severity:** 🔴 CRITICAL  
**Status:** Fix materials prepared ✓

---

## 📚 Quick Navigation

| ต้องการ | เอกสาร | ลิงก์ |
|--------|--------|------|
| **เลือกวิธีแก้ที่ดีที่สุด** | 👉 Navigation Guide | [LOGIN_FIX_NAVIGATION.md](LOGIN_FIX_NAVIGATION.md) |
| **ต้องการแล้วทำเลย** | 👉 Copy-Paste Commands | [COPYPASTE_QUICK_FIX.md](COPYPASTE_QUICK_FIX.md) |
| **ต้องการเข้าใจละเอียด** | 👉 Thai Detailed Guide | [LOGIN_FIX_THAI_DETAILED.md](LOGIN_FIX_THAI_DETAILED.md) |
| **ต้องการปฏิบัติทีละขั้น (Manual)** | 👉 Step-by-step Manual | [LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md) |
| **ต้องการให้ script ทำให้** | 👉 Automated Tools (ด้านล่าง) | ดูส่วน "🔧 Tools" |

---

## 🔧 Available Tools/Scripts

### Option A: PowerShell Automated (Windows)
```powershell
# Location: fix-login-automated.ps1
# Usage:
cd D:\Project-icp\icp-project-app
.\fix-login-automated.ps1

# What it does:
# ✓ Verifies SSH connection
# ✓ Checks current config
# ✓ Fixes .env file
# ✓ Updates test users in DB
# ✓ Restarts backend
# ✓ Tests API
# ✓ Reports status

# Requirements: Windows 10+ + SSH available
# Time: 2-3 minutes
# Difficulty: Easy ⭐
```

### Option B: Bash Script (Recommended)
```bash
# Location: fix-login-complete.sh
# Usage (after SSH to server):
bash fix-login-complete.sh

# What it does:
# ✓ Backups .env
# ✓ Fixes .env (DB_MODE, NODE_ENV)
# ✓ Updates test users
# ✓ Verifies DB connection
# ✓ Checks PM2 status
# ✓ Restarts backend
# ✓ Tests API endpoint
# ✓ Detailed output

# Requirements: SSH access to server
# Time: 3-5 minutes
# Difficulty: Easy ⭐
# Reliability: Highest ✓✓✓
```

### Option C: Python Diagnostic (Check First)
```bash
# Location: diagnose_login_issue_v2.py
# Usage:
python diagnose_login_issue_v2.py

# What it does:
# ✓ Tests SSH connection
# ✓ Checks .env config
# ✓ Verifies PM2 status
# ✓ Tests database
# ✓ Checks users
# ✓ Tests API
# ✓ Reports issues

# Requirements: Python 3 + SSH
# Time: 2-3 minutes
# Best for: Understanding what's wrong
```

### Option D: Manual SQL Script
```sql
# Location: fix-login-users.sql
# Usage:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp < fix-login-users.sql

# What it does:
# ✓ Updates test user credentials
# ✓ Ensures users exist in DB
# ✓ Verifies changes

# Use only if: You need to update users but .env is already fixed
# Time: 1 minute
```

---

## 📖 Documentation Files

### เอกสารฉบับคุณ (For You)
- **[LOGIN_FIX_NAVIGATION.md](LOGIN_FIX_NAVIGATION.md)** ⭐⭐⭐
  - วิธีเลือกแนวทาง
  - เปรียบเทียบแต่ละวิธี
  - Time estimate
  - Start here!

- **[COPYPASTE_QUICK_FIX.md](COPYPASTE_QUICK_FIX.md)** ⭐⭐⭐
  - Copy-paste commands
  - ทำเลยไม่ต้องคิด
  - Includes troubleshooting

- **[LOGIN_FIX_THAI_DETAILED.md](LOGIN_FIX_THAI_DETAILED.md)** ⭐⭐
  - ข้อมูลละเอียดไทย
  - ทำความเข้าใจ
  - คำอธิบายแต่ละขั้นตอน

### เอกสารเดิม (Original)
- **[LOGIN_FIX_GUIDE.md](LOGIN_FIX_GUIDE.md)**
  - English version
  - Complete details
  
- **[ICP_LOGIN_ISSUES_SUMMARY.md](ICP_LOGIN_ISSUES_SUMMARY.md)**
  - Problem summary
  - Solutions provided
  
- **[BACKEND_DEPLOYMENT_TROUBLESHOOTING.md](BACKEND_DEPLOYMENT_TROUBLESHOOTING.md)**
  - Comprehensive troubleshooting
  - Many scenarios covered
  
- **[REMOTE_DIAGNOSTIC_GUIDE.md](REMOTE_DIAGNOSTIC_GUIDE.md)**
  - How to diagnose remotely

---

## 🎯 Recommended Approach

### สำหรับคนไม่ทำได้เลย:
```
1. เปิด LOGIN_FIX_NAVIGATION.md
2. เลือกวิธี B (Bash Script) - ดีที่สุด/เสี่ยงต่ำสุด
3. SSH เข้า server: ssh sif-vm1@10.2.0.6
4. รัน script: bash fix-login-complete.sh
5. ตรวจสอบ login ที่ https://icp.sif.or.th/icp-project-app/
```

### สำหรับคนอยากเข้าใจ:
```
1. เปิด LOGIN_FIX_THAI_DETAILED.md
2. ทำทีละขั้นตอน
3. ตรวจสอบเมื่อจบแต่ละขั้น
4. ทำความเข้าใจ command
```

### สำหรับ Windows Users:
```
1. ลองที่ Option A (PowerShell script) ก่อน
2. ถ้าไม่ได้ → ไป Option B (SSH + Bash script)
3. ถ้าติด → COPYPASTE_QUICK_FIX.md
```

---

## ✅ Success Checklist

หลังจากแก้จะต้องเห็น:

- [ ] SSH connection works → สำเร็จ
- [ ] DB_MODE = remote ✓
- [ ] NODE_ENV = production ✓
- [ ] Backend status = online ✓
- [ ] Test users exist in DB ✓
- [ ] API returns token ✓
- [ ] Web login works ✓

---

## 🆘 Troubleshooting Quick Links

| ปัญหา | ลิงค์ |
|------|------|
| SSH connection failed | [COPYPASTE_QUICK_FIX.md#error-ssh-permission-denied](COPYPASTE_QUICK_FIX.md) |
| Backend still offline | [LOGIN_FIX_THAI_DETAILED.md#ส่วน-troubleshooting](LOGIN_FIX_THAI_DETAILED.md) |
| Database connection error | [BACKEND_DEPLOYMENT_TROUBLESHOOTING.md](BACKEND_DEPLOYMENT_TROUBLESHOOTING.md) |
| API not responding | [COPYPASTE_QUICK_FIX.md#error-api-returns-404](COPYPASTE_QUICK_FIX.md) |
| Web login not working | [LOGIN_FIX_GUIDE.md#post-fix-testing](LOGIN_FIX_GUIDE.md) |

---

## 🕐 Time Estimates

| วิธี | เวลา | Recommended |
|------|------|------------|
| PowerShell automated | 2-3 min | For Windows users |
| Bash script automated | 3-5 min | **Best overall** ⭐⭐⭐ |
| Manual step-by-step | 5-10 min | For learning |
| Diagnostic + manual | 10-15 min | For debugging |

---

## 🔐 Important Details

```
Server:     10.2.0.6 (SSH port 22)
User:       sif-vm1
Password:   REDACTED_SSH_PASSWORD

Database:   10.2.0.5 (MySQL port 3306)
Database:   u486700931_icp
DB User:    u486700931_root
DB Pass:    REDACTED_PASSWORD

Test Users:
  - somnuk@mju.ac.th / 123456 (admin)
  - somnuk.sin1@gmail.com / 123456 (superuser)
  - somnuk.sin@gmail.com / 123456 (user)

Target URL:
  https://icp.sif.or.th/icp-project-app/
```

---

## 📝 What Each Script Does

### fix-login-automated.ps1
```
✓ Tests SSH connection
✓ Checks .env file
✓ Updates DB_MODE to 'remote'
✓ Updates NODE_ENV to 'production'
✓ Configures test users in DB
✓ Restarts PM2 backend
✓ Tests login API
✓ Reports all results
```

### fix-login-complete.sh
```
✓ Backups .env (safety)
✓ Fixes .env configuration
✓ Updates test users in DB
✓ Tests DB connection
✓ Checks/restarts backend
✓ Gets recent logs
✓ Tests API endpoint
✓ Comprehensive output
```

### diagnose_login_issue_v2.py
```
✓ SSH connection test
✓ Config check (.env)
✓ PM2 status
✓ Backend logs review
✓ Database connectivity
✓ User accounts check
✓ API endpoint test
✓ Nginx validation
✓ Detailed report
```

### fix-login-users.sql
```
✓ Update existing users
✓ Insert missing users
✓ Verify created users
✓ Database-only solution
```

---

## 🎓 Learning Path

1. **Understand (5 min)**
   - Read: [LOGIN_FIX_NAVIGATION.md](LOGIN_FIX_NAVIGATION.md)
   - Know: What's the problem?

2. **Diagnose (3 min)**
   - Read: [COPYPASTE_QUICK_FIX.md](COPYPASTE_QUICK_FIX.md) - STEP 0-1
   - Know: What exactly is wrong?

3. **Fix (5 min)**
   - Use: One of the scripts/manuals
   - Do: Apply the fixes

4. **Verify (3 min)**
   - Test: STEP 7 in COPYPASTE_QUICK_FIX.md
   - Confirm: Login works

---

## 📞 Report Issues

If login still doesn't work after fixing:

1. Collect these outputs:
   ```bash
   # On server (via SSH):
   grep -E '^(DB_|NODE_)' /home/sif-vm1/apps/icp-project-app/.env
   pm2 status
   pm2 logs icp-backend --lines 50 --nostream
   sudo tail -20 /var/log/nginx/error.log
   ```

2. Include:
   - Screenshots of login attempt
   - Error from browser console (F12)
   - Any error messages

3. Contact: Support team with all logs

---

## 📚 Full Documentation Map

```
📁 Project Root
├── 📄 LOGIN_FIX_NAVIGATION.md ← START HERE
│   └── Choose your method
│
├── 📄 COPYPASTE_QUICK_FIX.md
│   └── Just copy & paste commands
│
├── 📄 LOGIN_FIX_THAI_DETAILED.md
│   └── Thai detailed instructions
│
├── 📄 LOGIN_FIX_GUIDE.md
│   └── English full guide
│
├── 🔧 Scripts
│   ├── fix-login-automated.ps1 (PowerShell)
│   ├── fix-login-complete.sh (Bash - RECOMMENDED)
│   ├── diagnose_login_issue_v2.py (Python)
│   └── fix-login-users.sql (SQL)
│
├── 📖 Reference Docs
│   ├── BACKEND_DEPLOYMENT_TROUBLESHOOTING.md
│   ├── ICP_LOGIN_ISSUES_SUMMARY.md
│   ├── REMOTE_DIAGNOSTIC_GUIDE.md
│   └── BACKEND_DEPLOYMENT_QUICK_REFERENCE.md
│
└── 📋 Other Deployment Docs
    ├── BACKEND_DEPLOYMENT_PLAN_2026-02-23.md
    ├── BACKEND_DEPLOYMENT_COMPLETE.md
    └── ... (many more)
```

---

## 🎯 Next Steps (Choose One)

### 🚀 Quick Fix (Recommended)
```
1. Open: COPYPASTE_QUICK_FIX.md
2. SSH to server
3. Copy-paste each command
4. Done!
```

### 🤖 Automated Fix
```
1. Copy fix-login-complete.sh to server
2. bash fix-login-complete.sh
3. Done!
```

### 🧠 Learn While Fixing
```
1. Read: LOGIN_FIX_THAI_DETAILED.md
2. Do step 1-4 manually
3. Understand each part
4. Done!
```

### 🔍 Need to Diagnose First?
```
1. Run: diagnose_login_issue_v2.py
2. See what's broken
3. Fix only broken parts
4. Done!
```

---

**Prepared by:** AI Assistant  
**Date:** 24 Feb 2026  
**Status:** Ready for use ✓  
**Recommendation:** Click [LOGIN_FIX_NAVIGATION.md](LOGIN_FIX_NAVIGATION.md) for best experience


