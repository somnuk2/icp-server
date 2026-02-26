# 🚀 ICP Login Fix - Copy & Paste Commands (All in One)

คุณโชค! ฉันได้สร้างคำสั่งที่พร้อมใช้ทั้งหมด ให้ copy-paste ลงใน Terminal เลย!

---

## ✅ **ขั้นตอนที่ 1: SSH เข้า Server**

**รันคำสั่งนี้ใน PowerShell หรือ CMD:**

```powershell
ssh -p 22 sif-vm1@10.2.0.6
```

**Enter password:** `REDACTED_SSH_PASSWORD`

---

## ✅ **ขั้นตอนที่ 2: Copy Code นี้ไปไว้ใน Server (ตอนอยู่ใน SSH)**

เมื่อเข้า SSH เสร็จแล้ว ให้ copy-paste code นี้ทั้งหมด:

```bash
# FIX 1: Update .env
echo "FIX 1: Updating .env..."
sed -i 's/^DB_MODE=local/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=development/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env
echo "✅ Done"
echo ""

# FIX 2: Update test users
echo "FIX 2: Updating test users..."
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp <<'EOSQL'
UPDATE member SET password='123456', status='admin' WHERE email='somnuk@mju.ac.th';
UPDATE member SET password='123456', status='superuser' WHERE email='somnuk.sin1@gmail.com';
UPDATE member SET password='123456', status='user' WHERE email='somnuk.sin@gmail.com';
INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES ('somnuk@mju.ac.th', '123456', 'สมนึก สินธุปวน', 'admin', 1),('somnuk.sin1@gmail.com', '123456', 'สิริ สินธุปวน', 'superuser', 1),('somnuk.sin@gmail.com', '123456', 'สินี สินธุปวน', 'user', 1);
SELECT 'VERIFIED - Users ready:' as RESULT;
SELECT email, status FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');
EOSQL
echo ""

# FIX 3: Restart backend
echo "FIX 3: Restarting backend..."
pm2 restart icp-backend
sleep 3
echo ""
echo "Backend status:"
pm2 status
echo ""
echo "Logs (first 20 lines):"
pm2 logs icp-backend --lines 20
```

---

## ✅ **ขั้นตอนที่ 3: ออกจาก SSH**

```bash
exit
```

---

## 🧪 **ขั้นตอนที่ 4: ทดสอบ Login (Windows/PowerShell)**

**ทดสอบ health ก่อน:**
```powershell
curl http://10.2.0.6:3000/health
```

**ทดสอบ login:**
```powershell
$body = @{
    email = "somnuk@mju.ac.th"
    password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://10.2.0.6:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json
```

**ถ้าสำเร็จจะเห็น token และ member info**

---

## 🌐 **ขั้นตอนที่ 5: เปิด Web App**

```
https://icp.sif.or.th/icp-project-app/
```

**Login ด้วย:**
- Email: `somnuk@mju.ac.th`
- Password: `123456`

---

## 📝 **Test Accounts (หลังจากแก้ไข)**

```
Account 1 (Admin):
  Email: somnuk@mju.ac.th
  Password: 123456
  Role: admin

Account 2 (SuperUser):
  Email: somnuk.sin1@gmail.com
  Password: 123456
  Role: superuser

Account 3 (User):
  Email: somnuk.sin@gmail.com
  Password: 123456
  Role: user
```

---

## 💡 **ถ้ามีปัญหา**

### ❌ SSH ไม่ได้
```
ตรวจสอบ:
1. VPN เชื่อมต่อหรือไม่
2. Password: REDACTED_SSH_PASSWORD
3. ลอง: ssh -v sif-vm1@10.2.0.6 (เพื่อดู debug info)
```

### ❌ MySQL error
```
ลองรัน:
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 'test';"
```

### ❌ Backend ยังไม่ online
```
ตรวจสอบ logs:
pm2 logs icp-backend --lines 100 | grep -i error
```

---

## ✅ **Checklist ก่อนทำ**

- [ ] VPN connected
- [ ] PowerShell/Terminal พร้อม
- [ ] Copy password: `REDACTED_SSH_PASSWORD`
- [ ] Copy commands ด้านบน
- [ ] Ready ไปแล้ว! 🚀

---

## 📞 **คำแนะนำ**

1. **อ่าน guide นี้ทั้งหมด ก่อนจะลงมือ**
2. **เข้า SSH เสร็จแล้ว ตัวดำเนินการ script code**
3. **ปล่อยให้ script รัน เสร็จ ดูผล**
4. **ออก SSH แล้วทดสอบ login**

---

**เที่ยว! คุณควรจะ login ได้แล้ว! ✅**


