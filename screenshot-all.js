/**
 * ICP Project - Screenshot Capture Script v5
 * ===================================================
 * Strategy:
 *  1. Login ผ่าน API โดยตรง → ได้ Token จริง
 *  2. Inject Token เข้า Browser localStorage ก่อนโหลดหน้าใดๆ
 *  3. เปิดหน้าแรก (/) เพื่อ initialize Vue + Store
 *  4. คลิก Link ในเมนูตาม Route Map ทีละหน้า → ถ่าย Screenshot
 *
 * วิธีใช้:  node screenshot-all.js
 */

import { chromium } from 'playwright';
import axios from 'axios';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== CONFIG =====
const BASE_URL = 'https://icp.sif.or.th/icp-project-app';
const API_URL = 'https://icp.sif.or.th/api';
const OUT_DIR = path.join(__dirname, 'screenshots');
const WAIT_MS = 2500; // milliseconds รอหลังเปลี่ยนหน้า

const ACCOUNTS = {
  user: { email: 'somnuk.sin@gmail.com', password: '123456' },
  admin: { email: 'somnuk@mju.ac.th', password: '123456' },
  suser: { email: 'somnuk.sin1@gmail.com', password: '123456' },
};

// ===== Route Map จาก Manifest =====
// Format: { label, path, menuText, clickBtn, title }
// - path      → URL สำหรับนำทาง (ใช้ page.goto)
// - menuText  → ข้อความบนเมนู (ใช้ click เพื่อ trigger data load)
//               null = ไม่ต้อง click เมนู ไปตรงๆ ได้เลย
// - clickBtn  → ข้อความบนปุ่ม (คลิกหลัง menuText เพื่อ trigger action เช่น export)
//               null = ไม่ต้องคลิกปุ่มเพิ่มเติม

const PUBLIC_ROUTES = [
  { label: '01_home', path: '/', folder: 'public', title: 'หน้าแรก (Index)' },
  { label: '02_login', path: '/LoginPage', folder: 'registration', title: 'หน้า Login' },
  { label: '03_register', path: '/RegistrationPage', folder: 'registration', title: 'หน้าลงทะเบียน' },
];

const USER_ROUTES = [
  { label: '01_form_registration', path: '/FormRegistration', folder: 'forms', menuText: 'การตั้งค่าส่วนตัว', title: 'ข้อมูลส่วนตัว (FormRegistration)' },
  { label: '02_form_component', path: '/FormComponent', folder: 'forms', menuText: 'กรอกข้อมูลส่วนตัว', title: 'ข้อมูลการศึกษา (FormComponent)' },
  { label: '02b_form_component_excel', path: '/FormComponent', folder: 'forms', menuText: 'กรอกข้อมูลส่วนตัว', clickBtn: 'ส่งออก excel', title: 'User: ข้อมูลการศึกษา - Export Excel' },
  { label: '03_form_plan_career', path: '/FormPlanCareer', folder: 'forms', menuText: 'กำหนดอาชีพเป้าหมาย', title: 'อาชีพเป้าหมาย (FormPlanCareer)' },
  { label: '03b_form_plan_career_excel', path: '/FormPlanCareer', folder: 'forms', menuText: 'กำหนดอาชีพเป้าหมาย', clickBtn: 'ส่งออก excel', title: 'User: อาชีพเป้าหมาย - Export Excel' },
  { label: '04_form_qualification', path: '/FormQualification', folder: 'forms', menuText: 'กำหนดคุณสมบัติ/ทักษะ', title: 'คุณสมบัติ/ทักษะ (FormQualification)' },
  { label: '04b_form_qualification_excel', path: '/FormQualification', folder: 'forms', menuText: 'กำหนดคุณสมบัติ/ทักษะ', clickBtn: 'ส่งออก excel', title: 'User: คุณสมบัติ/ทักษะ - Export Excel' },
  { label: '05_form_plan', path: '/FormPlan', folder: 'forms', menuText: 'การพัฒนาตนเอง', title: 'พัฒนาตนเอง (FormPlan)' },
  { label: '05b_form_plan_excel', path: '/FormPlan', folder: 'forms', menuText: 'การพัฒนาตนเอง', clickBtn: 'ส่งออก excel', title: 'User: พัฒนาตนเอง - Export Excel' },
  { label: '06_form_self_assessment', path: '/FormSelfAssessment', folder: 'forms', menuText: 'การประเมินตนเอง', title: 'ประเมินตนเอง (FormSelfAssessment)' },
  { label: '06b_form_self_assessment_excel', path: '/FormSelfAssessment', folder: 'forms', menuText: 'การประเมินตนเอง', clickBtn: 'ส่งออก excel', title: 'User: ประเมินตนเอง - Export Excel' },
  { label: '07_user_constances', path: '/tapUserConstances', folder: 'user_constances', menuText: 'จัดการอาชีพ/คุณสมบัติ', title: 'User: จัดการอาชีพ/คุณสมบัติ' },
  { label: '07b_user_constances_excel', path: '/tapUserConstances', folder: 'user_constances', menuText: 'จัดการอาชีพ/คุณสมบัติ', clickBtn: 'ส่งออก excel', title: 'User: จัดการอาชีพ/คุณสมบัติ - Export Excel' },
  { label: '08_form_dashboard', path: '/FormDashboard', folder: 'forms', menuText: 'Dashboard การวิเคราะห์', title: 'Dashboard (FormDashboard)' },
];

