ใช่ ต้องแก้ไขที่ Database เพื่อให้ login ได้
=====================================

## วิธี 1: ใช้ MySQL Workbench หรือ HeidiSQL
1. เปิด MySQL Workbench / HeidiSQL
2. เชื่อมต่อไป: 10.2.0.5:3306
   - Username: u486700931_root
   - Password: REDACTED_PASSWORD
3. เลือก Database: u486700931_icp
4. copy-paste คำสั่ง SQL จาก [DATABASE_FIX.sql](DATABASE_FIX.sql)
5. Execute


## วิธี 2: ใช้ Command Line (บน Windows)
ถ้า MySQL client ติดตั้งอยู่:

```bash
mysql -h 10.2.0.5 -u u486700931_root -p"REDACTED_PASSWORD" u486700931_icp < DATABASE_FIX.sql
```

หรือ paste คำสั่งแบบนี้:

```bash
mysql -h 10.2.0.5 -u u486700931_root -p"REDACTED_PASSWORD" -e ^
"INSERT IGNORE INTO member (email, password, full_name, status, is_verified) VALUES ^
('somnuk@mju.ac.th', '123456', 'Admin User', 'admin', 1), ^
('somnuk.sin1@gmail.com', '123456', 'Super User', 'superuser', 1), ^
('somnuk.sin@gmail.com', '123456', 'Regular User', 'user', 1);" u486700931_icp
```


## วิธี 3: ใช้ PhpMyAdmin (ถ้ามี)
1. เข้า PhpMyAdmin URL ของคุณ (ถ้ามี)
2. เชื่อมต่อ database u486700931_icp
3. ไปที่ tab SQL
4. copy-paste คำสั่ง SQL
5. Execute


## ตรวจสอบหลังแก้ไข
```sql
SELECT email, password, status, is_verified FROM member 
WHERE email IN ('somnuk@mju.ac.th', 'somnuk.sin1@gmail.com', 'somnuk.sin@gmail.com');
```

จากนั้น ต้องแก้ไข .env บน Server 10.2.0.6 ด้วย:
```
DB_MODE=remote
NODE_ENV=production
```

และ restart backend:
```
pm2 restart icp-backend
```

แล้วลอง login ด้วย:
- Email: somnuk@mju.ac.th
- Password: 123456


