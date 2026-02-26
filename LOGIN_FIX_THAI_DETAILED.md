# 🔐 ICP Login Issues - วิธีแก้ไขขั้นตอนละเอียด (ภาษาไทย)

**สถานการณ์ปัจจุบัน:** Website https://icp.sif.or.th/icp-project-app/ ไม่สามารถ login ได้  
**วันที่:** 24 กุมภาพันธ์ 2026  
**Server:** 10.2.0.6 (SSH Port 22)  
**Database:** 10.2.0.5 (MySQL Port 3306)

---

## 🎯 ปัญหาหลัก (Root Causes)

| ลำดับที่ | ปัญหา | ผลกระทบ | วิธีแก้ |
|---------|-------|---------|--------|
| 1 | DB_MODE=local แทนที่จะเป็น remote | Backend อ่านจาก localhost แทน 10.2.0.5 | เปลี่ยนเป็น DB_MODE=remote |
| 2 | NODE_ENV=development | Backend ใช้ Dev mode แทน Production | เปลี่ยนเป็น NODE_ENV=production |
| 3 | Test users ไม่มีใน Database หรือ password ผิด | Login ไม่ผ่านแม้ config ถูก | สร้าง/อัปเดต users ด้วย password ถูก |

---

## 📋 วิธีแก้ไข (3 ขั้นตอนหลัก)

### ✅ ขั้นตอนที่ 0: เตรียมการ - SSH เข้า Server

```bash
# ที่ Command Prompt หรือ PowerShell บน Windows:
ssh -p 22 sif-vm1@10.2.0.6

# ถ้ามี sshpass หรือ putty:
sshpass -p "REDACTED_SSH_PASSWORD" ssh -p 22 sif-vm1@10.2.0.6

# หากไม่สำเร็จ:
# 1. ตรวจสอบ IP: ping 10.2.0.6
# 2. ตรวจสอบ Port: Test-NetConnection -ComputerName 10.2.0.6 -Port 22
# 3. ตรวจสอบ Password อีกครั้ง (case-sensitive)
```

**ผลลัพธ์ที่คาดหวัง:** Command prompt เปลี่ยนเป็น `sif-vm1@vm1:~$` หรือคล้ายกัน

---

### ✅ ขั้นตอนที่ 1: ตรวจสอบและแก้ไข .env File

#### ก. ตรวจสอบค่าปัจจุบัน:
```bash
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**ผลลัพธ์ที่คาดหวัง:**
```
DB_MODE=remote
NODE_ENV=production
```

**ผลลัพธ์ปัญหา (ต้องแก้ไข):**
```
DB_MODE=local              # ❌ ต้องเปลี่ยนเป็น remote
NODE_ENV=development       # ❌ ต้องเปลี่ยนเป็น production
```

#### ข. แก้ไข .env (วิธีที่ 1: ใช้ sed เร็ว)
```bash
# เปลี่ยน DB_MODE
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env

# เปลี่ยน NODE_ENV
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env

# ตรวจสอบว่าเปลี่ยนแล้ว
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

#### ค. แก้ไข .env (วิธีที่ 2: ใช้ nano editor ชัดเจน)
```bash
nano /home/sif-vm1/apps/icp-project-app/.env

# ในเอดิเตอร์ nano:
# 1. ค้นหา: Ctrl+W พิมพ์ "DB_MODE"
# 2. แก้ไข: DB_MODE=local → DB_MODE=remote
# 3. ค้นหาต่อ: Ctrl+W พิมพ์ "NODE_ENV"
# 4. แก้ไข: NODE_ENV=development → NODE_ENV=production
# 5. บันทึก: Ctrl+O → Enter
# 6. ออกจาก: Ctrl+X
```

---

### ✅ ขั้นตอนที่ 2: สร้าง/อัปเดต Test Users ใน Database

#### ก. ตรวจสอบ Test Users ปัจจุบัน:
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
"SELECT email, status, is_verified FROM member 
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com') 
ORDER BY email;"
```

**ผลลัพธ์ปกติ:**
```
| email | status | is_verified |
|-------|--------|-------------|
| somnuk@mju.ac.th | admin | 1 |
| somnuk.sin1@gmail.com | superuser | 1 |
| somnuk.sin@gmail.com | user | 1 |
```

#### ข. หากข้อมูลไม่ถูกต้อง - รัน SQL ต่อไปนี้:
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOF'

-- อัปเดต test users ที่มีอยู่แล้ว
UPDATE member SET password='123456', status='admin', is_verified=1 WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser', is_verified=1 WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user', is_verified=1 WHERE email='somnuk.sin@gmail.com';

-- สร้าง users ใหม่ (ถ้ายังไม่มี)
INSERT IGNORE INTO member (email, password, full_name, status, is_verified, created_at) VALUES
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1, NOW()),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1, NOW()),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1, NOW());

-- ตรวจสอบผลลัพธ์
SELECT email, password, status, is_verified FROM member 
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com') 
ORDER BY email;

EOF
```

**ผลลัพธ์ที่คาดหวัง:** แสดงผลข้อมูล 3 แถว ที่มี password='123456' ทั้งหมด

---

### ✅ ขั้นตอนที่ 3: Restart Backend Service

#### ก. ตรวจสอบ PM2 Status ปัจจุบัน:
```bash
pm2 status
```