const ADMIN_ROUTES = [
  { label: '01_admin_registration', path: '/AdminFormRegistration', folder: 'admin_forms', menuText: 'จัดการลงทะเบียน', title: 'Admin: ลงทะเบียน' },
  { label: '01b_admin_registration_excel', path: '/AdminFormRegistration', folder: 'admin_forms', menuText: 'จัดการลงทะเบียน', clickBtn: 'ส่งออก excel', title: 'Admin: ลงทะเบียน - Export Excel' },
  { label: '02_admin_institute', path: '/tapFormInstitute', folder: 'sub_admin_forms', menuText: 'การจัดการสาขาวิชา', title: 'Admin: การจัดการสาขาวิชา' },
  { label: '02b_admin_institute_excel', path: '/tapFormInstitute', folder: 'sub_admin_forms', menuText: 'การจัดการสาขาวิชา', clickBtn: 'ส่งออก excel', title: 'Admin: การจัดการสาขาวิชา - Export Excel' },
  { label: '03_admin_constances', path: '/tapAdminConstances', folder: 'admin_constances', menuText: 'จัดการค่าคงที่', title: 'Admin: จัดการค่าคงที่' },
  { label: '03b_admin_constances_excel', path: '/tapAdminConstances', folder: 'admin_constances', menuText: 'จัดการค่าคงที่', clickBtn: 'ส่งออก excel', title: 'Admin: จัดการค่าคงที่ - Export Excel' },
  { label: '04_admin_master_career', path: '/tapAdminConstances1', folder: 'admin_constances1', menuText: 'จัดการอาชีพ/คุณสมบัติ/ทักษะ', title: 'Admin: มาสเตอร์อาชีพ' },
  { label: '04b_admin_master_career_excel', path: '/tapAdminConstances1', folder: 'admin_constances1', menuText: 'จัดการอาชีพ/คุณสมบัติ/ทักษะ', clickBtn: 'ส่งออก excel', title: 'Admin: มาสเตอร์อาชีพ - Export Excel' },
  { label: '05_admin_component', path: '/AdminFormComponent', folder: 'admin_forms', menuText: 'จัดการข้อมูลส่วนตัว', title: 'Admin: ข้อมูลการศึกษา' },
  { label: '05b_admin_component_excel', path: '/AdminFormComponent', folder: 'admin_forms', menuText: 'จัดการข้อมูลส่วนตัว', clickBtn: 'ส่งออก excel', title: 'Admin: ข้อมูลการศึกษา - Export Excel' },
  { label: '06_admin_plan_career', path: '/AdminFormPlanCareer', folder: 'admin_forms', menuText: 'จัดการอาชีพเป้าหมาย', title: 'Admin: อาชีพเป้าหมาย' },
  { label: '06b_admin_plan_career_excel', path: '/AdminFormPlanCareer', folder: 'admin_forms', menuText: 'จัดการอาชีพเป้าหมาย', clickBtn: 'ส่งออก excel', title: 'Admin: อาชีพเป้าหมาย - Export Excel' },
  { label: '07_admin_qualification', path: '/AdminFormQualification', folder: 'admin_forms', menuText: 'จัดการคุณสมบัติ/ทักษะ', title: 'Admin: คุณสมบัติ' },
  { label: '07b_admin_qualification_excel', path: '/AdminFormQualification', folder: 'admin_forms', menuText: 'จัดการคุณสมบัติ/ทักษะ', clickBtn: 'ส่งออก excel', title: 'Admin: คุณสมบัติ - Export Excel' },
  { label: '08_admin_plan', path: '/AdminFormPlan', folder: 'admin_forms', menuText: 'จัดการพัฒนาตนเอง', title: 'Admin: พัฒนาตนเอง' },
  { label: '08b_admin_plan_excel', path: '/AdminFormPlan', folder: 'admin_forms', menuText: 'จัดการพัฒนาตนเอง', clickBtn: 'ส่งออก excel', title: 'Admin: พัฒนาตนเอง - Export Excel' },
  { label: '09_admin_self_assessment', path: '/AdminFormSelfAssessment', folder: 'admin_forms', menuText: 'จัดการประเมินตนเอง', title: 'Admin: ประเมินตนเอง' },
  { label: '09b_admin_self_assessment_excel', path: '/AdminFormSelfAssessment', folder: 'admin_forms', menuText: 'จัดการประเมินตนเอง', clickBtn: 'ส่งออก excel', title: 'Admin: ประเมินตนเอง - Export Excel' },
  { label: '10a_admin_faculty', path: '/facultyForm', folder: 'sub_admin_forms', title: 'Admin: จัดการคณะ' },
  { label: '10b_admin_institute_item', path: '/instituteForm', folder: 'sub_admin_forms', title: 'Admin: จัดการวิทยาลัย/คณะ' },
  { label: '10c_admin_degree', path: '/degreeForm', folder: 'sub_admin_forms', title: 'Admin: จัดการระดับการศึกษา' },
  { label: '10d_admin_department', path: '/departmentForm', folder: 'sub_admin_forms', title: 'Admin: จัดการสาขาวิชา' },
];

