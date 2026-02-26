import { test, expect } from '@playwright/test';
import { mockCareerOptions, mockAiRecommendations, mockPlanCareers, mockIndividualData } from './fixtures/test-data-career';
import { mockApiResponse } from './helpers/form-helpers';

test.describe('FormPlanCareer Component', () => {
    test.beforeEach(async ({ page }) => {
        // Debug: Print console logs
        page.on('console', msg => console.log(`[Browser Console] ${msg.text()} `));
        page.on('pageerror', err => console.log(`[Browser Error] ${err.message} `));

        // Helper for CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        };

        // Mock API Routes
        await page.route('**/api-career.php', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 200, headers: corsHeaders });
                return;
            }

            const request = route.request();
            const postData = request.postDataJSON();
            if (postData && postData.action === 'getall') {
                await route.fulfill({ json: mockCareerOptions, headers: corsHeaders });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api-plan-career.php', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 200, headers: corsHeaders });
                return;
            }

            const request = route.request();
            const postData = request.postDataJSON();

            if (postData && postData.action === 'getAll') {
                await route.fulfill({ json: mockPlanCareers, headers: corsHeaders });
            } else if (postData && postData.action === 'insert') {
                await route.fulfill({ json: { message: "Insert Complete" }, headers: corsHeaders });
            } else if (postData && postData.action === 'update') {
                await route.fulfill({ json: { message: "Update Complete" }, headers: corsHeaders });
            } else if (postData && postData.action === 'delete') {
                await route.fulfill({ json: { message: "Delete Complete" }, headers: corsHeaders });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api-individual.php', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 200, headers: corsHeaders });
                return;
            }
            const request = route.request();
            const postData = request.postDataJSON();
            if (postData && postData.action === 'getall') {
                await route.fulfill({ json: [mockIndividualData], headers: corsHeaders });
            } else {
                await route.continue();
            }
        });

        // Mock AI Chat API
        await page.route('**/api/chat', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 200, headers: corsHeaders });
                return;
            }
            await route.fulfill({ json: { recommendations: mockAiRecommendations }, headers: corsHeaders });
        });

        // Mock Master Career API (for new careers)
        await page.route('**/api-master-career.php', async route => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 200, headers: corsHeaders });
                return;
            }
            await route.fulfill({ json: [], headers: corsHeaders });
        });

        // Navigate directly
        await page.goto('/#/FormPlanCareer');
        // networkidle is unstable with polling
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display initial elements and AI section', async ({ page }) => {
        await expect(page.locator('h4:has-text("อาชีพเป้าหมาย")')).toBeVisible();
        await expect(page.locator('div:has-text("AI แนะนำอาชีพ")').first()).toBeVisible();

        // Check Tree View
        await expect(page.locator('.q-tree')).toBeVisible();
        await expect(page.locator('.q-tree')).toContainText('Software Engineer');
    });

    test('should open manual form dialog and submit new career', async ({ page }) => {
        await page.getByRole('button', { name: 'เพิ่มอาชีพด้วยตนเอง' }).click();
        await expect(page.locator('.q-dialog')).toBeVisible();
        await expect(page.locator('.q-dialog')).toContainText('เพิ่ม/แก้ไข อาชีพเป้าหมาย');

        // Select Career
        await page.getByLabel('อาชีพเป้าหมาย *').click();
        await page.getByRole('option', { name: 'Doctor' }).click();

        // Select Date (Direct Input)
        await page.getByLabel('วันเริ่มแผน').fill('01/01/2026');

        // Submit
        const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-plan-career.php') && res.request().postDataJSON().action === 'insert'),
            page.getByRole('button', { name: 'เพิ่มข้อมูล' }).click()
        ]);

        expect(response.status()).toBe(200);
        // Verify toast or dialog close
        await expect(page.locator('.q-dialog')).not.toBeVisible();
    });

    test('should edit existing career from tree', async ({ page }) => {
        // Locate the edit button for the mocked career (Software Engineer)
        // Tree node structure: .q-tree__node-header-content contains text
        // Button is in the same header
        const treeNode = page.locator('.q-tree__node-header').filter({ hasText: 'Software Engineer' });
        await treeNode.getByRole('button', { name: 'แก้ไขอาชีพนี้' }).click();

        await expect(page.locator('.q-dialog')).toBeVisible();
        // Assuming edit reuses the same dialog? No, code shows `editUser` opens `showManualFormDialog`
        // with isEdit = true.
        await expect(page.locator('div:has-text("เพิ่ม/แก้ไข อาชีพเป้าหมาย")').last()).toBeVisible(); // Check title

        // Change date
        await page.getByLabel('วันเริ่มแผน').fill('02/02/2026');

        // Save
        const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-plan-career.php') && res.request().postDataJSON().action === 'update'),
            page.getByRole('button', { name: 'แก้ไขข้อมูล' }).click()
        ]);
        expect(response.status()).toBe(200);
    });

    test('should delete career from tree', async ({ page }) => {
        const treeNode = page.locator('.q-tree__node-header').filter({ hasText: 'Software Engineer' });

        // Click delete button on the node
        await treeNode.getByRole('button', { name: 'ลบอาชีพนี้' }).click();

        // Wait for Quasar Dialog
        const dialog = page.locator('.q-dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('ยืนยันการลบ');

        // Confirm
        const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-plan-career.php') && res.request().postDataJSON().action === 'delete'),
            page.getByRole('button', { name: 'OK' }).click()
        ]);
        expect(response.status()).toBe(200);
    });
});
