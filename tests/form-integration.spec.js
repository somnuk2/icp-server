import { test, expect } from '@playwright/test';
import {
  fillCompleteForm,
  submitForm,
  confirmDialog,
  waitForTableUpdate,
  mockApiResponse,
  clickEditButton,
  clickDeleteButton,
  searchInTable
} from './helpers/form-helpers.js';
import {
  testIndividual,
  mockTableData,
  mockInstitutes,
  mockFaculties,
  mockDegrees,
  mockDepartments,
  mockDisabilities,
  mockProjects,
  mockAdvisors
} from './fixtures/test-data.js';

test.describe('FormComponent - Integration Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Setup common mocks
    await mockApiResponse(page, 'getInstitutes', mockInstitutes);
    await mockApiResponse(page, 'getFaculties', mockFaculties);
    await mockApiResponse(page, 'getDegrees', mockDegrees);
    await mockApiResponse(page, 'getDepartments', mockDepartments);
    await mockApiResponse(page, 'getDisabilitys', mockDisabilities);
    await mockApiResponse(page, 'getProjects', mockProjects);
    await mockApiResponse(page, 'getAdvisors', mockAdvisors);

    // Initial table load - empty or with data depending on test
    await mockApiResponse(page, 'getall', mockTableData);

    await page.goto('/FormComponent');
    await waitForTableUpdate(page);
  });

  test('should complete full add-edit-delete workflow', async ({ page }) => {
    // 1. ADD NEW RECORD
    // Mock insert response
    await mockApiResponse(page, 'insert', { success: true, message: 'บันทึกสำเร็จ' });

    // Fill form
    await fillCompleteForm(page, testIndividual);

    // Submit
    await submitForm(page);
    await confirmDialog(page);

    // Verify table update (mocking the refresh with new data)
    const newData = [
      ...mockTableData,
      { ...mockTableData[0], individual_id: 2, full_name: 'New User' }
    ];
    await mockApiResponse(page, 'getall', newData);
    await waitForTableUpdate(page);

    // 2. EDIT RECORD
    // Mock edit response
    await mockApiResponse(page, 'edit', { ...testIndividual, individual_id: 1 });
    await mockApiResponse(page, 'update', { success: true });

    // Click edit on the first row
    await clickEditButton(page, 0);
    await page.waitForTimeout(500);

    // Change some data
    await page.getByLabel('ชื่อ-สกุล').fill('Updated Name').catch(() => { }); // Note: Name might be read-only in form, using available field
    await page.getByLabel('มาจากจังหวัด').fill('Phuket');

    // Submit update
    await submitForm(page);
    await confirmDialog(page);

    // Verify table update after edit
    await mockApiResponse(page, 'getall', newData); // simplified
    await waitForTableUpdate(page);

    // 3. DELETE RECORD
    // Mock delete response
    await mockApiResponse(page, 'delete', { success: true });

    // Delete the record
    await clickDeleteButton(page, 0);
    await confirmDialog(page);

    // Verify table update after delete
    await mockApiResponse(page, 'getall', []);
    await waitForTableUpdate(page);

    // Should be empty
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(0);
  });

  test('should handle keyboard navigation correctly', async ({ page }) => {
    // Start at birthday field
    const birthdayInput = page.getByLabel('ปีเกิด ค.ศ.*');
    await birthdayInput.click();

    // Tab to next field (Telephone)
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('หมายเลขโทรศัพท์ *')).toBeFocused();

    // Fill telephone
    await page.keyboard.type('0812345678');

    // Tab to Institute (Select)
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('สถาบันการศึกษา *')).toBeFocused();
  });
});