const SUSER_ROUTES = [
  { label: '01_suser_registration', path: '/SuserFormRegistration', folder: 'super_user_forms', menuText: 'จัดการลงทะเบียน', title: 'SuperUser: ลงทะเบียน' },
  { label: '01b_suser_registration_excel', path: '/SuserFormRegistration', folder: 'super_user_forms', menuText: 'จัดการลงทะเบียน', clickBtn: 'ส่งออก excel', title: 'SuperUser: ลงทะเบียน - Export Excel' },
  { label: '02_suser_institute', path: '/s_tapFormInstitute', folder: 'sub_super_user_forms', menuText: 'การจัดการสาขาวิชา', title: 'SuperUser: การจัดการสาขาวิชา' },
  { label: '02b_suser_institute_excel', path: '/s_tapFormInstitute', folder: 'sub_super_user_forms', menuText: 'การจัดการสาขาวิชา', clickBtn: 'ส่งออก excel', title: 'SuperUser: การจัดการสาขาวิชา - Export Excel' },
  { label: '03_suser_master_career', path: '/tapSuperUserConstances', folder: 'super_user_constances', menuText: 'จัดการอาชีพ/คุณสมบัติ/ทักษะ', title: 'SuperUser: มาสเตอร์อาชีพ' },
  { label: '03b_suser_master_career_excel', path: '/tapSuperUserConstances', folder: 'super_user_constances', menuText: 'จัดการอาชีพ/คุณสมบัติ/ทักษะ', clickBtn: 'ส่งออก excel', title: 'SuperUser: มาสเตอร์อาชีพ - Export Excel' },
  { label: '04_suser_component', path: '/SuserFormComponent', folder: 'super_user_forms', menuText: 'จัดการข้อมูลส่วนตัว', title: 'SuperUser: ข้อมูลการศึกษา' },
  { label: '04b_suser_component_excel', path: '/SuserFormComponent', folder: 'super_user_forms', menuText: 'จัดการข้อมูลส่วนตัว', clickBtn: 'ส่งออก excel', title: 'SuperUser: ข้อมูลการศึกษา - Export Excel' },
  { label: '04c_suser_component_multi', path: '/SuserFormComponent', folder: 'super_user_forms', menuText: 'จัดการข้อมูลส่วนตัว', clickCheckbox: true, title: 'SuperUser: ข้อมูลการศึกษา - Multi Select Delete' },
  { label: '05_suser_plan_career', path: '/SuserFormPlanCareer', folder: 'super_user_forms', menuText: 'จัดการอาชีพเป้าหมาย', title: 'SuperUser: อาชีพเป้าหมาย' },
  { label: '05b_suser_plan_career_excel', path: '/SuserFormPlanCareer', folder: 'super_user_forms', menuText: 'จัดการอาชีพเป้าหมาย', clickBtn: 'ส่งออก excel', title: 'SuperUser: อาชีพเป้าหมาย - Export Excel' },
  { label: '06_suser_qualification', path: '/SuserFormQualification', folder: 'super_user_forms', menuText: 'จัดการคุณสมบัติ/ทักษะ', title: 'SuperUser: คุณสมบัติ' },
  { label: '06b_suser_qualification_excel', path: '/SuserFormQualification', folder: 'super_user_forms', menuText: 'จัดการคุณสมบัติ/ทักษะ', clickBtn: 'ส่งออก excel', title: 'SuperUser: คุณสมบัติ - Export Excel' },
  { label: '07_suser_plan', path: '/SuserFormPlan', folder: 'super_user_forms', menuText: 'จัดการพัฒนาตนเอง', title: 'SuperUser: พัฒนาตนเอง' },
  { label: '07b_suser_plan_excel', path: '/SuserFormPlan', folder: 'super_user_forms', menuText: 'จัดการพัฒนาตนเอง', clickBtn: 'ส่งออก excel', title: 'SuperUser: พัฒนาตนเอง - Export Excel' },
  { label: '08_suser_self_assessment', path: '/SuserFormSelfAssessment', folder: 'super_user_forms', menuText: 'จัดการประเมินตนเอง', title: 'SuperUser: ประเมินตนเอง' },
  { label: '08b_suser_self_assessment_excel', path: '/SuserFormSelfAssessment', folder: 'super_user_forms', menuText: 'จัดการประเมินตนเอง', clickBtn: 'ส่งออก excel', title: 'SuperUser: ประเมินตนเอง - Excel Report' },
  { label: '09a_suser_faculty', path: '/s_facultyForm', folder: 'sub_super_user_forms', title: 'SuperUser: จัดการคณะ' },
  { label: '09b_suser_institute_item', path: '/s_instituteForm', folder: 'sub_super_user_forms', title: 'SuperUser: จัดการวิทยาลัย/คณะ' },
  { label: '09c_suser_degree', path: '/s_degreeForm', folder: 'sub_super_user_forms', title: 'SuperUser: จัดการระดับการศึกษา' },
  { label: '09d_suser_department', path: '/s_departmentForm', folder: 'sub_super_user_forms', title: 'SuperUser: จัดการสาขาวิชา' },
];

