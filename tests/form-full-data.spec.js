import { test, expect } from '@playwright/test';
import {
    fillCompleteForm,
    submitForm,
    confirmDialog,
    waitForTableUpdate,
    mockApiResponse,
    isFieldDisabled
} from './helpers/form-helpers.js';
import {
    testIndividualGraduated,
    testIndividualWithDisability,
    testIndividual, // Standard data
    mockTableData,
    mockInstitutes,
    mockFaculties,
    mockDegrees,
    mockDepartments,
    mockDisabilities,
    mockProjects,
    mockAdvisors
} from './fixtures/test-data.js';

test.describe('FormComponent - Comprehensive Data Entry', () => {
    test.beforeEach(async ({ page }) => {
        // Setup common mocks
        await mockApiResponse(page, 'getInstitutes', mockInstitutes);
        await mockApiResponse(page, 'getFaculties', mockFaculties);
        await mockApiResponse(page, 'getDegrees', mockDegrees);
        await mockApiResponse(page, 'getDepartments', mockDepartments);
        await mockApiResponse(page, 'getDisabilitys', mockDisabilities);
        await mockApiResponse(page, 'getProjects', mockProjects);
        await mockApiResponse(page, 'getAdvisors', mockAdvisors);
        await mockApiResponse(page, 'getall', mockTableData);

        await page.goto('/FormComponent');
        await waitForTableUpdate(page);
    });

    test('Scenario 1: Maximal Data Entry (Graduate + Disability)', async ({ page }) => {
        // Create maximal data set combining graduated and disability
        const maximalData = {
            ...testIndividualGraduated,
            ...testIndividualWithDisability,
            // Ensure all optional text fields are filled
            province: 'Max Province',
            preferredRegion: 'Max Region',
            favoriteSubject: 'Max Subject',
            unfavoriteSubject: 'Max Unfavorite',
            favoriteActivity: 'Max Activity',
            dreamCareer: 'Max Career',
            skill: 'Max Skill Description',
            additionalInfo: 'Max Additional Info'
        };

        console.log('Testing Maximal Data Entry with:', maximalData);

        // Mock insert response
        await mockApiResponse(page, 'insert', { success: true, message: 'บันทึกสำเร็จ' });

        // Fill form with maximal data
        await fillCompleteForm(page, maximalData);

        // Verify key fields are enabled and filled

        // 1. Graduation fields
        expect(await isFieldDisabled(page, 'ปีที่จบ ค.ศ.')).toBe(false);
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(true); // Should be disabled for graduated
        await expect(page.getByLabel('ปีที่จบ ค.ศ.')).toHaveValue(maximalData.date);

        // 2. Disability fields
        expect(await isFieldDisabled(page, 'เลือกประเภทความพิการ')).toBe(false);
        expect(await isFieldDisabled(page, 'รายละเอียด')).toBe(false);
        await expect(page.locator('text=ความพิการ:').locator('..').getByText(maximalData.disability.label)).toBeVisible();
        await expect(page.getByLabel('รายละเอียด')).toHaveValue(maximalData.dis_description);

        // 3. Optional text fields
        await expect(page.getByLabel('มาจากจังหวัด')).toHaveValue(maximalData.province);
        await expect(page.getByLabel('ความถนัด / ทักษะเด่น')).toHaveValue(maximalData.skill);

        // Submit
        await submitForm(page);
        await confirmDialog(page);

        // Verify submission (mocked)
        // In a real e2e, we might check the payload sent to server via request interception,
        // but here we trust the form submission logic tested in other suites.
    });

    test('Scenario 2: Standard Data Entry (Student + No Disability)', async ({ page }) => {
        // Use standard data (Current student, No disability)
        const standardData = testIndividual;

        console.log('Testing Standard Data Entry with:', standardData);

        // Mock insert response
        await mockApiResponse(page, 'insert', { success: true, message: 'บันทึกสำเร็จ' });

        // Fill form
        await fillCompleteForm(page, standardData);

        // Verify key fields state

        // 1. Graduation fields
        expect(await isFieldDisabled(page, 'ปีที่จบ ค.ศ.')).toBe(true); // Should be disabled for student
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(false);
        await expect(page.getByLabel('ชั้นปี')).toHaveValue(standardData.year);

        // 2. Disability fields
        expect(await isFieldDisabled(page, 'เลือกประเภทความพิการ')).toBe(true);
        expect(await isFieldDisabled(page, 'รายละเอียด')).toBe(true);

        // Submit
        await submitForm(page);
        await confirmDialog(page);
    });
});
