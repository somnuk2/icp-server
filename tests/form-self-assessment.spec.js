import { test, expect } from '@playwright/test';

test.describe('FormSelfAssessment Bulk Delete Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Helper for CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    };

    // --- Mock API Routes ---

    // 1. Self Assessment API
    await page.route('**/api-self-assessment.php', async route => {
      const postData = route.request().postDataJSON();
      if (!postData) return route.continue();

      // Mock data for tree
      const mockAssessments = [
        {
          self_assessment_id: 1,
          self_assessment_date: '2026/01/01',
          qa_plan_career_id: 101,
          perform_id: 1,
          perform_value: 'ดีมาก',
          career_name: 'Software Engineer',
          qualification_name: 'JavaScript'
        }
      ];

      const mockReferences = [
        { reference_id: 201, self_assessment_id: 1, reference_description: 'หลักฐานการเรียน', plan_id: 501 }
      ];

      if (postData.action === 'getAll') {
        return route.fulfill({ json: mockAssessments, headers: corsHeaders });
      }
      else if (postData.action === 'getAllReference') {
        return route.fulfill({ json: mockReferences, headers: corsHeaders });
      }
      else if (postData.action === 'getPerform') {
        return route.fulfill({ json: [{ perform_id: 1, perform_name: 'ดีมาก' }], headers: corsHeaders });
      }
      else if (postData.action === 'deleteBulk') {
        return route.fulfill({ json: { message: "Success" }, headers: corsHeaders });
      }
      return route.fulfill({ json: [], headers: corsHeaders });
    });

    // 2. Careers
    await page.route('**/api-plan-career.php', async route => {
      return route.fulfill({ json: [{ career_name: 'Software Engineer', plan_career_id: 1 }], headers: corsHeaders });
    });

    // 3. Qualifications
    await page.route('**/api-qa-plan-career.php', async route => {
      const postData = route.request().postDataJSON();
      if (postData?.action === 'get_qa_plan_career_by_plan_career_id') {
        return route.fulfill({ json: [{ qualification_name: 'JavaScript', qa_plan_career_id: 101, plan_career_id: 1 }], headers: corsHeaders });
      }
      return route.fulfill({ json: [], headers: corsHeaders });
    });

    // 4. Plans
    await page.route('**/api-plan.php', async route => {
      const postData = route.request().postDataJSON();
      if (postData?.action === 'getall') {
        return route.fulfill({ json: [{ plan_id: 501, plan_title: 'Udemy Course', qa_plan_career_id: 101 }], headers: corsHeaders });
      }
      return route.fulfill({ json: [], headers: corsHeaders });
    });

    // Navigate
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('member_id', '123');
      window.history.pushState({}, '', '/icp-project-app/#/FormSelfAssessment');
    });
    await page.reload();
    await page.waitForURL('**/FormSelfAssessment');
    await page.waitForLoadState('networkidle');
  });

  test('should verify tree checkbox visibility and bulk delete', async ({ page }) => {
    // 1. Wait for tree
    const tree = page.locator('.q-tree');
    await expect(tree).toBeVisible({ timeout: 10000 });

    // 2. Verify "Select All" exists
    const selectAll = page.locator('.q-checkbox').first();
    await expect(selectAll).toBeVisible();

    // 3. Verify specific nodes have checkboxes
    // Career node
    const careerCheckbox = page.locator('.q-tree__node-header', { hasText: 'Software Engineer' }).locator('.q-checkbox');
    await expect(careerCheckbox).toBeVisible();

    // Assessment Result node
    const resultCheckbox = page.locator('.q-tree__node-header', { hasText: 'ผลการประเมิน: ดีมาก' }).locator('.q-checkbox');
    await expect(resultCheckbox).toBeVisible();

    // Importance node (Hidden)
    const importanceNode = page.locator('.q-tree__node-header', { hasText: /ความสำคัญ/ });
    await expect(importanceNode.locator('.q-checkbox')).toBeHidden();

    // 4. Test Bulk Delete Button Visibility
    const deleteBtn = page.getByRole('button', { name: 'ลบรายการที่เลือก' });
    await expect(deleteBtn).toBeHidden();

    // Select the career checkbox (should cascade to assessment result)
    await careerCheckbox.click({ force: true });
    await expect(deleteBtn).toBeVisible();

    // 5. Execute Bulk Delete
    await deleteBtn.click({ force: true });

    // Confirm dialog
    const confirmDialog = page.locator('.q-dialog').filter({ hasText: /ยืนยัน|ลบ/ }).last();
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.locator('button').filter({ hasText: /OK|ตกลง/ }).click({ force: true });

    // Verify notification
    await expect(page.locator('.q-notification', { hasText: 'ลบสำเร็จ' }).last()).toBeVisible();
  });
});
