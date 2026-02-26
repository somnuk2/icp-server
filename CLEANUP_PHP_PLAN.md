# แผนการนำ PHP ออกจากระบบ 100% (ICP Project)
**ฉบับร่างวันที่:** 20 กุมภาพันธ์ 2026
**เป้าหมาย:** ย้าย Logic ทั้งหมดไปที่ Node.js และยกเลิกการใช้งาน PHP API/Proxy อย่างถาวร

---

## 📋 สถานะปัจจุบัน (Current Status)
1. **Node.js Backend:** มี API Routes เกือบครบทุกตารางแล้ว
2. **Frontend Pattern:** มี Pattern การเขียนแบบ `async/await` และ `getRestApiUrl` ที่ทดสอบแล้วใน `Admin: FormSelfAssessment.vue`
3. **Dependencies:** ยังมีหลายฟอร์มที่เรียกใช้ `getApiUrls` (Legacy PHP Utility) และ `server.js` ยังเปิด PHP Proxy (Port 85) ไว้

---

## 🏗️ ระยะที่ 1: จัดการส่วน ADMIN (เสร็จสิ้นไปแล้ว 85%)
**เป้าหมาย:** ทำความสะอาด Admin Forms ให้เป็น Node.js 100%
1. **[ ] FormPlan.vue:** แก้ไขจุดเรียก PHP `get_years` ที่ค้างอยู่ (Line 1235)
2. **[ ] FormQualification.vue:** ตรวจสอบและย้ายมาใช้ `/api/qualifications`
3. **[ ] FormComponent.vue:** ย้ายมาใช้ `/api/individuals` หรือ endpoint ที่เกี่ยวข้อง
4. **[ ] FormNotification.vue:** ย้ายมาใช้ `/api/notifications`
5. **[ ] Cleanup:** ลบไฟล์ `copy` และไฟล์สำรองใน `admin_forms/` ออกทั้งหมด

---

## 🏗️ ระยะที่ 2: ยกเครื่องส่วน SUPER USER (ยังค้างอยู่ 75%)
**เป้าหมาย:** ย้ายฟอร์มจัดการของ Super User ที่ยังเป็น PHP ทั้งหมด
1. **[ ] FormPlan.vue:** (สำคัญมาก) รีแฟคเตอร์จาก PHP `.then().catch()` เป็น `async/await`
2. **[ ] FormPlanCareer.vue:** ย้ายมาใช้ `/api/plan-careers`
3. **[ ] FormQualification.vue:** ย้ายมาใช้ `/api/qualifications`
4. **[ ] FormComponent.vue:** ย้ายมาใช้ `/api/individuals`
5. **[ ] FormRegistration.vue:** ย้ายมาใช้ `/api/auth` หรือ `/api/members`
6. **[ ] FormNotification.vue:** ย้ายมาใช้ `/api/notifications`

---

## 🏗️ ระยะที่ 3: ปรับปรุงส่วน USER (นักเรียน/ผู้ใช้ทั่วไป)
**เป้าหมาย:** ให้ฟอร์มที่นักเรียนใช้มีความเสถียรและเร็วขึ้นบน Node.js
1. **[ ] FormPlan.vue:** แก้ไขการเรียก API ที่ยังปนกันระหว่าง `action` (PHP) และ REST (Node)
2. **[ ] FormSelfAssessment.vue:** ตรวจสอบความถูกต้องของ 20+ methods ให้เป็น Node.js 100% (ปัจจุบันเป็น Mixed)
3. **[ ] FormPlanCareer.vue:** ย้ายมาใช้ `/api/plan-careers`
4. **[ ] FormQualification.vue:** ย้ายมาใช้ `/api/qualifications`
5. **[ ] FormComponent.vue:** ย้ายมาใช้ `/api/individuals`

---

## 🏗️ ระยะที่ 4: การลบระบบเก่าและ Cleanup (Final Removal)
**เป้าหมาย:** ตัด PHP ออกจากระบบอย่างแท้จริง
1. **[ ] utils/apiConfig.js:** 
   - ลบทิ้ง: `getApiBaseUrl`, `getApiUrls`
   - แก้ไข: ให้เหลือเพียง `getRestApiUrl`
2. **[ ] backend/server.js:**
   - ลบทิ้ง: ส่วน `PHP Proxy Fallback` (axios calls ไป Port 85)
   - ลบทิ้ง: `import axios from 'axios'` และ `const XAMPP_PORT = 85`
3. **[ ] File System:**
   - ลบทิ้ง: โฟลเดอร์ `icp2022-21-06-66` (PHP Legacy Code)
   - ลบทิ้ง: ไฟล์ `.php` ทั้งหมดใน root directory
4. **[ ] Database:** ยืนยันว่า Node.js ต่อตรงกับ MySQL โดยไม่ผ่าน PHP Script แล้ว

---

## ⏱️ การประเมินเวลา (Estimation)
- **Admin Completion:** 1-2 ชั่วโมง
- **Super User Overhaul:** 4-6 ชั่วโมง
- **User Migration:** 3-5 ชั่วโมง
- **Cleanup & Verification:** 1-2 ชั่วโมง
**รวมเวลาประมาณ:** 9-15 ชั่วโมง (แบ่งทำทีละส่วนได้)

---

## 🧪 แผนการทดสอบ (Verification Plan)
1. **Login Test:** ทดสอบ Login ของทั้ง 3 Roles (Admin, Super User, Student)
2. **CRUD Test:** ทดสอบ เพิ่ม/อ่าน/แก้ไข/ลบ ข้อมูลในฟอร์มหลักทุกประเภท
3. **Report Test:** ทดสอบการ Export Excel/PDF ว่าข้อมูลยังออกมาครบถ้วน
4. **Network Audit:** เปิด DevTools (F12) ตรวจสอบว่าไม่มี Request ใดวิ่งไปหาไฟล์ `.php` อีกเลย

---
*จัดทำโดย: Antigravity AI*


