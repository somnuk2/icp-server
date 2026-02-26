import { test, expect } from '@playwright/test';
import {
  mockPlanCareers,
  mockQaPlanCareers,
  mockDevelopments,
  mockImportances,
  mockFrequencies,
  mockExistingPlans,
  mockAiRecommendations
} from './fixtures/test-data-plan';

test.describe('FormPlan Component', () => {
  test.beforeEach(async ({ page }) => {
    // Debug: Print console logs
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser Error] ${err.message}`));

    // Helper for CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    };

    // --- Mock API Routes ---

    // 1. Plan API (Core CRUD & constants)
    await page.route('**/api-plan.php', async route => {
      const postData = route.request().postDataJSON();
      console.log(`[Mock API] api-plan.php called with action: ${postData?.action}`);
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (!postData) return route.continue();

      if (postData.action === 'getall') {
        return route.fulfill({ json: mockExistingPlans, headers: corsHeaders });
      }
      else if (postData.action === 'getDevelopment') {
        return route.fulfill({ json: mockDevelopments, headers: corsHeaders });
      }
      else if (postData.action === 'getImportance') {
        return route.fulfill({ json: mockImportances, headers: corsHeaders });
      }
      else if (postData.action === 'getFrequency') {
        return route.fulfill({ json: mockFrequencies, headers: corsHeaders });
      }
      else if (postData.action === 'edit') {
        const plan = mockExistingPlans.find(p => p.plan_id === postData.plan_id);
        return route.fulfill({ json: plan || {}, headers: corsHeaders });
      }
      else if (['insert', 'update', 'delete', 'deleteBulk'].includes(postData.action)) {
        return route.fulfill({ json: { message: "Success" }, headers: corsHeaders });
      }
      return route.continue();
    });

    // 2. Plan Careers
    await page.route('**/api-plan-career.php', async route => {
      const postData = route.request().postDataJSON();
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (postData?.action === 'get_plan_career_by_member_id') {
        return route.fulfill({ json: mockPlanCareers, headers: corsHeaders });
      }
      return route.continue();
    });

    // 3. Qualifications per Career
    await page.route('**/api-qa-plan-career.php', async route => {
      const postData = route.request().postDataJSON();
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (postData?.action === 'get_qa_plan_career_by_plan_career_id') {
        return route.fulfill({ json: mockQaPlanCareers, headers: corsHeaders });
      }
      return route.continue();
    });

    // 4. Individual API (Constants/Profile)
    await page.route('**/api-individual.php', async route => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      return route.fulfill({ json: [{ member_id: '123', department_name: 'IT', skill: 'Coding' }], headers: corsHeaders });
    });

    // 5. Notification API
    await page.route('**/api-notification.php', route => {
      return route.fulfill({ json: { message: "No notifications" }, headers: corsHeaders });
    });

    // 6. Member API
    await page.route('**/api-member.php', route => {
      return route.fulfill({ json: [{ member_id: '123', full_name: 'Test User' }], headers: corsHeaders });
    });

    // 7. AI Chat API
    await page.route('**/api/chat', async route => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAiRecommendations),
        headers: corsHeaders
      });
    });

    // Direct navigation to the form
    await page.goto('/');
    // Mocking login state
    await page.evaluate(() => {
      localStorage.setItem('member_id', '123');
      localStorage.setItem('full_name', 'Test User');
      window.history.pushState({}, '', '/icp-project-app/#/FormPlan');
    });
    await page.reload();
    await page.waitForURL('**/FormPlan');
    await page.waitForLoadState('networkidle');
  });

  test('should display initial elements and tree structure', async ({ page }) => {
    await expect(page.getByText('การพัฒนาตนเอง')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ขอคำแนะนำใหม่' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'เพิ่มแผนด้วยตนเอง' })).toBeVisible();

    // Check tree structure
    await expect(page.locator('.q-tree')).toBeVisible();
    await expect(page.locator('.q-tree')).toContainText('Software Engineer');
    await expect(page.locator('.q-tree')).toContainText('JavaScript');
  });

  test('should load AI recommendations and accept one', async ({ page }) => {
    await page.getByRole('button', { name: 'ขอคำแนะนำใหม่' }).click({ force: true });
    await expect(page.locator('div', { hasText: 'เรียนรู้ React Hooks (Study)' }).first()).toBeVisible();

    // Accept recommendation
    await page.getByRole('button', { name: 'เพิ่มลงแผน' }).first().click({ force: true });
    await expect(page.locator('.q-notification', { hasText: 'สำเร็จ' }).last()).toBeVisible({ timeout: 10000 });
  });

  test('should submit new development plan via manual form', async ({ page }) => {
    await page.getByRole('button', { name: 'เพิ่มแผนด้วยตนเอง' }).click({ force: true });
    const dialog = page.locator('.q-dialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(1000);

    // helper for q-select
    const selectOption = async (label, optionText) => {
      const field = page.locator('.q-field', { hasText: label }).locator('.q-field__control');
      await field.scrollIntoViewIfNeeded();
      await field.click({ force: true });
      // Wait for menu
      await expect(page.locator('.q-menu, .q-dialog').last()).toBeVisible({ timeout: 10000 });
      // Use broader locator for the option
      const option = page.locator('.q-item, [role="option"]').filter({ hasText: optionText }).last();
      await option.click({ force: true });
      await page.waitForTimeout(500);
    };

    // 1. Select Career
    await selectOption('อาชีพเป้าหมาย *', 'Software Engineer');

    // 2. Select Qualification (Cascading)
    await selectOption('คุณสมบัติที่ต้องการ *', 'JavaScript');

    // 3. Select Development
    await selectOption('การพัฒนา *', 'อบรม/สัมมนา');

    // 4. Select Importance
    await selectOption('ความสำคัญ *', 'สูงมาก');

    // 5. Fill Title & Channel
    await page.getByLabel('เรื่อง *').fill('เรียนรู้ JavaScript ขั้นสูง');
    await page.getByLabel('ช่องทาง *').fill('Udemy');

    // 6. Select Date
    const startDate = page.getByLabel('วันเริ่มพัฒนา *');
    await startDate.click({ force: true });
    await startDate.fill('15/05/2026');
    await startDate.press('Enter');

    // Submit form
    const submitBtn = dialog.locator('button').filter({ hasText: /ข้อมูล|บันทึก/ }).first();
    await submitBtn.click({ force: true });

    // Confirmation dialog
    const confirmDialog = page.locator('.q-dialog').filter({ hasText: /ยืนยัน|Confirm/ }).last();
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.locator('button').filter({ hasText: /OK|ตกลง/ }).click({ force: true });

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('.q-notification', { hasText: 'สำเร็จ' }).last()).toBeVisible();
  });

  test('should edit and delete plan from tree', async ({ page }) => {
    // Wait for tree to be fully loaded and visible
    await expect(page.locator('.q-tree')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.q-tree')).toContainText('เรียนรู้ JavaScript ขั้นสูง', { timeout: 10000 });

    // Edit
    const treeNode = page.locator('.q-tree__node-header').filter({ hasText: /เรียนรู้ JavaScript ขั้นสูง/ }).first();
    await treeNode.scrollIntoViewIfNeeded();
    await expect(treeNode).toBeVisible({ timeout: 5000 });

    await treeNode.locator('button[aria-label="แก้ไขแผนนี้"]').click({ force: true });

    const dialog = page.locator('.q-dialog').filter({ hasText: /แก้ไข|ข้อมูล/ }).last();
    await expect(dialog).toBeVisible();
    await page.getByLabel('เรื่อง *').fill('Updated Title');

    const submitBtn = dialog.locator('button').filter({ hasText: /ข้อมูล|บันทึก/ }).first();
    await submitBtn.click({ force: true });

    // Confirmation dialog
    const confirmDialog = page.locator('.q-dialog').filter({ hasText: /ยืนยัน|Confirm/ }).last();
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.locator('button').filter({ hasText: /OK|ตกลง/ }).click({ force: true });

    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.q-notification', { hasText: 'สำเร็จ' }).last()).toBeVisible();

    // Delete
    await treeNode.scrollIntoViewIfNeeded();
    await treeNode.locator('button[aria-label="ลบแผนนี้"]').click({ force: true });
    const confirmDelete = page.locator('.q-dialog').filter({ hasText: /ยืนยัน|Confirm/ }).last();
    await expect(confirmDelete).toBeVisible({ timeout: 10000 });
    await confirmDelete.locator('button').filter({ hasText: /OK|ตกลง/ }).click({ force: true });
    await expect(page.locator('.q-notification', { hasText: 'สำเร็จ' }).last()).toBeVisible();
  });

  test('should delete multiple plans via bulk action in tree', async ({ page }) => {
    // 1. Check if tree is visible
    const tree = page.locator('.q-tree').last();
    await expect(tree).toBeVisible();

    // 2. Initially "Delete Selected" button should be hidden
    const bulkDeleteBtn = page.getByRole('button', { name: 'ลบแผนที่เลือก' });
    await expect(bulkDeleteBtn).toBeHidden();

    // 3. Select all items via checkbox
    const selectAllCheckbox = page.getByLabel('เลือกแผนพัฒนาทั้งหมด');
    await expect(selectAllCheckbox).toBeVisible();
    await selectAllCheckbox.click({ force: true });

    // 4. Button should be visible
    await expect(bulkDeleteBtn).toBeVisible();

    // 5. Click bulk delete
    await bulkDeleteBtn.click({ force: true });

    // 6. Confirm dialog
    const confirmDialog = page.locator('.q-dialog').filter({ hasText: /ยืนยัน|Confirm/ }).last();
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.locator('button').filter({ hasText: /OK|ตกลง/ }).click({ force: true });

    // 7. Verify notification
    await expect(page.locator('.q-notification', { hasText: 'ลบข้อมูลสำเร็จ' }).last()).toBeVisible();
  });
});
