ตรวจสอบการเชื่อมต่อ Frontend → Backend
====================================

## ขั้นที่ 1: ตรวจสอบ .env ของ Backend

บน Server 10.2.0.6 ตรวจสอบไฟล์ `.env`:
```bash
cat /home/sif-vm1/apps/icp-project-app/.env | grep -E "^(DB_MODE|NODE_ENV|DB_REMOTE)"
```

ต้องมี:
```
DB_MODE=remote
NODE_ENV=production
DB_REMOTE_HOST=10.2.0.5
DB_REMOTE_USER=u486700931_root
DB_REMOTE_PASSWORD=REDACTED_PASSWORD
DB_REMOTE_DATABASE=u486700931_icp
```

ถ้าไม่ถูกต้อง แก้ไขด้วย:
```bash
ssh sif-vm1@10.2.0.6

# แล้วรัน:
sed -i 's/^DB_MODE=.*/DB_MODE=remote/' /home/sif-vm1/apps/icp-project-app/.env
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' /home/sif-vm1/apps/icp-project-app/.env

# Restart backend
pm2 restart icp-backend
```


## ขั้นที่ 2: ตรวจสอบว่า Backend Logs

```bash
ssh sif-vm1@10.2.0.6

# ดู logs
pm2 logs icp-backend --lines 30
```

ต้องเห็น:
```
✓ Database connected [REMOTE]
```

ถ้าเห็น:
```
✓ Database connected [LOCAL]
```

แสดงว่า DB_MODE ยังเป็น local


## ขั้นที่ 3: Test Login จาก Command Line

ใช้ curl ทดสอบ:

```bash
curl -X POST "http://10.2.0.6:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"somnuk@mju.ac.th","password":"123456"}'
```

ต้องได้ response:
```json
{
  "token": "eyJhbGc...",
  "member_id": 1,
  "email": "somnuk@mju.ac.th",
  "role": "admin",
  "full_name": "Admin User"
}
```


## ขั้นที่ 4: Test Login จาก Frontend

สร้างไฟล์ test ที่ `/src/tests/frontend-connection-test.js`

ใช้วิธีใดวิธีหนึ่ง:

**วิธี A: Node.js CLI**
```bash
# จากโฟลเดอร์ project
node src/tests/frontend-connection-test.js
```

**วิธี B: ใน Browser DevTools Console**
1. เปิด https://icp.sif.or.th/icp-project-app/
2. กด F12 → Console
3. Copy-paste code ด้านล่าง:

```javascript
const API_URL = 'http://10.2.0.6:3000';
const TEST_USER = {email: 'somnuk@mju.ac.th', password: '123456'};

fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(TEST_USER)
})
.then(r => r.json())
.then(d => {
  if (d.token) {
    console.log('✅ LOGIN SUCCESS');
    console.log('Token:', d.token);
    console.log('Role:', d.role);
  } else {
    console.log('❌ LOGIN FAILED');
    console.log('Error:', d.error);
  }
})
.catch(e => console.log('❌ Connection Error:', e.message));
```


## ปัญหาที่อาจเจอ

**❌ "Cannot reach 10.2.0.6:3000"**
- ตรวจสอบ: VPN connected?
- ตรวจสอบ: Backend running? `pm2 status`

**❌ "Invalid email or password"**
- ตรวจสอบ: User มีในธรรมชาติไหม? 
  ```sql
  SELECT email, password FROM member WHERE email='somnuk@mju.ac.th';
  ```

**❌ "Database connection error"**
- ตรวจสอบ: DB_MODE=remote?
- ตรวจสอบ: .env config ถูกไหม?
- Restart backend: `pm2 restart icp-backend`

**❌ "CORS error"**
- ตรวจสอบไฟล์ `/backend/...[เชื่อม cors config]`
- ว่ามี origin: https://icp.sif.or.th หรือไม่


