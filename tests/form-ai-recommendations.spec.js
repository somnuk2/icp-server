import { test, expect } from '@playwright/test';
import {
  fillTextInput,
  selectOption,
  selectOptionWithSearch,
  submitForm,
  waitForTableUpdate
} from './helpers/form-helpers.js';

/**
 * AI Recommendation Tests for ICP Forms
 * Tests AI functionality on all 4 forms with AI features
 */

// ==========================================
// AI Mock Helpers
// ==========================================

/**
 * Setup AI response mocking for tests
 */
async function setupAiMocking(page, mockResponses = {}) {
  // Intercept /api/chat requests
  await page.route('**/api/chat', route => {
    const requestBody = route.request.postDataJSON();
    const userMsg = requestBody.messages?.find(m => m.role === 'user')?.content || '';

    let mockReply = '[]';

    // Career recommendations
    if (mockResponses.career || userMsg.includes('career') || userMsg.includes('อาชีพ')) {
      mockReply = JSON.stringify([
        {
          career_id: 1,
          career_name: 'Software Developer',
          ca_group_name: 'IT',
          score: 85,
          reason: 'ตรงกับความถนัดและทักษะด้านเทคโนโลยี'
        },
        {
          career_id: 2,
          career_name: 'Data Analyst',
          ca_group_name: 'IT',
          score: 78,
          reason: 'มีความสามารถในการวิเคราะห์ข้อมูล'
        }
      ]);
    }
    // Qualification recommendations
    else if (mockResponses.qualification || userMsg.includes('qualification') || userMsg.includes('คุณสมบัติ')) {
      mockReply = JSON.stringify([
        {
          qualification_id: 1,
          qualification_name: 'Python Programming',
          qualification_group_name: 'Technical Skills',
          related_career_name: 'Software Developer',
          level_description: 'ต้องการพัฒนา',
          reason: 'ทักษะหลักสำหรับ Backend Developer'
        },
        {
          qualification_id: 2,
          qualification_name: 'Web Development',
          qualification_group_name: 'Technical Skills',
          related_career_name: 'Software Developer',
          level_description: 'เข้มแข็ง',
          reason: 'สำคัญสำหรับการพัฒนาเว็บแอปพลิเคชัน'
        }
      ]);
    }
    // Development plan recommendations
    else if (mockResponses.plan || userMsg.includes('plan') || userMsg.includes('แผน')) {
      mockReply = JSON.stringify([
        {
          plan_title: 'Master Python Fundamentals',
          plan_channel: 'Online Course - Udemy',
          development_name: 'การศึกษาเพิ่มเติม',
          importance_name: 'สำคัญมาก',
          reason: 'พื้นฐานที่จำเป็นสำหรับ Backend Development',
          related_career_name: 'Software Developer',
          qualification_name: 'Python Programming'
        },
        {
          plan_title: 'Web Framework Deep Dive',
          plan_channel: 'Bootcamp - Online',
          development_name: 'การฝึกอบรม',
          importance_name: 'สำคัญ',
          reason: 'เพิ่มทักษะในการใช้งาน Web Framework',
          related_career_name: 'Software Developer',
          qualification_name: 'Web Development'
        }
      ]);
    }
    // Self assessment recommendations
    else if (mockResponses.assessment || userMsg.includes('assessment') || userMsg.includes('ประเมิน')) {
      mockReply = JSON.stringify([
        {
          plan_title: 'Master Python Fundamentals',
          perform_name: 'ดี',
          reason: 'ผ่านการทดสอบและโปรเจกต์',
          suggested_evidences: [
            'ผ่านการสอบ Python Certification',
            'เสร็จสิ้นโปรเจกต์ CLI Application',
            'Contributed to open source projects'
          ],
          related_career_name: 'Software Developer',
          qualification_name: 'Python Programming'
        }
      ]);
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: mockReply })
    });
  });
}

/**
 * Disable AI mocking (use real backend)
 */
async function disableAiMocking(page) {
  // Continue route without mocking
  await page.route('**/api/chat', route => route.continue());
}

// ==========================================
// Test Suite: AI Recommendations
// ==========================================

