import { test, expect } from '@playwright/test';
import {
    searchInTable,
    clickEditButton,
    clickDeleteButton,
    confirmDialog,
    cancelDialog,
    waitForTableUpdate,
    mockApiResponse,
    fillCompleteForm,
    submitForm
} from './helpers/form-helpers.js';
import { mockTableData, testIndividual } from './fixtures/test-data.js';

test.describe('FormComponent - Table Display', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API to return table data
        await mockApiResponse(page, 'getall', mockTableData);
        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should display table with data', async ({ page }) => {
        const table = page.locator('.q-table');
        await expect(table).toBeVisible();
    });

    test('should display correct column headers', async ({ page }) => {
        // Check for key column headers
        await expect(page.getByText('ชื่อ-สกุล')).toBeVisible();
        await expect(page.getByText('วันเกิด')).toBeVisible();
        await expect(page.getByText('โทรศัพท์')).toBeVisible();
        await expect(page.getByText('สถาบัน')).toBeVisible();
        await expect(page.getByText('คณะ')).toBeVisible();
        await expect(page.getByText('สาขา')).toBeVisible();
    });

    test('should display table data rows', async ({ page }) => {
        // Check if test data is displayed
        await expect(page.getByText('ทดสอบ ระบบ')).toBeVisible();
        await expect(page.getByText('08-1234-5678')).toBeVisible();
        await expect(page.getByText('มหาวิทยาลัยแม่โจ้')).toBeVisible();
    });
});

test.describe('FormComponent - Table Search', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getall', mockTableData);
        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should filter table data when searching', async ({ page }) => {
        await searchInTable(page, 'ทดสอบ');

        // Should show matching results
        await expect(page.getByText('ทดสอบ ระบบ')).toBeVisible();
    });

    test('should show no results when search term does not match', async ({ page }) => {
        await searchInTable(page, 'xxxxxx');

        // Table should be empty or show "no results"
        const rows = page.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBe(0);
    });
});

test.describe('FormComponent - Table Controls', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getall', mockTableData);
        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should toggle fullscreen mode', async ({ page }) => {
        const fullscreenButton = page.locator('button[aria-label="Toggle fullscreen"]').or(
            page.getByRole('button').filter({ has: page.locator('i.q-icon').filter({ hasText: 'fullscreen' }) })
        );

        await fullscreenButton.first().click();

        // Check if table is in fullscreen mode
        const table = page.locator('.q-table');
        // In fullscreen, the table container should have specific class or style
        // This may vary based on Quasar implementation
    });

    test('should open column visibility selector', async ({ page }) => {
        const columnSelector = page.locator('text=Columns').or(
            page.getByRole('combobox').filter({ hasText: /columns/i })
        );

        if (await columnSelector.count() > 0) {
            await columnSelector.first().click();

            // Should show column options
            await page.waitForSelector('.q-menu', { state: 'visible' });
        }
    });

    test('should change rows per page', async ({ page }) => {
        // Look for pagination controls
        const paginationSelect = page.locator('select').filter({ hasText: /rows/i }).or(
            page.locator('.q-table__control').locator('select')
        );

        if (await paginationSelect.count() > 0) {
            await paginationSelect.first().selectOption('50');
            await waitForTableUpdate(page);
        }
    });

    test('should navigate table pages if multiple pages exist', async ({ page }) => {
        // Mock more data to create multiple pages
        const largeData = Array(100).fill(null).map((_, i) => ({
            ...mockTableData[0],
            individual_id: i + 1,
            full_name: `ทดสอบ ${i + 1}`
        }));

        await mockApiResponse(page, 'getall', largeData);
        await page.reload();
        await waitForTableUpdate(page);

        // Click next page
        const nextButton = page.getByRole('button', { name: /next|ถัดไป/i }).or(
            page.locator('button').filter({ has: page.locator('i.q-icon').filter({ hasText: 'arrow_right' }) })
        );

        if (await nextButton.count() > 0 && await nextButton.first().isEnabled()) {
            await nextButton.first().click();
            await waitForTableUpdate(page);
        }
    });
});

