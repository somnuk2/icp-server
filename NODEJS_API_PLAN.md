# Node.js API Implementation Plan
# แผนการ Migrate จาก PHP → Node.js API (ครบทุก Endpoint)

## 📊 สรุปโครงสร้าง PHP API เดิม

### โครงสร้าง Folder PHP (ที่ใช้งานจริง)
```
icp2022/
├── icp_v1/                    → User Role
│   ├── individual_form/       → ข้อมูลส่วนตัว
│   ├── plan_form/             → แผนการเรียน
│   ├── plan_career_form/      → แผนอาชีพ
│   ├── qa_plan_career_form/   → Q&A แผนอาชีพ
│   ├── self_assessment_form/  → แบบประเมินตนเอง
│   ├── notification_form/     → การแจ้งเตือน
│   ├── registration_form/     → ลงทะเบียน
│   ├── signin_form/           → เข้าสู่ระบบ
│   ├── signup_form/           → สมัครสมาชิก
│   ├── FormReportTable1/      → รายงาน 1
│   └── FormReportTable2/      → รายงาน 2
│
├── icp_v1_suser/              → SuperUser Role (เหมือน user แต่เห็นข้อมูลทั้งหมด)
│   └── [โครงสร้างเดียวกับ icp_v1]
│
├── icp_v1_sub_admin/          → Admin Role (จัดการค่าคงที่)
│   ├── institute/             → สถาบัน
│   ├── faculty/               → คณะ
│   ├── degree/                → ระดับการศึกษา
│   └── department/            → สาขาวิชา
│
└── icp_v1_admin/              → Admin Role (รายงาน/กราฟ)
    ├── FormChart1/
    ├── FormChart2/
    ├── FormChart3/
    ├── FormReportTable1/
    └── FormReportTable2/
```

---

## 🎯 Node.js API ที่ต้องสร้าง (Unique APIs)

> **หลักการ:** PHP มีไฟล์ซ้ำกันในหลาย folder แต่ Node.js จะมี API เดียว
> แล้วใช้ Role-based Authorization แทน

### Group 1: Authentication (ยืนยันตัวตน)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 1 | Login | POST | `/api/auth/login` | signin_form/api-member.php | All |
| 2 | Register | POST | `/api/auth/register` | signup_form/api-member.php | All |
| 3 | Logout | POST | `/api/auth/logout` | - | All |

### Group 2: Education Constants (ค่าคงที่การศึกษา) - Admin Only
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 4 | Get Institutes | GET | `/api/institutes` | api-institute.php | All |
| 5 | Create Institute | POST | `/api/institutes` | api-institute.php | Admin |
| 6 | Update Institute | PUT | `/api/institutes/:id` | api-institute.php | Admin |
| 7 | Delete Institute | DELETE | `/api/institutes/:id` | api-institute.php | Admin |
| 8 | Get Faculties | GET | `/api/faculties` | api-individual.php (faculty) | All |
| 9 | Create Faculty | POST | `/api/faculties` | api-individual.php (faculty) | Admin |
| 10 | Update Faculty | PUT | `/api/faculties/:id` | api-individual.php (faculty) | Admin |
| 11 | Delete Faculty | DELETE | `/api/faculties/:id` | api-individual.php (faculty) | Admin |
| 12 | Get Degrees | GET | `/api/degrees` | api-individual.php (degree) | All |
| 13 | Create Degree | POST | `/api/degrees` | api-individual.php (degree) | Admin |
| 14 | Update Degree | PUT | `/api/degrees/:id` | api-individual.php (degree) | Admin |
| 15 | Delete Degree | DELETE | `/api/degrees/:id` | api-individual.php (degree) | Admin |
| 16 | Get Departments | GET | `/api/departments` | api-individual.php (dept) | All |
| 17 | Create Department | POST | `/api/departments` | api-individual.php (dept) | Admin |
| 18 | Update Department | PUT | `/api/departments/:id` | api-individual.php (dept) | Admin |
| 19 | Delete Department | DELETE | `/api/departments/:id` | api-individual.php (dept) | Admin |

### Group 3: Member (สมาชิก)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 20 | Get Members | GET | `/api/members` | api-member.php | Admin/SuperUser |
| 21 | Get Member | GET | `/api/members/:id` | api-member.php | All (ตัวเอง) |
| 22 | Update Member | PUT | `/api/members/:id` | api-member.php | All (ตัวเอง) |
| 23 | Delete Member | DELETE | `/api/members/:id` | api-member.php | Admin |

### Group 4: Individual (ข้อมูลส่วนตัว)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 24 | Get All Individuals | GET | `/api/individuals` | api-individual.php | Admin/SuperUser |
| 25 | Get Individual | GET | `/api/individuals/:id` | api-individual.php | All (ตัวเอง) |
| 26 | Create Individual | POST | `/api/individuals` | api-individual.php | User |
| 27 | Update Individual | PUT | `/api/individuals/:id` | api-individual.php | All (ตัวเอง) |
| 28 | Delete Individual | DELETE | `/api/individuals/:id` | api-individual.php | Admin |

