import { test, expect } from '@playwright/test';
import {
    mockPlanCareers,
    mockQualifications,
    mockTargets,
    mockLevels,
    mockAiRecommendations,
    mockExistingQualifications
} from './fixtures/test-data-qualification';

test.describe('FormQualification Component', () => {
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

        // 1. Plan Careers (Dropdown Options)
        await page.route('**/api-plan-career.php', async route => {
            const postData = route.request().postDataJSON();
            console.log(`[Mock API] api-plan-career.php called with action: ${postData?.action}`);
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            if (postData && postData.action === 'get_plan_career_by_member_id') {
                return route.fulfill({ json: mockPlanCareers, headers: corsHeaders });
            }
            return route.continue();
        });

        // 2. Qualifications & Groups (Dropdown Options)
        await page.route('**/api-qa-plan-career.php', async route => {
            const postData = route.request().postDataJSON();
            console.log(`[Mock API] api-qa-plan-career.php called with action: ${postData?.action}`);
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            if (!postData) return route.continue();

            if (postData.action === 'getCareerQualifiation') {
                return route.fulfill({ json: mockQualifications, headers: corsHeaders });
            }
            else if (postData.action === 'getTarget') {
                return route.fulfill({ json: mockTargets, headers: corsHeaders });
            }
            else if (postData.action === 'getLevel') {
                return route.fulfill({ json: mockLevels, headers: corsHeaders });
            }
            else if (postData.action === 'getAll') {
                console.log(`[Mock API] Fulfilling getAll with: ${JSON.stringify(mockExistingQualifications)}`);
                return route.fulfill({ json: mockExistingQualifications, headers: corsHeaders });
            }
            else if (['insert', 'update', 'delete'].includes(postData.action)) {
                return route.fulfill({ json: { message: "Success" }, headers: corsHeaders });
            }
            return route.continue();
        });

        // 3. Qualification Master (Insert/Update)
        await page.route('**/api-qualification.php', async route => {
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            const postData = route.request().postDataJSON();
            console.log(`[Mock API] api-qualification.php called with action: ${postData?.action}`);
            return route.fulfill({ json: { message: "Success" }, headers: corsHeaders });
        });

        // 4. Qualification Groups & General Individual Data
        await page.route('**/api-individual.php', async route => {
            const url = route.request().url();
            const postData = route.request().postDataJSON();
            console.log(`[Mock API] api-individual.php called | URL: ${url} | Action: ${postData?.action}`);

            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }

            if (url.includes('Qualification_group')) {
                if (postData && postData.action === 'getall') {
                    return route.fulfill({
                        json: [{ qualification_group_id: '99', qualification_group_name: 'Technical Skills' }],
                        headers: corsHeaders
                    });
                }
                return route.fulfill({ json: { message: "Success", qualification_group_id: '100' }, headers: corsHeaders });
            }

            if (postData && postData.action === 'getall') {
                return route.fulfill({
                    json: [{ member_id: '123', name: 'Test User' }],
                    headers: corsHeaders
                });
            }
            return route.continue();
        });

        // 5. Notification API
        await page.route('**/api-notification.php', route => {
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            return route.fulfill({ json: { message: "No notifications" }, headers: corsHeaders });
        });

        // 6. Member API (For Login)
        await page.route('**/api-member.php', async route => {
            const postData = route.request().postDataJSON();
            console.log(`[Mock API] api-member.php called | Action: ${postData?.action}`);
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            return route.fulfill({
                json: [{ member_id: '123', full_name: 'Test User', status: 'user' }],
                headers: corsHeaders
            });
        });

        // 7. AI Chat API
        await page.route('**/api/chat', async route => {
            console.log(`[Mock API] /api/chat called`);
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 200, headers: corsHeaders });
            }
            return route.fulfill({ json: mockAiRecommendations, headers: corsHeaders });
        });

        // --- PERFORM LOGIN ---
        await page.goto('./LoginPage');
        await page.waitForLoadState('domcontentloaded');

        await page.fill('input[type="email"]', 'somnuk.sin@gmail.com');
        await page.fill('input[type="password"]', '123456');

        // Use standard click with force for better event compatibility
        await page.getByRole('button', { name: 'เข้าระบบ' }).click({ force: true, delay: 100 });

        try {
            await page.waitForURL('**/icp-project-app/', { timeout: 20000 });
        } catch (e) {
            console.log(`[Navigation Warning] URL wait failed, currently at: ${page.url()}`);
        }

        // Navigate to FormQualification using history.pushState to maintain Vuex store
        await page.evaluate(() => {
            window.history.pushState({}, '', '/icp-project-app/FormQualification');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        // Kill animations and transitions to stabilize UI
        await page.addStyleTag({
            content: `
            *, *::before, *::after {
                transition: none !important;
                transition-duration: 0s !important;
                animation: none !important;
                animation-duration: 0s !important;
            }
            .q-btn { visibility: visible !important; opacity: 1 !important; }
        ` });

        // Wait for FormQualification content
        await expect(page.locator('h4:has-text("คุณสมบัติ/ทักษะ")')).toBeVisible({ timeout: 20000 });
        await page.waitForSelector('.q-tree', { state: 'visible', timeout: 10000 });
        await page.waitForTimeout(1000); // Wait for tree to settle
    });

    test('should display initial elements and AI section', async ({ page }) => {
        await expect(page.locator('div:has-text("AI แนะนำคุณสมบัติ")').first()).toBeVisible();
        await expect(page.locator('.q-tree')).toBeVisible();
        await expect(page.locator('.q-tree')).toContainText('Software Engineer');
        await expect(page.locator('.q-tree')).toContainText('JavaScript');
    });

    test('should load and display AI recommendations', async ({ page }) => {
        await page.getByRole('button', { name: 'ขอคำแนะนำใหม่' }).click({ force: true });
        await expect(page.locator('div.q-item__section', { hasText: 'Software Engineer' }).first()).toBeVisible();
        await expect(page.locator('div.q-item__section', { hasText: 'Technical Skills' }).first()).toBeVisible();
        await expect(page.locator('div', { hasText: 'React.js' }).first()).toBeVisible();
    });

    test('should open manual form dialog and submit new qualification', async ({ page }) => {
        await page.getByRole('button', { name: 'เพิ่มคุณสมบัติด้วยตนเอง' }).click({ force: true });
        const dialog = page.locator('.q-dialog');
        await expect(dialog).toBeVisible();
        await page.waitForTimeout(1000); // Wait for dialog animation

        // 1. Select Plan Career
        const careerSelect = page.locator('.q-field', { hasText: 'อาชีพเป้าหมาย *' }).locator('.q-field__control');
        await careerSelect.scrollIntoViewIfNeeded();
        await careerSelect.click({ force: true, delay: 100 });
        await page.waitForSelector('.q-menu', { state: 'visible', timeout: 10000 });
        await page.getByRole('option', { name: 'Software Engineer' }).click({ force: true });

        // 2. Select Qualification (New Input)
        const qualInput = page.getByLabel('คุณสมบัติที่ต้องการ *');
        await qualInput.fill('New Skill');
        await qualInput.press('Enter');

        // Confirm new qualification dialog
        const confirmDialog = page.locator('.q-dialog', { hasText: 'ยืนยันการเพิ่มคุณสมบัติใหม่' });
        if (await confirmDialog.isVisible({ timeout: 3000 })) {
            await confirmDialog.getByRole('button', { name: /OK|ตกลง/ }).click({ force: true });
            await page.waitForTimeout(500);
        }

        // 3. Select Target
        const targetSelect = page.locator('.q-field', { hasText: 'ค่าเป้าหมาย *' }).locator('.q-field__control');
        await targetSelect.scrollIntoViewIfNeeded();
        await targetSelect.click({ force: true, delay: 100 });
        await page.waitForSelector('.q-menu', { state: 'visible', timeout: 10000 });
        await page.getByRole('option', { name: 'Level 1' }).first().click({ force: true });

        // 4. Select Level
        const levelSelect = page.locator('.q-field', { hasText: 'ระดับความสำคัญ *' }).locator('.q-field__control');
        await levelSelect.scrollIntoViewIfNeeded();
        await levelSelect.click({ force: true, delay: 100 });
        await page.waitForSelector('.q-menu', { state: 'visible', timeout: 10000 });
        await page.getByRole('option', { name: 'High' }).first().click({ force: true });

        // Submit
        await page.getByRole('button', { name: /บันทึก|เพิ่มข้อมูล/ }).click({ force: true });
        await expect(dialog).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('.q-notification')).toContainText(/Success|สำเร็จ/, { timeout: 10000 });
    });

    test('should edit existing qualification from tree', async ({ page }) => {
        const treeNode = page.locator('.q-tree__node-header', { hasText: 'JavaScript' });
        const editBtn = treeNode.locator('button[aria-label="แก้ไขข้อมูลนี้"]');
        await editBtn.scrollIntoViewIfNeeded();
        await editBtn.click({ force: true, delay: 100 });

        const dialog = page.locator('.q-dialog');
        await expect(dialog).toBeVisible();
        await page.waitForTimeout(1000);

        // Change Level
        const levelSelect = page.locator('.q-field', { hasText: 'ระดับความสำคัญ *' }).locator('.q-field__control');
        await levelSelect.scrollIntoViewIfNeeded();
        await levelSelect.click({ force: true, delay: 100 });
        await page.waitForSelector('.q-menu', { state: 'visible', timeout: 10000 });
        await page.getByRole('option', { name: 'Medium' }).first().click({ force: true });

        // Save
        await page.getByRole('button', { name: /บันทึก|แก้ไขข้อมูล/ }).click({ force: true });
        await expect(dialog).not.toBeVisible({ timeout: 10000 });
        await expect(page.locator('.q-notification')).toContainText(/Success|สำเร็จ/, { timeout: 10000 });
    });

    test('should delete qualification from tree', async ({ page }) => {
        const treeNode = page.locator('.q-tree__node-header', { hasText: 'JavaScript' });
        const deleteBtn = treeNode.locator('button[aria-label="ลบข้อมูลนี้"]');
        await deleteBtn.scrollIntoViewIfNeeded();
        await deleteBtn.click({ force: true, delay: 100 });

        await expect(page.locator('.q-dialog__title:has-text("ยืนยันการลบ")')).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: /OK|ตกลง/ }).click({ force: true });

        await expect(page.locator('.q-notification')).toContainText(/Success|สำเร็จ/, { timeout: 10000 });
    });
});