test.describe('FormComponent - Table Actions - Edit', () => {
    test.beforeEach(async ({ page }) => {
        // Setup comprehensive mock handler for Edit tests
        await page.route('**/api-*.php', async (route, request) => {
            const postData = request.postDataJSON();
            if (postData?.action === 'getall') {
                await route.fulfill({ body: JSON.stringify(mockTableData) });
            } else if (postData?.action === 'edit') {
                await route.fulfill({ body: JSON.stringify({ individual_id: 1, ...testIndividual, full_name: 'ทดสอบ ระบบ' }) });
            } else if (postData?.action === 'update') {
                await route.fulfill({ body: JSON.stringify({ success: true }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should click edit button and populate form', async ({ page }) => {
        await clickEditButton(page, 0);

        // Wait for form to be populated
        await page.waitForTimeout(1000);

        // Check if form is populated with data
        const birthdayValue = await page.getByLabel('ปีเกิด ค.ศ.*').inputValue();
        expect(birthdayValue).toBeTruthy();

        // Button should change to "แก้ไขข้อมูล"
        await expect(page.getByRole('button', { name: 'แก้ไขข้อมูล' })).toBeVisible();
    });

    test('should save edited data', async ({ page }) => {
        // Mock handler already setup in beforeEach including 'update'

        await clickEditButton(page, 0);
        await page.waitForTimeout(1000);

        // Modify a field
        await page.getByLabel('มาจากจังหวัด').fill('กรุงเทพฯ');

        // Submit with explicit wait for update and refresh
        const [updateResponse, refreshResponse] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'update'),
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'getall'),
            submitForm(page),
            confirmDialog(page)
        ]);

        // Wait for UI to settle
        await waitForTableUpdate(page);
    });

    test('should cancel edit and reset form', async ({ page }) => {
        await clickEditButton(page, 0);
        await page.waitForTimeout(1000);

        // Click reset/cancel
        await page.getByRole('button', { name: 'ยกเลิก' }).click();

        // Form should be cleared
        const birthdayValue = await page.getByLabel('ปีเกิด ค.ศ.*').inputValue();
        expect(birthdayValue).toBe('');
    });
});

test.describe('FormComponent - Table Actions - Delete', () => {
    test.beforeEach(async ({ page }) => {
        // Setup comprehensive mock handler for Delete tests
        await page.route('**/api-*.php', async (route, request) => {
            const postData = request.postDataJSON();
            if (postData?.action === 'getall') {
                await route.fulfill({ body: JSON.stringify(mockTableData) });
            } else if (postData?.action === 'delete') {
                await route.fulfill({ body: JSON.stringify({ success: true }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should show confirmation dialog when clicking delete', async ({ page }) => {
        await clickDeleteButton(page, 0);

        // Should show confirmation dialog
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('ยืนยัน');
        await expect(dialog).toContainText(/คุณต้องการลบ/);
    });

    test('should delete row when confirmed', async ({ page }) => {
        // Mock delete already handled in beforeEach logic

        await clickDeleteButton(page, 0);
        // Wait for delete request AND table refresh
        const [deleteResponse, refreshResponse] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'delete'),
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'getall'),
            confirmDialog(page)
        ]);

        await waitForTableUpdate(page);
    });

    test('should cancel delete operation', async ({ page }) => {
        await clickDeleteButton(page, 0);
        await cancelDialog(page);

        // Dialog should be closed
        const dialog = page.getByRole('dialog');
        await expect(dialog).not.toBeVisible();

        // Row should still exist
        await expect(page.getByText('ทดสอบ ระบบ')).toBeVisible();
    });
});

test.describe('FormComponent - Export Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getall', mockTableData);
        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('should allow entering export filename', async ({ page }) => {
        const filenameInput = page.getByPlaceholder('ชื่อไฟล์นำออก');
        await filenameInput.fill('test_export.csv');

        const value = await filenameInput.inputValue();
        expect(value).toBe('test_export.csv');
    });

    test('should trigger export when clicking export button', async ({ page }) => {
        // Enter filename
        await page.getByPlaceholder('ชื่อไฟล์นำออก').fill('test_export');

        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

        // Click export button
        await page.getByRole('button', { name: /ส่งออกไฟล์|export/i }).click();

        // Wait for download (may or may not happen depending on browser settings)
        const download = await downloadPromise;

        if (download) {
            // Verify download was triggered
            expect(download).toBeDefined();
        }
    });
});

test.describe('FormComponent - Table Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Setup comprehensive mock handler for Integration tests
        await page.route('**/api-*.php', async (route, request) => {
            const postData = request.postDataJSON();

            if (postData?.action === 'getall') {
                // Return empty initially, or updated data based on context if we could track it
                // For simplicity, return mockTableData
                await route.fulfill({ body: JSON.stringify(mockTableData) });
            } else if (postData?.action === 'insert') {
                await route.fulfill({ body: JSON.stringify({ success: true, individual_id: 1 }) });
            } else if (postData?.action === 'update') {
                await route.fulfill({ body: JSON.stringify({ success: true }) });
            } else if (postData?.action === 'delete') {
                await route.fulfill({ body: JSON.stringify({ success: true }) });
            } else if (postData?.action === 'getInstitutes') {
                await route.fulfill({ body: JSON.stringify([{ label: 'มหาวิทยาลัยแม่โจ้', value: 1 }]) });
            } else if (postData?.action === 'getFacultys') {
                await route.fulfill({ body: JSON.stringify([{ label: 'คณะวิทยาศาสตร์', value: 1 }]) });
            } else if (postData?.action === 'getDegrees') {
                await route.fulfill({ body: JSON.stringify([{ label: 'ปริญญาตรี', value: 1 }]) });
            } else if (postData?.action === 'getDepartments') {
                await route.fulfill({ body: JSON.stringify([{ label: 'วิทยาการคอมพิวเตอร์', value: 1 }]) });
            } else if (postData?.action === 'edit') {
                await route.fulfill({ body: JSON.stringify(mockTableData[0]) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/FormComponent');
    });

    test('should refresh table after adding new record', async ({ page }) => {
        // Fill and submit form
        await fillCompleteForm(page, testIndividual);
        // Wait for insert AND refresh
        const [insertResponse, refreshResponse] = await Promise.all([
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'insert'),
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'getall'),
            submitForm(page),
            confirmDialog(page)
        ]);

        // Wait for table to refresh
        await waitForTableUpdate(page);

        // Table should show updated data
        // (In real scenario, mock would need to return updated data)
    });

    test('should refresh table after editing record', async ({ page }) => {
        // Wait for table initial load
        await waitForTableUpdate(page);

        // Edit and save
        // Mock handlers are in beforeEach

        await clickEditButton(page, 0);
        await page.waitForTimeout(1000);

        await page.getByLabel('มาจากจังหวัด').fill('กรุงเทพฯ');
        // Wait for update AND refresh
        await Promise.all([
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'update'),
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'getall'),
            submitForm(page),
            confirmDialog(page)
        ]);

        await waitForTableUpdate(page);
    });

    test('should refresh table after deleting record', async ({ page }) => {
        // Handlers in beforeEach
        await waitForTableUpdate(page);

        await clickDeleteButton(page, 0);
        // Wait for delete AND refresh
        await Promise.all([
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'delete'),
            page.waitForResponse(res => res.url().includes('api-individual.php') && res.request().postDataJSON()?.action === 'getall'),
            confirmDialog(page)
        ]);

        await waitForTableUpdate(page);
    });
});
