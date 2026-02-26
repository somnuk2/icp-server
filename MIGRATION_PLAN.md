# แผนการ Migrate จาก PHP API ไป Node.js API

## 📋 ภาพรวมโครงการ

**เป้าหมาย:** แทนที่ PHP APIs ทั้งหมดด้วย Node.js + Express + MySQL2

**ข้อดี:**
- ✅ ใช้ JavaScript ทั้งระบบ (Frontend + Backend)
- ✅ ไม่ต้องพึ่งพา XAMPP/Apache
- ✅ Deploy ง่ายกว่า (Node.js เท่านั้น)
- ✅ จัดการ Database Connection ได้ดีกว่า
- ✅ รองรับ async/await แบบ Native

---

## 🎯 Phase 1: การวิเคราะห์และเตรียมการ

### 1.1 สำรวจ PHP APIs ที่มีอยู่

**ไฟล์ที่ต้อง Migrate:**

```
c:\xampp\htdocs\icp2022\
├── icp_v1_sub_admin\
│   ├── institute\
│   │   └── api-institute.php          ← สถาบัน (Institute)
│   ├── faculty\
│   │   └── api-individual.php         ← คณะ (Faculty)
│   ├── degree\
│   │   └── api-individual.php         ← ระดับการศึกษา (Degree)
│   ├── department\
│   │   └── api-individual.php         ← สาขาวิชา (Department)
│   └── [อื่นๆ...]
└── icp_v1\
    ├── notification_form\
    │   └── api-notification.php       ← การแจ้งเตือน
    ├── plan_form\
    │   └── api-plan.php               ← แผนการเรียน
    ├── qa_plan_career_form\
    │   └── api-qa-plan-career.php     ← Q&A
    ├── self_assessment_form\
    │   └── api-self-assessment.php    ← แบบประเมินตนเอง
    └── [อื่นๆ...]
```

### 1.2 วิเคราะห์ API Endpoints

**ตัวอย่างจาก `api-institute.php`:**
- `POST /api-institute.php` + `action: "insert"` → สร้างสถาบัน
- `POST /api-institute.php` + `action: "update"` → แก้ไขสถาบัน
- `POST /api-institute.php` + `action: "delete"` → ลบสถาบัน
- `POST /api-institute.php` + `action: "fetch_all"` → ดึงข้อมูลทั้งหมด
- `POST /api-institute.php` + `action: "fetch_single"` → ดึงข้อมูลเดียว

**แปลงเป็น RESTful API:**
- `POST /api/institutes` → สร้าง
- `PUT /api/institutes/:id` → แก้ไข
- `DELETE /api/institutes/:id` → ลบ
- `GET /api/institutes` → ดึงทั้งหมด
- `GET /api/institutes/:id` → ดึงเดียว

---

## 🏗️ Phase 2: Setup โครงสร้าง Backend

### 2.1 โครงสร้าง Folder ใหม่

```
backend/
├── server.js                    ← Main server file
├── config/
│   └── database.js             ← Database configuration
├── models/
│   ├── Institute.js            ← Institute model
│   ├── Faculty.js              ← Faculty model
│   ├── Degree.js               ← Degree model
│   ├── Department.js           ← Department model
│   └── [อื่นๆ...]
├── routes/
│   ├── institutes.js           ← Institute routes
│   ├── faculties.js            ← Faculty routes
│   ├── degrees.js              ← Degree routes
│   ├── departments.js          ← Department routes
│   └── [อื่นๆ...]
├── controllers/
│   ├── instituteController.js  ← Institute business logic
│   ├── facultyController.js    ← Faculty business logic
│   └── [อื่นๆ...]
├── middleware/
│   ├── errorHandler.js         ← Error handling
│   └── logger.js               ← Request logging
└── package.json
```

### 2.2 ติดตั้ง Dependencies

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "mysql2": "^3.11.5",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

---

## 🔨 Phase 3: Implementation (ทีละ Module)

### 3.1 Module 1: Institute (สถาบัน) - ตัวอย่าง

**ขั้นตอน:**
1. สร้าง Database Config
2. สร้าง Institute Model
3. สร้าง Institute Controller
4. สร้าง Institute Routes
5. ทดสอบกับ Postman/Thunder Client
6. เชื่อมต่อกับ Frontend

### 3.2 Module 2-4: Faculty, Degree, Department

**ทำตามลำดับ:**
- Faculty (คณะ)
- Degree (ระดับการศึกษา)
- Department (สาขาวิชา)

### 3.3 Module 5+: APIs อื่นๆ

**ลำดับความสำคัญ:**
1. ✅ Institute, Faculty, Degree, Department (Education Management)
2. Notification (การแจ้งเตือน)
3. Plan (แผนการเรียน)
4. Self Assessment (แบบประเมิน)
5. Q&A
6. อื่นๆ ตามความจำเป็น

---

## 🧪 Phase 4: Testing

### 4.1 Local Testing (localhost)

**Environment:**
```env
DB_MODE=local
DB_LOCAL_HOST=localhost
DB_LOCAL_PORT=3306
```

**ขั้นตอน:**
1. รัน MySQL บน XAMPP
2. รัน Node.js Backend: `npm run dev:backend:local`
3. ทดสอบด้วย Postman/Thunder Client
4. ทดสอบกับ Frontend: `npm run dev:all:local`

**Test Cases:**
- ✅ สร้างข้อมูล (Create)
- ✅ อ่านข้อมูล (Read)
- ✅ แก้ไขข้อมูล (Update)
- ✅ ลบข้อมูล (Delete)
- ✅ Error Handling
- ✅ Validation

