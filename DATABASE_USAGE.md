# วิธีการใช้งาน Database Connection

## 🎯 คำสั่งรันโปรเจค

### 1. ใช้ Localhost Database (สำหรับทดสอบ)
```bash
npm run dev:all:local
```
- เชื่อมต่อกับ **localhost:3306**
- ใช้ MySQL ใน XAMPP
- เหมาะสำหรับการพัฒนาและทดสอบ

### 2. ใช้ Remote Server Database (สำหรับใช้งานจริง)
```bash
npm run dev:all:remote
```
- เชื่อมต่อกับ **10.2.0.5:3306**
- ใช้ Production Database
- เหมาะสำหรับการทดสอบกับข้อมูลจริง

### 3. ใช้ค่าเริ่มต้นจากไฟล์ .env
```bash
npm run dev:all
```
- อ่านค่าจาก `DB_MODE` ในไฟล์ `.env`
- Default คือ `local`

---

## 📋 คำสั่งทั้งหมด

| คำสั่ง | Database | คำอธิบาย |
|--------|----------|----------|
| `npm run dev:all:local` | Localhost | รัน Frontend + Backend (Local DB) |
| `npm run dev:all:remote` | Remote Server | รัน Frontend + Backend (Remote DB) |
| `npm run dev:all` | ตาม .env | รัน Frontend + Backend (ตามค่าใน .env) |
| `npm run dev:backend:local` | Localhost | รัน Backend เท่านั้น (Local DB) |
| `npm run dev:backend:remote` | Remote Server | รัน Backend เท่านั้น (Remote DB) |

---

## ✅ ตัวอย่างการใช้งาน

### สถานการณ์ที่ 1: พัฒนาฟีเจอร์ใหม่
```bash
npm run dev:all:local
```
ใช้ข้อมูลใน Localhost เพื่อทดสอบโดยไม่กระทบข้อมูลจริง

### สถานการณ์ที่ 2: ทดสอบกับข้อมูลจริง
```bash
npm run dev:all:remote
```
ใช้ข้อมูลจาก Server จริงเพื่อทดสอบว่าทำงานถูกต้อง

### สถานการณ์ที่ 3: Deploy Production
```bash
# แก้ไข .env
DB_MODE=remote

# รัน
npm run dev:all
```

---

## 🔍 ตรวจสอบว่าใช้ Database ไหน

เปิดเบราว์เซอร์ไปที่:
```
http://localhost:3000/api/db-info
```

จะแสดงข้อมูล:
```json
{
  "mode": "local",
  "host": "localhost",
  "port": "3306",
  "database": "u486700931_icp"
}
```

หรือ

```json
{
  "mode": "remote",
  "host": "10.2.0.5",
  "port": "3306",
  "database": "u486700931_icp"
}
```

---

## 📦 การติดตั้ง (ครั้งแรก)

```bash
# ติดตั้ง dependencies
npm install

# ติดตั้ง backend dependencies
cd backend
npm install
cd ..
```

---

## ⚠️ ข้อควรระวัง

1. **ก่อนใช้ Remote Database** - ตรวจสอบว่า XAMPP MySQL บน Localhost เปิดอยู่
2. **ข้อมูลสำคัญ** - ระวังการแก้ไขข้อมูลเมื่อใช้ `dev:all:remote`
3. **Backup** - สำรองข้อมูลก่อนทดสอบกับ Remote Database

---

**สร้างเมื่อ:** 2026-02-17


