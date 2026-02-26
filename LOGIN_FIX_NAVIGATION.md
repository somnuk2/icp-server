# 🔧 ICP Login Issue - นำทาง & เครื่องมือในการแก้ไข

**สถานการณ์:** Website login ไม่ผ่าน (https://icp.sif.or.th/icp-project-app/)  
**สาเหตุหลัก:** Database Mode ไม่ถูกต้อง + Test Users ขาดหาย + Backend needs restart  
**วิธีแก้ไข:** ใช้เครื่องมือที่เหมาะสมตามความสามารถและอุปกรณ์ของคุณ

---

## 🎯 เลือกวิธีแก้ไข (Choose Your Method)

### 1️⃣ **วิธี: Automated PowerShell (ง่าย - Windows)**
**ต้องการ:** Windows 10+ + SSH installed (Git Bash หรือ OpenSSH)  
**ข้อมูล:** ให้ script ทำเอง + ไม่ต้องพิมพ์คำสั่ง  
**เวลา:** ~2-3 นาที

#### วิธีใช้:
```powershell
# เปิด PowerShell
cd D:\Project-icp\icp-project-app

# รัน script
.\fix-login-automated.ps1

# ตามขั้นตอนที่ script แนะนำ
```

#### ข้อดี:
✓ ทำให้ใหม่อยู่เสมอ  
✓ ตรวจสอบทั้งหมดแบบอัตโนมัติ  
✓ สะดวกที่สุด

#### ข้อเสีย:
✗ ต้องใช้ Windows + SSH  
✗ อาจต้อง install sshpass

---

### 2️⃣ **วิธี: Bash Script บน Server (แนะนำ)**
**ต้องการ:** SSH access + bash shell บนเซิร์ฟเวอร์  
**ข้อมูล:** Copy-paste script + รันครั้งเดียวครบทั้งหมด  
**เวลา:** ~3-5 นาที  
**ประสิทธิภาพ:** สูงสุด ✓✓✓

#### วิธีใช้:

##### Step 1: SSH เข้า Server
```bash
# Windows PowerShell / Command Prompt:
ssh -p 22 sif-vm1@10.2.0.6
# Password: REDACTED_SSH_PASSWORD

# หรือ (ถ้ามี sshpass):
sshpass -p "REDACTED_SSH_PASSWORD" ssh -p 22 sif-vm1@10.2.0.6
```

##### Step 2: Download/Copy script
```bash
# Option A: Download script (ถ้าสามารถ)
cd /tmp
wget https://raw.githubusercontent.com/.../fix-login-complete.sh
chmod +x fix-login-complete.sh

# Option B: Copy-paste contents
# (สร้าง file แล้ว copy contents จาก fix-login-complete.sh)
nano fix-login-complete.sh
# Copy บริเวณจาก "#!/bin/bash" ถึง "tail -50 /var/log/nginx/error.log"
# Ctrl+O save, Ctrl+X exit
```

##### Step 3: รัน script
```bash
bash fix-login-complete.sh

# หรือ
chmod +x fix-login-complete.sh
./fix-login-complete.sh
```

##### Step 4: ตรวจสอบผลลัพธ์
Script จะแสดง:
- ✓ Configuration updated
- ✓ Test users configured  
- ✓ Database connection OK
- ✓ Backend restarted
- ✓ API test results

#### ข้อดี:
✓ ทำทั้งหมดให้เสร็จ  
✓ ง่ายและรวดเร็ว  
✓ Reliable

#### ข้อเสีย:
✗ ต้อง SSH access

---

### 3️⃣ **วิธี: Manual Step-by-Step (ละเอียด)**
**ต้องการ:** SSH access + เข้าใจคำสั่ง bash/SQL  
**ข้อมูล:** ทำทีละขั้นตอน + เข้าใจแต่ละส่วน  
**เวลา:** ~5-10 นาที  
**ประโยชน์:** เรียนรู้ได้ + diagnose ได้ดี

#### ดูเอกสาร:
📄 **LOGIN_FIX_THAI_DETAILED.md** - ข้อมูลขั้นตอนละเอียด (ภาษาไทย)  
📄 **LOGIN_FIX_GUIDE.md** - English version

#### วิธีใช้:
1. เปิดเอกสาร LOGIN_FIX_THAI_DETAILED.md
2. ทำตามขั้นตอนที่ 0-4 ทีละขั้นตอน
3. ตรวจสอบผลลัพธ์หลัง step นี้

#### ข้อดี:
✓ ทำความเข้าใจ command แต่ละคำ  
✓ สามารถ debug เองได้  
✓ เรียนรู้ได้  
✓ ยืดหยุ่น (ข้ามขั้นตอนได้ถ้าไม่ต้องการ)

#### ข้อเสีย:
✗ ใช้เวลามากกว่า  
✗ อาจพิมพ์ผิด  
✗ ต้องเข้าใจคำสั่ง

---

### 4️⃣ **วิธี: Diagnostic ก่อน (ถ้าไม่แน่ใจ)**
**ต้องการ:** Python 3 + SSH

#### วิธีใช้:
```bash
# Windows PowerShell:
python diagnose_login_issue_v2.py

# ผลลัพธ์:
# ✓ SSH Connection
# ✓ Backend .env Configuration
# ✓ Backend Process Status
# ✓ Database Connection
# ✓ Test Users in Database
# ✓ Login API endpoint
# ✓ Nginx Configuration
```

#### Goal:
- รู้ว่าปัญหาจากส่วนไหน
- ต้องแก้บ้าน
- ตัดสินใจวิธีแก้ที่เหมาะสม

---

## 🚀 Recommended Path (แนะนำทั้งสุด)

### สำหรับมือใหม่:
```
1. ลอง Diagnostic → ดูว่าปัญหาจากส่วนไหน
2. รัน Bash Script (fix-login-complete.sh) บน server
3. ทดสอบ login
```

### สำหรับ Advanced Users:
```
1. SSH เข้า + manual fix ทีละขั้น (ถ้าต้องการเข้าใจ)
2. หรือรัน Bash script (ที่เร็วและน่าเชื่อถือ)
```

### สำหรับ Windows Users:
```
1. ลองใช้ PowerShell script (fix-login-automated.ps1)
2. ถ้าไม่ได้ → ใช้ SSH + Bash script
```

---

## 🔍 Quick Diagnostic

ถ้าต้องการทราบปัญหาก่อน ลองตรวจสอบเร็ว ๆ:

```bash
# SSH เข้า server:
ssh sif-vm1@10.2.0.6

# ตรวจสอบ environment:
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env

# ตรวจสอบ backend status:
pm2 status

# ตรวจสอบ database:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
"SELECT email, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');"
```

**ปัญหาที่คาดว่า:**
- ❌ DB_MODE=local (ต้องเปลี่ยนเป็น remote)
- ❌ NODE_ENV=development (ต้องเปลี่ยนเป็น production)
- ❌ Backend status = stopped (ต้อง restart)
- ❌ Test users ไม่มี (ต้องสร้าง)

---

## 📁 Files Location

| ไฟล์ | ประเภท | จุดประสงค์ |
|------|--------|-----------|
| `fix-login-automated.ps1` | PowerShell | Automated fix สำหรับ Windows |
| `fix-login-complete.sh` | Bash | Complete fix script สำหรับ server |
| `diagnose_login_issue_v2.py` | Python | Diagnostic tool |
| `LOGIN_FIX_THAI_DETAILED.md` | Documentation | ขั้นตอนละเอียด (Thai) |
| `LOGIN_FIX_GUIDE.md` | Documentation | ขั้นตอนละเอียด (English) |
| `fix-login-users.sql` | SQL | Update test users ใน DB |
| `BACKEND_DEPLOYMENT_TROUBLESHOOTING.md` | Reference | Troubleshooting guide |

---

## ⏱️ How Long?

| วิธี | เวลา | Difficulty |
|------|------|-----------|
| PowerShell Automated | 2-3 นาที | ⭐ (ง่าย) |
| Bash Script | 3-5 นาที | ⭐ (ง่าย) |
| Manual Step-by-Step | 5-10 นาที | ⭐⭐ (ปานกลาง) |
| Diagnostic + Manual | 10-15 นาที | ⭐⭐ (ปานกลาง) |

---

## ⚠️ Important Notes

1. **Database Password:** `REDACTED_PASSWORD` (ใช้ได้ในทั้ง 3 script)
2. **SSH Password:** `REDACTED_SSH_PASSWORD` (case-sensitive)
3. **Test User Password:** `123456` (หลังแก้จะเป็นอันนี้)
4. **Backup:** Script ทำ backup .env อัตโนมัติ
5. **Restart:** Backend restart หลัง fix อัตโนมัติ

---

## ✅ Success Criteria

หลังจากแก้ไข ต้องเห็น:

```bash
# ✓ Environment ถูกต้อง
$ grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
DB_MODE=remote
NODE_ENV=production

# ✓ Backend online
$ pm2 status
icp-backend  | online

# ✓ Database connection
$ mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"
| 1 |

# ✓ Test users exist
$ mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
"SELECT email, status FROM member WHERE email='somnuk@mju.ac.th';"
| somnuk@mju.ac.th | admin |

# ✓ API responds
$ curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"somnuk@mju.ac.th","password":"123456"}'
{ "status": "success", "token": "..." }

# ✓ Website login works
https://icp.sif.or.th/icp-project-app/ → Dashboard ✓
```

---

## 🆘 If Still Not Working

1. **ตรวจสอบ Logs:**
   ```bash
   # Backend logs
   ssh sif-vm1@10.2.0.6 'pm2 logs icp-backend --lines 50 --nostream'
   
   # Nginx logs
   ssh sif-vm1@10.2.0.6 'sudo tail -50 /var/log/nginx/error.log'
   ```

2. **ตรวจสอบ Browser:**
   - Open Developer Tools (F12)
   - Check Network tab → API requests
   - Check Console tab → JavaScript errors
   - Clear cache (Ctrl+Shift+Delete)

3. **ตรวจสอบ Connectivity:**
   ```bash
   ping 10.2.0.6
   ping 10.2.0.5
   Test-NetConnection -ComputerName 10.2.0.6 -Port 22
   ```

4. **ส่ง Logs:**
   - Copy output จากทั้งหมดมายังเอกสาร
   - Contact Support team

---

**Last Updated:** 24 Feb 2026  
**Status:** Ready for deployment  
**Support:** แนะนำให้เลือกวิธีที่ 2 (Bash Script) เพื่อความน่าเชื่อถือที่สุด


