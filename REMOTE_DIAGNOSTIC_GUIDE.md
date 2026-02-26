สรุปวิธีการตรวจสอบจาก Remote Server
====================================

## วิธี 1: Copy สคริปต์และรัน (ง่ายที่สุด)

```bash
# Copy สคริปต์ไปยัง server
scp remote_diagnostic.sh sif-vm1@10.2.0.6:/tmp/

# เข้า SSH และรัน
ssh sif-vm1@10.2.0.6
cd /tmp
bash remote_diagnostic.sh
```

## วิธี 2: รัน Inline (ไม่ต้อง copy)

```bash
ssh sif-vm1@10.2.0.6 'bash -s' < remote_diagnostic.sh
```

## วิธี 3: ทีละขั้น (Manual)

เข้า SSH ก่อน:
```bash
ssh sif-vm1@10.2.0.6
```

แล้วรันคำสั่งเหล่านี้:

### 1. ตรวจสอบ .env
```bash
grep -E '^(DB_MODE|NODE_ENV)=' /home/sif-vm1/apps/icp-project-app/.env
```

### 2. ตรวจสอบ Backend Status
```bash
pm2 status
pm2 logs icp-backend --lines 20 --nostream
```

### 3. ตรวจสอบ Database Connection
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"
```

### 4. ตรวจสอบ Test Users
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' u486700931_icp -e \
  "SELECT email, status, is_verified FROM member WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');"
```

### 5. Test API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'
```

## ที่ต้องตรวจสอบ:

✓ DB_MODE = remote (ไม่ใช่ local)
✓ NODE_ENV = production (ไม่ใช่ development)  
✓ Backend status = online
✓ Database connection = Success
✓ Test users = exist in database
✓ Login API = returns token
✓ Backend logs = "Database connected [REMOTE]"

## ถ้าพบปัญหา:

❌ DB_MODE ยังเป็น local
```bash
sed -i 's/^DB_MODE=.*/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env
pm2 restart icp-backend
```

❌ Backend offline
```bash
pm2 start icp-backend
```

❌ Database connection failed
```bash
mysql -h 10.2.0.5 -u u486700931_root -p'REDACTED_PASSWORD' -e "SELECT 1"
# ตรวจสอบ credentials ว่าถูกต้อง
```


