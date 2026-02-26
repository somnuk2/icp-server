# 🔐 ICP Login Fix - Step by Step Manual Instructions

**ให้ทำตามขั้นตอนต่อไปนี้ (5-10 นาที)**

---

## ✅ ขั้นตอนที่ 1: SSH เข้า Server

**คำสั่ง:**
```bash
ssh -p 22 sif-vm1@10.2.0.6
```

**Password:** `REDACTED_SSH_PASSWORD`

---

## ✅ ขั้นตอนที่ 2: แก้ไข .env File

**หลังจากเข้า SSH แล้ว รันคำสั่งต่อไปนี้:**

```bash
# ตรวจสอบสถานะปัจจุบัน
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**ควรเห็น:**
```
DB_MODE=local
NODE_ENV=development
```

**แก้ไข:**
```bash
# Change 1: Update DB_MODE
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env

# Change 2: Update NODE_ENV
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env
```

**ตรวจสอบการแก้ไข:**
```bash
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

**จะเห็น:**
```
DB_MODE=remote
NODE_ENV=production
```

---

## ✅ ขั้นตอนที่ 3: อัปเดต Test Users ใน Database

**รันคำสั่ง SQL ต่อไปนี้:**

```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOF'

-- Update existing test users
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';

-- Insert if missing
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES
('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),
('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),
('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);

-- Verify changes
SELECT email, password, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');

EOF
```

**ควรเห็น Output:**
```
| email | password | status |
|-------|----------|--------|
| somnuk@mju.ac.th | 123456 | admin |
| somnuk.sin1@gmail.com | 123456 | superuser |
| somnuk.sin@gmail.com | 123456 | user |
```

---

## ✅ ขั้นตอนที่ 4: Restart Backend Service

```bash
# Restart backend
pm2 restart icp-backend

# Check status (should show "online")
pm2 status

# View logs (should see "Database connected [REMOTE]")
pm2 logs icp-backend --lines 30
```

**ถ้าสำเร็จจะเห็น:**
```
✅ Database connected [REMOTE] → 10.2.0.5:3306/u486700931_icp
```

---

## ✅ ขั้นตอนที่ 5: ออกจาก SSH

```bash
exit
```

---

## 🧪 ทดสอบ Login หลังจากแก้ไขเสร็จ

**รันคำสั่งต่อไปนี้จาก Windows:**

### Test 1: Backend Health
```bash
curl http://10.2.0.6:3000/health
```

### Test 2: Try Login
```bash
curl -X POST http://10.2.0.6:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"somnuk@mju.ac.th\",\"password\":\"123456\"}"
```

**ถ้าสำเร็จจะได้:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member_id": 1,
  "email": "somnuk@mju.ac.th",
  "role": "admin",
  "full_name": "สมนึก สินธุปวน"
}
```

### Test 3: Open Web App
```
https://icp.sif.or.th/icp-project-app/
```

**Login ด้วย:**
- Email: `somnuk@mju.ac.th`
- Password: `123456`

---

## 📋 Checklist

- [ ] SSH เข้า Server ได้
- [ ] แก้ไข .env (DB_MODE=remote, NODE_ENV=production)
- [ ] รัน SQL ให้ update test users
- [ ] Restart backend (pm2 restart icp-backend)
- [ ] ทดสอบ login endpoint ได้
- [ ] เข้า web app ได้

---

## 🆘 ถ้ามีปัญหา

### SSH Connection Failed
```bash
# ตรวจสอบ VPN เชื่อมต่ออยู่หรือไม่
# ลองอีกครั้ง
ssh -p 22 sif-vm1@10.2.0.6
```

### Password Wrong
```
Password ที่ถูกต้อง: REDACTED_SSH_PASSWORD
```

### Database Connection Error
```bash
# ตรวจสอบจาก Server:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 'OK';"
```

### Backend ยังไม่ online
```bash
# Check logs
pm2 logs icp-backend --lines 100 | grep -i error
```

---

**เสร็จแล้ว! คุณควรจะ login ได้แล้ว ✅**