**ผลลัพธ์ที่คาดหวัง:**
```
│ id │ name        │ namespace │ version │ mode │ pid   │ uptime │ ↺ │ status  │
├────┼─────────────┼───────────┼─────────┼──────┼───────┼────────┼───┼─────────┤
│ 0  │ icp-backend │ default   │ 1.0.0   │ fork │ 12345 │ 2d 5h  │ 0 │ online  │
```

#### ข. Restart Backend:
```bash
cd /home/sif-vm1/apps/icp-project-app
pm2 restart icp-backend

# รอ 5 วินาที
sleep 5

# ตรวจสอบสถานะใหม่
pm2 status
```

**ผลลัพธ์:** status ควรเป็น "online"

#### ค. ดู Log เพื่อตรวจสอบสถานะ:
```bash
# ดู log 20 บรรทัดล่าสุด
pm2 logs icp-backend --lines 20 --nostream

# ดู log แบบ real-time (กด Ctrl+C เพื่อออก)
pm2 logs icp-backend --follow
```

**สิ่งที่ต้องหา ใน log:**
```
✓ Database connected [REMOTE]
✓ Server running on port 3000
✓ API endpoints ready
```

---

## 🧪 ขั้นตอนที่ 4: ทดสอบ Login

### ก. ทดสอบ API ด้วย curl (ใน SSH):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'
```

**ผลลัพธ์ที่คาดหวัง:**
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

### ข. ทดสอบหน้า Web (จากเบราว์เซอร์):
1. เปิด: https://icp.sif.or.th/icp-project-app/
2. Login ด้วย:
   - Email: `somnuk@mju.ac.th`
   - Password: `123456`

**ผลลัพธ์ที่คาดหวัง:** เข้าสู่ Dashboard ได้สำเร็จ

---

## ❌ แก้ไขปัญหาเพิ่มเติม (Troubleshooting)

### ปัญหา: SSH Connection Failed
```bash
# ตรวจสอบ:
ping 10.2.0.6
Test-NetConnection -ComputerName 10.2.0.6 -Port 22

# ตรวจสอบบนเซิร์ฟเวอร์:
sudo systemctl status ssh
sudo systemctl restart ssh
```

### ปัญหา: Database Connection Failed
```bash
# ทดสอบ Database ด้วย SSH:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"

# ถ้า error ตรวจสอบ:
# - IP address ถูกต้อง (10.2.0.5)
# - Port เปิด (3306)
# - Username/Password ถูกต้อง
# - Network connectivity
```

### ปัญหา: Backend Still Offline
```bash
# ดู error log:
pm2 logs icp-backend --lines 50 --nostream

# ตรวจสอบ Node.js:
node --version
npm --version

# ลองติดตั้ง dependencies ใหม่:
cd /home/sif-vm1/apps/icp-project-app
npm install

# Start backend:
pm2 start backend/server.js --name icp-backend
```

### ปัญหา: Login ยังไม่ผ่าน หลังจากแก้ไข
```bash
# ตรวจสอบ Nginx config:
sudo nginx -t
sudo tail -20 /var/log/nginx/error.log

# ตรวจสอบเบราว์เซอร์:
# 1. เปิด Developer Tools (F12)
# 2. ดู Network tab - ตรวจสอบ request ไปยัง API
# 3. ดู Console tab - ตรวจสอบ JavaScript errors
# 4. Clear cache: Ctrl+Shift+Delete จากนั้น login ใหม่

# ตรวจสอบ CORS:
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: https://icp.sif.or.th" -v
```

---

## 📝 Quick Reference - คำสั่งเร็ว

```bash
# ✅ ตรวจสอบ Configuration
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env

# ✅ ตรวจสอบ Database Connection
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"

# ✅ ตรวจสอบ Backend Status
pm2 status

# ✅ ดู Backend Logs
pm2 logs icp-backend --lines 20 --nostream

# ✅ Restart Backend
pm2 restart icp-backend

# ✅ Test API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'

# ✅ Full diagnostic (run on server)
bash /tmp/fix-login-complete.sh
```

---

## 🎯 Checklist - ตรวจสอบขั้นตอน

- [ ] SSH เข้า 10.2.0.6 ได้สำเร็จ
- [ ] DB_MODE = remote ✓
- [ ] NODE_ENV = production ✓
- [ ] Backend restart แล้ว ✓
- [ ] Test users มี 3 คน ✓
- [ ] Password = 123456 สำหรับทั้ง 3 คน ✓
- [ ] Backend status = online ✓
- [ ] API response ได้ token ✓
- [ ] สามารถ login ที่ web ได้ ✓

---

## 📞 ติดต่อ Support

หากปัญหายังไม่แก้ไข กรุณา:
1. ทำการ screenshot/copy error message
2. ส่งผลลัพธ์จาก:
   - `pm2 logs icp-backend --lines 50 --nostream`
   - `grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env`
   - Browser console (F12)
3. ส่งไป Support team

---

**เอกสารที่เกี่ยวข้อง:**
- BACKEND_DEPLOYMENT_TROUBLESHOOTING.md
- LOGIN_FIX_GUIDE.md (English version)
- BACKEND_DEPLOYMENT_QUICK_REFERENCE.md