// ===== ล็อกอินผ่าน API =====
async function apiLogin(account) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: account.email,
      password: account.password,
    });
    const { token, member_id, full_name } = res.data;
    // รองรับทั้งฟิลด์ role และ status จาก API
    const role = res.data.role || res.data.status || 'user';
    console.log(`  ✅ API Login OK → role: ${role}, member_id: ${member_id}`);
    return { token, member_id, full_name, role };
  } catch (err) {
    console.error(`  ❌ API Login failed: ${err.response?.data?.error || err.message}`);
    return null;
  }
}

// ===== Inject Auth ลง Browser และเตรียม Page =====
async function setupAuthPage(browser, auth) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'th-TH',
  });

  if (auth) {
    // ✅ Inject token ลงทั้ง sessionStorage (ระบบใหม่) และ localStorage (ระบบเก่า)
    // เพื่อให้ทำงานได้กับทุก version ของ Server
    await context.addInitScript(({ token, status, name, member_id }) => {
      // sessionStorage - ระบบใหม่ (หลัง security patch)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('status', status);
      sessionStorage.setItem('name', name);
      sessionStorage.setItem('member_id', String(member_id));
      // localStorage - ระบบเก่า (fallback)
      localStorage.setItem('token', token);
      localStorage.setItem('status', status);
      localStorage.setItem('name', name);
      localStorage.setItem('member_id', String(member_id));
    }, {
      token: auth.token,
      status: auth.role,
      name: auth.full_name,
      member_id: auth.member_id,
    });
  }

  const page = await context.newPage();

  // โหลดหน้าแรกเพื่อ initialize Vue App + Store
  if (auth) {
    await page.goto(`${BASE_URL}/`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(2000);
    console.log(`  🌐 App initialized | current: ${page.url()}`);
  }

  return { context, page };
}