### Group 5: Plan (แผนการเรียน)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 29 | Get All Plans | GET | `/api/plans` | api-plan.php | Admin/SuperUser |
| 30 | Get Plan | GET | `/api/plans/:id` | api-plan.php | All (ตัวเอง) |
| 31 | Create Plan | POST | `/api/plans` | api-plan.php | User |
| 32 | Update Plan | PUT | `/api/plans/:id` | api-plan.php | All (ตัวเอง) |
| 33 | Delete Plan | DELETE | `/api/plans/:id` | api-plan.php | Admin |

### Group 6: Plan Career (แผนอาชีพ)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 34 | Get All Plan Careers | GET | `/api/plan-careers` | api-plan-career.php | Admin/SuperUser |
| 35 | Get Plan Career | GET | `/api/plan-careers/:id` | api-plan-career.php | All (ตัวเอง) |
| 36 | Create Plan Career | POST | `/api/plan-careers` | api-plan-career.php | User |
| 37 | Update Plan Career | PUT | `/api/plan-careers/:id` | api-plan-career.php | All (ตัวเอง) |
| 38 | Delete Plan Career | DELETE | `/api/plan-careers/:id` | api-plan-career.php | Admin |

### Group 7: QA Plan Career (Q&A)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 39 | Get All QA | GET | `/api/qa-plan-careers` | api-qa-plan-career.php | Admin/SuperUser |
| 40 | Get QA | GET | `/api/qa-plan-careers/:id` | api-qa-plan-career.php | All (ตัวเอง) |
| 41 | Create QA | POST | `/api/qa-plan-careers` | api-qa-plan-career.php | User |
| 42 | Update QA | PUT | `/api/qa-plan-careers/:id` | api-qa-plan-career.php | All (ตัวเอง) |
| 43 | Delete QA | DELETE | `/api/qa-plan-careers/:id` | api-qa-plan-career.php | Admin |

### Group 8: Self Assessment (แบบประเมินตนเอง)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 44 | Get All Assessments | GET | `/api/self-assessments` | api-self-assessment.php | Admin/SuperUser |
| 45 | Get Assessment | GET | `/api/self-assessments/:id` | api-self-assessment.php | All (ตัวเอง) |
| 46 | Create Assessment | POST | `/api/self-assessments` | api-self-assessment.php | User |
| 47 | Update Assessment | PUT | `/api/self-assessments/:id` | api-self-assessment.php | All (ตัวเอง) |
| 48 | Delete Assessment | DELETE | `/api/self-assessments/:id` | api-self-assessment.php | Admin |

### Group 9: Qualification (คุณสมบัติ)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 49 | Get All Qualifications | GET | `/api/qualifications` | api-qualification.php | Admin/SuperUser |
| 50 | Get Qualification | GET | `/api/qualifications/:id` | api-qualification.php | All (ตัวเอง) |
| 51 | Create Qualification | POST | `/api/qualifications` | api-qualification.php | User |
| 52 | Update Qualification | PUT | `/api/qualifications/:id` | api-qualification.php | All (ตัวเอง) |
| 53 | Delete Qualification | DELETE | `/api/qualifications/:id` | api-qualification.php | Admin |

### Group 10: Career (อาชีพ)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 54 | Get Careers | GET | `/api/careers` | api-career.php | All |
| 55 | Create Career | POST | `/api/careers` | api-career.php | Admin |
| 56 | Update Career | PUT | `/api/careers/:id` | api-career.php | Admin |
| 57 | Delete Career | DELETE | `/api/careers/:id` | api-career.php | Admin |

### Group 11: Notification (การแจ้งเตือน)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 58 | Get Notifications | GET | `/api/notifications` | api-notification.php | All |
| 59 | Create Notification | POST | `/api/notifications` | api-notification.php | Admin/SuperUser |
| 60 | Update Notification | PUT | `/api/notifications/:id` | api-notification.php | Admin |
| 61 | Delete Notification | DELETE | `/api/notifications/:id` | api-notification.php | Admin |

