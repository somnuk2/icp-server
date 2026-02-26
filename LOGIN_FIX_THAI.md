# 🔐 ICP Login Issues - Quick Fix Steps (Thai Instructions)

## ⚠️ ปัญหาหลัก (Main Issues)

### ปัญหาที่ 1: Database Configuration ไม่ถูกต้อง
- **ปัจจุบัน:** `DB_MODE=local` (ชี้ไปยัง localhost)
- **ควรเป็น:** `DB_MODE=remote` (ชี้ไปยัง 10.2.0.5)
- **ผลกระทบ:** Backend ใช้ database ที่ผิด ไม่ได้อ่านข้อมูล production

### ปัญหาที่ 2: Test Users อาจไม่มีใน Database หรือมี Password ผิด
- Database ที่ต่างกันมี credentials ต่างกัน
- Test users อาจไม่มีใน production database

### ปัญหาที่ 3: Status Field ของ Users อาจมีค่าผิด
- Backend คาดหวัง: `'admin'`, `'superuser'`, `'user'`
- Database อาจมี: `'suser'` แทน `'superuser'`

---

## 🔧 วิธีแก้ไข (3 ขั้นตอน)

### ✅ ขั้นตอนที่ 1: แก้ไข .env File

**SSH เข้า Server:**
```bash
ssh -p 22 sif-vm1@10.2.0.6
# Password: REDACTED_SSH_PASSWORD
```

**วิธีที่ 1 - ใช้ sed (เร็ว):**
```bash
# เปลี่ยน DB_MODE จาก local เป็น remote
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env

# เปลี่ยน NODE_ENV จาก development เป็น production
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env

# ตรวจสอบว่าเปลี่ยนแล้ว
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**วิธีที่ 2 - ใช้ nano editor (ช้ากว่าแต่ชัดเจน):**
```bash
nano /home/sif-vm1/apps/icp-project-app/.env

# หา ↓ และแก้ไข:
# แก้: DB_MODE=local → DB_MODE=remote
# แก้: NODE_ENV=development → NODE_ENV=production

# Save: Ctrl+O → Enter → Ctrl+X
```

---

### ✅ ขั้นตอนที่ 2: แก้ไข Test Users ใน Database

**SSH เข้า Server (ถ้ายังไม่ได้):**
```bash
ssh sif-vm1@10.2.0.6
```

**รัน SQL ต่อไปนี้:**
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOF'

-- Update test users
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';

-- Insert ถ้าไม่มี
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);

-- ตรวจสอบ
SELECT email, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');

EOF
```

**ผลลัพธ์ที่คาดหวัง:**
```
| email | status |
|-------|--------|
| somnuk@mju.ac.th | admin |
| somnuk.sin1@gmail.com | superuser |
| somnuk.sin@gmail.com | user |
```

---

### ✅ ขั้นตอนที่ 3: Restart Backend Service

**SSH เข้า Server (ถ้ายังไม่ได้):**
```bash
ssh sif-vm1@10.2.0.6
```

**รีสตาร์ท Backend:**
```bash
pm2 restart icp-backend
```

**ตรวจดู Logs เพื่อยืนยัน:**
```bash
pm2 logs icp-backend --lines 50
```

**ที่คาดหวัง:**
```
✅ Database connected [REMOTE] → 10.2.0.5:3306/u486700931_icp
```

---

## ✅ ทดสอบ Login

### ทดสอบด้วย cURL:

```bash
# Test Admin Login
curl -X POST http://10.2.0.6:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'
```

**ผลลัพธ์ที่คาดหวัง (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member_id": 1,
  "email": "somnuk@mju.ac.th",
  "role": "admin",
  "full_name": "สมนึก สินธุปวน"
}
```

**ผลลัพธ์ที่คาดหวัง (Failure - wrong password):**
```json
{"error":"Invalid email or password."}
```

---

### ทดสอบทางเว็บ:

1. เปิด: https://icp.sif.or.th/icp-project-app/
2. Login ด้วยข้อมูลด้านล่าง
3. ควรจะ redirect ไปยัง dashboard

**Test Accounts:**
```
Admin:
  Email: somnuk@mju.ac.th
  Password: 123456

SuperUser:
  Email: somnuk.sin1@gmail.com
  Password: 123456

User:
  Email: somnuk.sin@gmail.com
  Password: 123456
```

---

## 🆘 ถ้า Login ยังไม่ได้

**ตรวจสอบจุดต่อไปนี้:**

1. **ตรวจสอบ .env ถูกแก้หรือไม่:**
   ```bash
   grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
   # ต้องเห็น: DB_MODE=remote และ NODE_ENV=production
   ```

2. **ตรวจสอบ Database Connection:**
   ```bash
   mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 'Connection OK';"
   ```

3. **ตรวจสอบ Test Users มีใน Database:**
   ```bash
   mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp \
     -e "SELECT email, password, status FROM member WHERE email='somnuk@mju.ac.th';"
   ```

4. **ตรวจสอบ Backend อยู่ Online:**
   ```bash
   pm2 status
   # icp-backend ต้อง show "online"
   ```

5. **อ่านดู Error Logs:**
   ```bash
   pm2 logs icp-backend --lines 200 | grep -i error
   ```

---

## 📋 Checklist

- [ ] แก้ไข .env (DB_MODE=remote, NODE_ENV=production)
- [ ] รัน SQL ให้ update test users
- [ ] รีสตาร์ท backend (pm2 restart icp-backend)
- [ ] ทดสอบ login ด้วย cURL หรือเว็บ
- [ ] ตรวจสอบ database logs ไม่มี error

---

## 📞 Information

**Server:** 10.2.0.6 (port 22)  
**User:** sif-vm1  
**Database:** 10.2.0.5:3306 (u486700931_icp)  
**Backend URL:** http://10.2.0.6:3000  
**Web App:** https://icp.sif.or.th/icp-project-app/

---

Generated: February 24, 2026