// ===== ถ่าย Screenshot 1 หน้า =====
async function screenshotPage(page, route, groupDir) {
  console.log(`\n  📸 ${route.title}`);

  try {
    // Step 1: นำทางไปยัง URL ตาม Route Map
    await page.goto(`${BASE_URL}${route.path}`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(WAIT_MS);

    // Step 2: ถ้ามี menuText ให้คลิกเมนูเพื่อ trigger data load
    if (route.menuText) {
      const menuItem = page.locator(`.q-item__label, .q-item__section`, {
        hasText: route.menuText
      }).first();

      const visible = await menuItem.isVisible().catch(() => false);
      if (visible) {
        console.log(`     🖱  Click menu: "${route.menuText}"`);
        await menuItem.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(WAIT_MS);
      }
    }

    // Step 2a: ถ้ามี clickCheckbox ให้คลิก checkbox แรกในตารางเพื่อแสดงปุ่ม Multi-Delete
    if (route.clickCheckbox) {
      const checkbox = page.locator('.q-checkbox, input[type="checkbox"]').first();
      const cbVisible = await checkbox.isVisible().catch(() => false);
      if (cbVisible) {
        console.log(`     🖱  Click checkbox to show Bulk Actions`);
        await checkbox.click();
        await page.waitForTimeout(1000);
      }
    }

    // Step 2b: ถ้ามี clickBtn ให้คลิกปุ่มบนหน้า (เช่น ปุ่ม Export Excel)
    if (route.clickBtn) {
      const btn = page.getByRole('button', { name: route.clickBtn, exact: false }).first();
      const btnVisible = await btn.isVisible().catch(() => false);
      if (btnVisible) {
        console.log(`     🖱  Click button: "${route.clickBtn}"`);
        await btn.click();
        await page.waitForTimeout(1500); // รอ dialog/notification โผล่ขึ้น
      } else {
        // fallback: ลอง locator แบบ text
        const btnFallback = page.locator(`button, .q-btn`, { hasText: route.clickBtn }).first();
        const fallbackVisible = await btnFallback.isVisible().catch(() => false);
        if (fallbackVisible) {
          console.log(`     🖱  Click button (fallback): "${route.clickBtn}"`);
          await btnFallback.click();
          await page.waitForTimeout(1500);
        } else {
          console.warn(`     ⚠ Button not found: "${route.clickBtn}"`);
        }
      }
    }

    // Step 3: ตรวจสอบว่าอยู่หน้าที่ถูกต้อง
    const currentUrl = page.url();
    console.log(`     📍 At: ${currentUrl.replace(BASE_URL, '')}`);

    // Step 4: รอ Splash screen หายไป
    if (route.path !== '/' && route.path !== '') {
      await page.waitForFunction(() => {
        const img = document.querySelector('img[src*="pics_topic_103"], img[src*="admin.jpg"], img[src*="user.jpg"]');
        return !img || img.offsetParent === null;
      }, { timeout: 10000 }).catch(() => {});
    }
    await page.waitForTimeout(1000);

    // Step 5: ถ่าย Screenshot เข้า Sub-directory
    const finalDir = path.join(groupDir, route.folder || '');
    if (!existsSync(finalDir)) await mkdir(finalDir, { recursive: true });

    const filePath = path.join(finalDir, `${route.label}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`     ✔  Saved: ${path.join(route.folder || '', route.label + '.png').replace(/\\/g, '/')}`);

  } catch (err) {
    console.error(`     ❌ Error: ${err.message.split('\n')[0]}`);
  }
}

// ===== ถ่ายทั้งกลุ่ม =====
async function captureGroup(browser, account, routes, folder) {
  const groupDir = path.join(OUT_DIR, folder);
  if (!existsSync(groupDir)) await mkdir(groupDir, { recursive: true });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📂 Group: ${folder}`);

  const auth = account ? await apiLogin(account) : null;
  const { context, page } = await setupAuthPage(browser, auth);

  for (const route of routes) {
    await screenshotPage(page, route, groupDir);
  }

  await context.close();
  console.log(`\n  ✅ Group [${folder}] done! (${routes.length} pages)`);
}

// ===== Main =====
async function main() {
  console.log('========================================');
  console.log('🚀 ICP Screenshot Capture Tool v5 + Dir Organized');
  console.log(`📡 ${BASE_URL}`);
  console.log('========================================');

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    await captureGroup(browser, null, PUBLIC_ROUTES, '1_public');
    await captureGroup(browser, ACCOUNTS.user, USER_ROUTES, '2_user');
    await captureGroup(browser, ACCOUNTS.admin, ADMIN_ROUTES, '3_admin');
    await captureGroup(browser, ACCOUNTS.suser, SUSER_ROUTES, '4_suser');
  } finally {
    await browser.close();
  }

  const total = PUBLIC_ROUTES.length + USER_ROUTES.length + ADMIN_ROUTES.length + SUSER_ROUTES.length;
  console.log('\n========================================');
  console.log(`✅ All done! ${total} screenshots saved to ./screenshots/`);
  console.log('========================================');
}

main().catch(console.error);