test.describe('AI Recommendations - All Forms', () => {
  // Common setup
  const TEST_USER = {
    username: 'testuser',
    password: 'password123'
  };

  async function loginUser(page) {
    await page.goto('/');
    await fillTextInput(page, 'Username', TEST_USER.username);
    await fillTextInput(page, 'Password', TEST_USER.password);
    await page.getByRole('button', { name: /Login|Sign In|เข้าสู่ระบบ/ }).click();
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  }

  // ==========================================
  // Test Suite 1: FormPlanCareer AI
  // ==========================================
  test.describe('FormPlanCareer - AI Career Recommendations', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
      await page.goto('/FormPlanCareer');
      await page.waitForSelector('[data-testid="form-plan-career"], [class*="plan-career"]', { timeout: 10000 });
      await setupAiMocking(page, { career: true });
    });

    test('1.1 - Should show loading state when AI button clicked', async ({ page }) => {
      // Find and click AI recommend button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|AI|recommend|แนะนำ/i }).first();

      // Check button becomes disabled/loading
      await aiButton.click();

      // Look for loading spinner
      const spinner = page.locator('.q-spinner, .q-circular-progress, text=กำลังวิเคราะห์');
      await expect(spinner).toBeVisible({ timeout: 5000 });
    });

    test('1.2 - Should display AI recommendations', async ({ page }) => {
      // Click AI recommend button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      // Wait for recommendations to appear
      await page.waitForTimeout(2000);

      // Verify recommendations list visible
      const recList = page.locator('text=Software Developer, text=Data Analyst');
      await expect(recList).toBeVisible({ timeout: 10000 });
    });

    test('1.3 - Should add career from AI recommendation', async ({ page }) => {
      // Click AI button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      // Wait for recommendations
      await page.waitForTimeout(2000);

      // Click add button on first recommendation
      const addButton = page.locator('button:has-text("บันทึก|Add|เพิ่ม")').first();
      await addButton.click();

      // Verify success
      await expect(page.locator('text="บันทึกสำเร็จ|Success"')).toBeVisible({ timeout: 5000 });
    });

    test('1.4 - Should handle AI errors gracefully', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/chat', route => {
        route.abort('failed');
      });

      // Click AI button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      // Wait for error message
      await page.waitForTimeout(2000);

      // Verify error message or empty state
      const errorMsg = page.locator('text=error|ข้อผิดพลาด|ไม่สามารถ|ไม่พบคำแนะนำ');
      await expect(errorMsg).toBeVisible({ timeout: 10000 });
    });

    test('1.5 - Should not double-trigger AI requests', async ({ page }) => {
      let requestCount = 0;

      // Track API calls
      await page.on('request', request => {
        if (request.url().includes('/api/chat')) {
          requestCount++;
        }
      });

      // Click AI button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      // Try to click again immediately
      await aiButton.click();

      // Should only make 1 request due to loading state
      await page.waitForTimeout(2000);
      expect(requestCount).toBeLessThanOrEqual(1);
    });
  });

  // ==========================================
  // Test Suite 2: FormQualification AI
  // ==========================================
  test.describe('FormQualification - AI Skill Recommendations', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);

      // Setup career plan first
      await page.goto('/FormPlanCareer');
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        const addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
        }
      }

      // Navigate to FormQualification
      await page.goto('/FormQualification');
      await page.waitForSelector('[data-testid="form-qualification"], [class*="qualification"]', { timeout: 10000 });
      await setupAiMocking(page, { qualification: true });
    });

    test('2.1 - Should show loading state for qualification AI', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      const spinner = page.locator('.q-spinner, .q-circular-progress, text=กำลังวิเคราะห์');
      await expect(spinner).toBeVisible({ timeout: 5000 });
    });

    test('2.2 - Should display skill recommendations grouped by career', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Verify grouped display
      const careerGroup = page.locator('text=Software Developer');
      const skillItem = page.locator('text=Python Programming');
      await expect(careerGroup).toBeVisible({ timeout: 10000 });
      await expect(skillItem).toBeVisible();
    });

    test('2.3 - Should add skill from AI recommendation', async ({ page }) => {
      // Select a plan career first
      const planCareerSelect = page.locator('select, [role="combobox"]').first();
      if (await planCareerSelect.isVisible()) {
        await planCareerSelect.click();
      }

      // Click AI button
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Find and click add button
      const addButton = page.locator('button:has-text("บันทึก|Add|เพิ่ม")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
      }
    });

    test('2.4 - Should allow editing AI recommendation before adding', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Look for edit icon on recommendation
      const editIcon = page.locator('[data-testid="edit-recommendation"], .edit, [name*="edit"]').first();
      if (await editIcon.isVisible()) {
        await editIcon.click();

        // Verify form opens for editing
        const editForm = page.locator('input, textarea').first();
        await expect(editForm).toBeFocused({ timeout: 5000 });
      }
    });
  });

  // ==========================================
  // Test Suite 3: FormPlan AI
  // ==========================================
  test.describe('FormPlan - AI Development Plan Recommendations', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);

      // Setup career and qualification first
      await page.goto('/FormPlanCareer');
      let aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        let addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) await addBtn.click();
        await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
      }

      await page.goto('/FormQualification');
      aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        let addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) await addBtn.click();
        await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
      }

      // Navigate to FormPlan
      await page.goto('/FormPlan');
      await page.waitForSelector('[data-testid="form-plan"], [class*="plan"]', { timeout: 10000 });
      await setupAiMocking(page, { plan: true });
    });

    test('3.1 - Should display development plan recommendations', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Verify plans displayed
      const planItem = page.locator('text=Master Python Fundamentals');
      await expect(planItem).toBeVisible({ timeout: 10000 });
    });

    test('3.2 - Should show plan details (title, channel, importance)', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Verify details visible
      const title = page.locator('text=Master Python Fundamentals');
      const channel = page.locator('text=Udemy');
      const importance = page.locator('text=สำคัญมาก');

      await expect(title).toBeVisible({ timeout: 10000 });
      await expect(channel).toBeVisible();
      await expect(importance).toBeVisible();
    });

    test('3.3 - Should add plan from AI recommendation', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      const addButton = page.locator('button:has-text("บันทึก|Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
      }
    });

    test('3.4 - Should handle recommendation with missing fields', async ({ page }) => {
      // Override mock to return incomplete data
      await page.route('**/api/chat', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reply: JSON.stringify([
              {
                plan_title: 'Incomplete Plan'
                // Missing other fields
              }
            ])
          })
        });
      });

      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Should display with default values or skip
      const incompleteItem = page.locator('text=Incomplete Plan');
      const notFound = page.locator('text=ไม่พบคำแนะนำ');

      const visible = await incompleteItem.isVisible().catch(() => false);
      const notFoundVisible = await notFound.isVisible().catch(() => false);

      expect(visible || notFoundVisible).toBeTruthy();
    });
  });

  // ==========================================
  // Test Suite 4: FormSelfAssessment AI
  // ==========================================
  test.describe('FormSelfAssessment - AI Assessment Recommendations', () => {
    test.beforeEach(async ({ page }) => {
      await loginUser(page);

      // Setup complete chain: Career → Qualification → Plan
      await page.goto('/FormPlanCareer');
      let aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        let addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) await addBtn.click();
      }

      await page.goto('/FormQualification');
      aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        let addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) await addBtn.click();
      }

      await page.goto('/FormPlan');
      aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      if (await aiButton.isVisible()) {
        await aiButton.click();
        await page.waitForTimeout(1500);
        let addBtn = page.locator('button:has-text("บันทึก|Add")').first();
        if (await addBtn.isVisible()) await addBtn.click();
      }

      // Navigate to FormSelfAssessment
      await page.goto('/FormSelfAssessment');
      await page.waitForSelector('[data-testid="form-self-assessment"], [class*="assessment"]', { timeout: 10000 });
      await setupAiMocking(page, { assessment: true });
    });

    test('4.1 - Should display self-assessment recommendations', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Verify assessments displayed
      const assessItem = page.locator('text=ดี');
      await expect(assessItem).toBeVisible({ timeout: 10000 });
    });

    test('4.2 - Should show suggested evidence for assessment', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Verify evidence suggestions visible
      const evidence = page.locator('text=Certification, text=open source');
      await expect(evidence).toBeVisible({ timeout: 10000 });
    });

    test('4.3 - Should add assessment from AI recommendation', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      const addButton = page.locator('button:has-text("บันทึก|Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.locator('text="บันทึกสำเร็จ"')).toBeVisible({ timeout: 5000 });
      }
    });

    test('4.4 - Should allow editing assessment before adding', async ({ page }) => {
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      await page.waitForTimeout(2000);

      // Look for edit option
      const editIcon = page.locator('[data-testid="edit-recommendation"], [class*="edit"]').first();
      if (await editIcon.isVisible()) {
        await editIcon.click();

        // Verify can modify values
        const input = page.locator('input, textarea').first();
        await expect(input).toBeFocused({ timeout: 5000 });
      }
    });
  });

  // ==========================================
  // Performance & Load Tests
  // ==========================================
  test.describe('AI Performance & Load Tests', () => {
    test('5.1 - AI should respond within 10 seconds', async ({ page }) => {
      await loginUser(page);
      await page.goto('/FormPlanCareer');
      await setupAiMocking(page, { career: true });

      const startTime = Date.now();
      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();
      await aiButton.click();

      // Wait for results
      const results = page.locator('text=Software Developer, text=Data Analyst');
      await expect(results).toBeVisible({ timeout: 10000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000);
    });

    test('5.2 - Should handle rapid AI requests gracefully', async ({ page }) => {
      await loginUser(page);
      await page.goto('/FormQualification');
      await setupAiMocking(page, { qualification: true });

      const aiButton = page.getByRole('button', { name: /ขอคำแนะนำ|แนะนำ/i }).first();

      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        if (await aiButton.isEnabled()) {
          await aiButton.click();
        }
        await page.waitForTimeout(100);
      }

      // Should still function without errors
      const results = page.locator('text=Python Programming');
      await expect(results).toBeVisible({ timeout: 10000 });
    });
  });
});
