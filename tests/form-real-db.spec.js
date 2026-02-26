
import { test, expect } from '@playwright/test';
import {
    fillCompleteForm,
    submitForm,
    confirmDialog
} from './helpers/form-helpers';

// ข้อมูลจริงจาก SQL Dump (u486700931_icp.sql)
const realDbData = {
    // ข้อมูลส่วนตัว
    birthday: '2545',
    telephone: '0812345678',

    // ข้อมูลการศึกษา (Institute ID 1: มหาวิทยาลัยแม่โจ้)
    institute: { label: 'มหาวิทยาลัยแม่โจ้', value: 1 },
    // Faculty ID 1: วิทยาศาสตร์ (ตรงตาม SQL)
    faculty: { label: 'วิทยาศาสตร์', value: 1 },
    // Degree ID 1: ปริญญาตรี
    degree: { label: 'ปริญญาตรี', value: 1 },
    // Department ID 1: วิทยาการคอมพิวเตอร์
    department: { label: 'วิทยาการคอมพิวเตอร์', value: 1 },

    is_graduate: true,
    date: '2566',
    year: '4',

    // ข้อมูลความพิการ (Disability ID 8)
    is_disability: true,
    disability: { label: 'ทางร่างกาย หรือการเคลื่อนไหว หรือสุขภาพ', value: 8 },
    dis_description: 'ทดสอบการบันทึกข้อมูลจริง',

    // ข้อมูลโครงการ (Project ID 1)
    project: { label: 'การพัฒนาความสามารถผู้พิการ', value: 1 },

    // ข้อมูลผู้ดูแล (Advisor ID 1)
    advisor: { label: 'ดารา สง่า', value: 1 },

    // ข้อมูลอื่นๆ
    province: 'เชียงใหม่',
    favoriteSubject: 'คณิตศาสตร์',
    unfavoriteSubject: 'ภาษาอังกฤษ',
    favoriteActivity: 'อ่านหนังสือ',
    skill: 'เขียนโปรแกรม',
    dreamCareer: 'Programmer',
    preferredRegion: 'ภาคเหนือ',
    additionalInfo: 'ทดสอบระบบ Real DB'
};

test.describe('Real Database Integration', () => {

    test.beforeEach(async ({ page }) => {
        // ไม่มีการ Mock API (ใช้ Real Backend)
        // ตรงนี้ Playwright จะยิง Request ไปที่ localhost:85 ตาม axios.js
        await page.goto('/#/form-component');
    });

    test('should submit form to real database successfully', async ({ page }) => {
        // 1. กรอกข้อมูลด้วยข้อมูลจริงที่มีในฐานข้อมูล
        await fillCompleteForm(page, realDbData);

        // 2. กดปุ่มบันทึก
        await submitForm(page);

        // 3. ยืนยัน Dialog
        await confirmDialog(page);

        // 4. ตรวจสอบข้อความสำเร็จ (Alert หรือ Dialog)
        // หมายเหตุ: ข้อความอาจจะมาจาก Backend ที่ส่งกลับมา
        // ปกติจะมีการแจ้งเตือน "บันทึกข้อมูลเรียบร้อย" หรือ "Insert Complete"
        // ต้องรอดูหน้าจอจริง แต่ใช้ generic wait หรือ check dialog
        await expect(page.locator('.q-dialog')).not.toBeVisible({ timeout: 10000 });
    });

    // Optional: ลบข้อมูล (ถ้าสามารถทำได้)
    // เนื่องจากเราไม่ทราบ ID ที่ Insert เข้าไป (API ไม่ return ID)
    // จึงอาจต้องลบด้วยมือ หรือ หาจาก Table เอา
});