### Group 12: Dashboard & Reports (รายงาน)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 62 | Get Dashboard | GET | `/api/dashboard` | api-dashboard.php | Admin/SuperUser |
| 63 | Get Pivot Data | GET | `/api/pivot` | api-pivot.php | Admin/SuperUser |
| 64 | Get Report Table 1 | GET | `/api/reports/table1` | FormReportTable1/* | Admin/SuperUser |
| 65 | Get Report Table 2 | GET | `/api/reports/table2` | FormReportTable2/* | Admin/SuperUser |

### Group 13: Reference Data (ข้อมูลอ้างอิง)
| # | API | Method | Endpoint | PHP เดิม | Role |
|---|-----|--------|----------|----------|------|
| 66 | Get Disabilities | GET | `/api/disabilities` | api-disability.php | All |
| 67 | Get Projects | GET | `/api/projects` | api-project.php | All |
| 68 | Get Advisors | GET | `/api/advisors` | api-advisor.php | All |

---

## ✅ Implementation Checklist

### Phase 0: Setup (ต้องทำก่อน)
- [ ] ติดตั้ง `mysql2` package ใน backend
- [ ] สร้าง `backend/config/database.js`
- [ ] สร้าง `backend/middleware/auth.js` (JWT Authentication)
- [ ] สร้าง `backend/middleware/authorize.js` (Role Authorization)
- [ ] สร้าง `backend/middleware/errorHandler.js`
- [ ] อัปเดต `backend/server.js` ให้ใช้ mysql2 แทน PHP Proxy

### Phase 1: Authentication
- [ ] 1. POST `/api/auth/login`
- [ ] 2. POST `/api/auth/register`
- [ ] 3. POST `/api/auth/logout`

### Phase 2: Education Constants (Admin)
- [ ] 4-7. CRUD `/api/institutes`
- [ ] 8-11. CRUD `/api/faculties`
- [ ] 12-15. CRUD `/api/degrees`
- [ ] 16-19. CRUD `/api/departments`

### Phase 3: Member
- [ ] 20-23. CRUD `/api/members`

### Phase 4: Individual
- [ ] 24-28. CRUD `/api/individuals`

### Phase 5: Plan & Career
- [ ] 29-33. CRUD `/api/plans`
- [ ] 34-38. CRUD `/api/plan-careers`
- [ ] 39-43. CRUD `/api/qa-plan-careers`

### Phase 6: Assessment & Qualification
- [ ] 44-48. CRUD `/api/self-assessments`
- [ ] 49-53. CRUD `/api/qualifications`

### Phase 7: Reference Data
- [ ] 54-57. CRUD `/api/careers`
- [ ] 58-61. CRUD `/api/notifications`
- [ ] 66. GET `/api/disabilities`
- [ ] 67. GET `/api/projects`
- [ ] 68. GET `/api/advisors`

### Phase 8: Dashboard & Reports
- [ ] 62. GET `/api/dashboard`
- [ ] 63. GET `/api/pivot`
- [ ] 64. GET `/api/reports/table1`
- [ ] 65. GET `/api/reports/table2`

### Phase 9: Frontend Integration
- [ ] อัปเดต `src/utils/apiConfig.js` ให้ชี้ไป Node.js endpoints ใหม่
- [ ] ทดสอบทุก Frontend form กับ Node.js API
- [ ] ลบ PHP Proxy code ออกจาก server.js

### Phase 10: Testing
- [ ] ทดสอบ Local (DB_MODE=local)
- [ ] ทดสอบ Remote (DB_MODE=remote)
- [ ] ทดสอบ Role: User
- [ ] ทดสอบ Role: SuperUser
- [ ] ทดสอบ Role: Admin

---

## 📁 โครงสร้าง Backend ที่จะสร้าง

```
backend/
├── config/
│   └── database.js              ← MySQL Connection Pool
├── middleware/
│   ├── auth.js                  ← JWT Verify
│   ├── authorize.js             ← Role Check
│   └── errorHandler.js          ← Global Error Handler
├── routes/
│   ├── auth.js                  ← Login/Register
│   ├── institutes.js
│   ├── faculties.js
│   ├── degrees.js
│   ├── departments.js
│   ├── members.js
│   ├── individuals.js
│   ├── plans.js
│   ├── planCareers.js
│   ├── qaPlanCareers.js
│   ├── selfAssessments.js
│   ├── qualifications.js
│   ├── careers.js
│   ├── notifications.js
│   ├── disabilities.js
│   ├── projects.js
│   ├── advisors.js
│   ├── dashboard.js
│   ├── pivot.js
│   └── reports.js
├── server.js
├── package.json
└── .env (อ่านจาก root)
```

---

## 🔑 Role Permission Matrix

| Resource | User | SuperUser | Admin |
|----------|------|-----------|-------|
| institutes | R | R | CRUD |
| faculties | R | R | CRUD |
| degrees | R | R | CRUD |
| departments | R | R | CRUD |
| members | R (self) | R (all) | CRUD |
| individuals | CRUD (self) | R (all) | CRUD |
| plans | CRUD (self) | R (all) | CRUD |
| plan-careers | CRUD (self) | R (all) | CRUD |
| qa-plan-careers | CRUD (self) | R (all) | CRUD |
| self-assessments | CRUD (self) | R (all) | CRUD |
| qualifications | CRUD (self) | R (all) | CRUD |
| careers | R | R | CRUD |
| notifications | R | R+C | CRUD |
| dashboard | - | R | R |
| reports | - | R (group) | R (all) |

> R=Read, C=Create, U=Update, D=Delete, CRUD=ทั้งหมด

---

**สร้างเมื่อ:** 2026-02-18
**จำนวน API Endpoints ทั้งหมด:** 68 endpoints
**จำนวน Route Files:** 19 files