### 4.2 Remote Testing (Server)

**Environment:**
```env
DB_MODE=remote
DB_REMOTE_HOST=10.2.0.5
DB_REMOTE_PORT=3306
```

**ขั้นตอน:**
1. รัน Node.js Backend: `npm run dev:backend:remote`
2. ทดสอบการเชื่อมต่อ Database
3. ทดสอบ CRUD Operations
4. ทดสอบกับ Frontend: `npm run dev:all:remote`

---

## 🚀 Phase 5: Migration Strategy

### 5.1 Parallel Running (แนะนำ)

**ระหว่างการ Migrate:**
```
Frontend → Node.js Proxy → {
    ├── Node.js API (ใหม่) → MySQL
    └── PHP API (เก่า) → MySQL
}
```

**ข้อดี:**
- ✅ Migrate ทีละ Module ได้
- ✅ Rollback ง่ายถ้ามีปัญหา
- ✅ ไม่กระทบการใช้งาน

**วิธีการ:**
```javascript
// ใน server.js
app.use('/api/institutes', instituteRoutes);  // Node.js API ใหม่
app.all(/^\/icp2022\/.*/, phpProxyHandler);   // PHP API เก่า (fallback)
```

### 5.2 Complete Migration

**เมื่อ Migrate ครบทุก Module:**
1. ทดสอบทุก Feature
2. ลบ PHP Proxy Code
3. ลบ XAMPP Dependencies
4. Deploy ไป Production

---

## 📊 Phase 6: Deployment

### 6.1 Local Deployment

**ไฟล์ที่ต้อง Deploy:**
```
backend/
├── server.js
├── config/
├── models/
├── routes/
├── controllers/
├── middleware/
├── package.json
└── .env (สร้างบน Server)
```

**คำสั่ง:**
```bash
# บน Server
cd /path/to/backend
npm install --production
npm start
```

### 6.2 Production Deployment (Server 10.2.0.5)

**ขั้นตอน:**
1. ติดตั้ง Node.js บน Server
2. คัดลอก backend folder
3. ตั้งค่า .env
4. ติดตั้ง PM2 (Process Manager)
5. รัน Backend ด้วย PM2

**คำสั่ง:**
```bash
# ติดตั้ง PM2
npm install -g pm2

# รัน Backend
pm2 start server.js --name icp-backend

# Auto-restart on boot
pm2 startup
pm2 save
```

---

## 📅 Timeline (ประมาณการ)

### Week 1: Setup & Module 1
- Day 1-2: Setup โครงสร้าง, Database Config
- Day 3-5: Institute API (Model, Controller, Routes)
- Day 6-7: Testing & Integration

### Week 2: Module 2-4
- Day 1-2: Faculty API
- Day 3-4: Degree API
- Day 5-6: Department API
- Day 7: Testing & Integration

### Week 3: Module 5+
- Day 1-3: Notification, Plan APIs
- Day 4-5: Self Assessment, Q&A APIs
- Day 6-7: Testing & Bug Fixes

### Week 4: Deployment
- Day 1-3: Final Testing
- Day 4-5: Production Deployment
- Day 6-7: Monitoring & Optimization

---

## ✅ Checklist

### Phase 1: เตรียมการ
- [ ] สำรวจ PHP APIs ทั้งหมด
- [ ] วิเคราะห์ Database Schema
- [ ] จัดลำดับความสำคัญของ APIs
- [ ] Setup โครงสร้าง Backend

### Phase 2: Development
- [ ] สร้าง Database Config
- [ ] Migrate Institute API
- [ ] Migrate Faculty API
- [ ] Migrate Degree API
- [ ] Migrate Department API
- [ ] Migrate APIs อื่นๆ

### Phase 3: Testing
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Local Testing
- [ ] Remote Testing
- [ ] Frontend Integration

---

## ⚠️ ขอบเขตการดำเนินการ (Scope Exclusion)
เพื่อให้เป็นไปตามความต้องการของผู้ใช้ ฟอร์มและฟีเจอร์ต่อไปนี้จะ **ไม่ถูกนำมาจัดการ (Exclude)**:
1. **Admin Reports** (`src/pages/admin_reports/`): ยุติการใช้งานและนำออกจากเมนู
2. **SuperUser Reports** (`src/pages/super_reports/`): ยุติการใช้งานและนำออกจากเมนู

### Phase 4: Deployment
- [ ] Deploy to Local Server
- [ ] Deploy to Production
- [ ] Setup PM2
- [ ] Monitoring
- [ ] Documentation

---

## 🔧 Tools & Resources

### Development Tools
- **VS Code** - Code Editor
- **Thunder Client / Postman** - API Testing
- **MySQL Workbench** - Database Management
- **Git** - Version Control

### Monitoring Tools
- **PM2** - Process Manager
- **PM2 Logs** - Log Monitoring
- **MySQL Slow Query Log** - Performance Monitoring

---

## 📝 Next Steps

1. **ยืนยันแผน** - ตรวจสอบว่าแผนนี้ตรงกับความต้องการหรือไม่
2. **เริ่ม Phase 1** - สำรวจและวิเคราะห์ PHP APIs
3. **Setup โครงสร้าง** - สร้าง folder structure
4. **Migrate Module แรก** - เริ่มจาก Institute API

---

**สร้างเมื่อ:** 2026-02-18  
**ประมาณการเวลา:** 4 สัปดาห์  
**ความเสี่ยง:** ต่ำ-กลาง (มี Parallel Running Strategy)


