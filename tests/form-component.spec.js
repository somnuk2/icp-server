import { test, expect } from '@playwright/test';
import {
    fillTextInput,
    selectOption,
    selectOptionWithSearch,
    checkCheckbox,
    uncheckCheckbox,
    clearSelect,
    submitForm,
    resetForm,
    confirmDialog,
    fillCompleteForm,
    isFieldDisabled,
    mockApiResponse
} from './helpers/form-helpers.js';
import {
    testIndividual,
    testIndividualGraduated,
    testIndividualWithDisability,
    mockInstitutes,
    mockFaculties,
    mockDegrees,
    mockDepartments,
    mockDisabilities,
    mockProjects,
    mockAdvisors
} from './fixtures/test-data.js';

test.describe('FormComponent - Text Inputs', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/FormComponent');
    });

    test('should fill birthday input with mask ####', async ({ page }) => {
        await fillTextInput(page, 'ปีเกิด ค.ศ.*', '1995');
        const value = await page.getByLabel('ปีเกิด ค.ศ.*').inputValue();
        expect(value).toBe('1995');
    });

    test('should fill telephone input with mask ##-####-####', async ({ page }) => {
        await fillTextInput(page, 'หมายเลขโทรศัพท์ *', '0812345678');
        const value = await page.getByLabel('หมายเลขโทรศัพท์ *').inputValue();
        expect(value).toContain('08-1234-5678');
    });

    test('should clear birthday input when clicking clear button', async ({ page }) => {
        await fillTextInput(page, 'ปีเกิด ค.ศ.*', '1995');
        await page.getByLabel('ปีเกิด ค.ศ.*').locator('..').getByRole('button', { name: /clear/i }).click();
        const value = await page.getByLabel('ปีเกิด ค.ศ.*').inputValue();
        expect(value).toBe('');
    });

    test('should fill province input', async ({ page }) => {
        await fillTextInput(page, 'มาจากจังหวัด', 'เชียงใหม่');
        const value = await page.getByLabel('มาจากจังหวัด').inputValue();
        expect(value).toBe('เชียงใหม่');
    });

    test('should fill preferredRegion input', async ({ page }) => {
        await fillTextInput(page, 'อยากอยู่ในจังหวัด', 'กรุงเทพฯ');
        const value = await page.getByLabel('อยากอยู่ในจังหวัด').inputValue();
        expect(value).toBe('กรุงเทพฯ');
    });

    test('should fill favoriteSubject input', async ({ page }) => {
        await fillTextInput(page, 'วิชาที่ชอบ', 'คณิตศาสตร์');
        const value = await page.getByLabel('วิชาที่ชอบ').inputValue();
        expect(value).toBe('คณิตศาสตร์');
    });

    test('should fill unfavoriteSubject input', async ({ page }) => {
        await fillTextInput(page, 'วิชาที่ไม่ชอบ', 'ภาษาอังกฤษ');
        const value = await page.getByLabel('วิชาที่ไม่ชอบ').inputValue();
        expect(value).toBe('ภาษาอังกฤษ');
    });

    test('should fill favoriteActivity input', async ({ page }) => {
        await fillTextInput(page, 'กิจกรรมที่ชอบทำ', 'เขียนโปรแกรม');
        const value = await page.getByLabel('กิจกรรมที่ชอบทำ').inputValue();
        expect(value).toBe('เขียนโปรแกรม');
    });

    test('should fill dreamCareer input', async ({ page }) => {
        await fillTextInput(page, 'อาชีพในฝัน', 'นักพัฒนาซอฟต์แวร์');
        const value = await page.getByLabel('อาชีพในฝัน').inputValue();
        expect(value).toBe('นักพัฒนาซอฟต์แวร์');
    });
});

test.describe('FormComponent - Textarea Inputs', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/FormComponent');
    });

    test('should fill skill textarea', async ({ page }) => {
        const skillText = 'การเขียนโปรแกรม\nการแก้ปัญหา\nการทำงานเป็นทีม';
        await fillTextInput(page, 'ความถนัด / ทักษะเด่น', skillText);
        const value = await page.getByLabel('ความถนัด / ทักษะเด่น').inputValue();
        expect(value).toBe(skillText);
    });

    test('should fill additionalInfo textarea', async ({ page }) => {
        const infoText = 'มีประสบการณ์ในการพัฒนาเว็บแอปพลิเคชัน\nเคยทำงานในโครงการต่างๆ';
        await fillTextInput(page, 'ข้อมูลเพิ่มเติม', infoText);
        const value = await page.getByLabel('ข้อมูลเพิ่มเติม').inputValue();
        expect(value).toBe(infoText);
    });
});

test.describe('FormComponent - Checkboxes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/FormComponent');
    });

    test('should check and uncheck "จบการศึกษา" checkbox', async ({ page }) => {
        const checkbox = page.getByRole('checkbox', { name: 'จบการศึกษา' });

        // Initially unchecked
        expect(await checkbox.isChecked()).toBe(false);

        // Check it
        await checkCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(500); // Wait for Vue reactivity
        expect(await checkbox.isChecked()).toBe(true);

        // Uncheck it
        await uncheckCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(500); // Wait for Vue reactivity
        expect(await checkbox.isChecked()).toBe(false);
    });

    test('should enable graduation date field when "จบการศึกษา" is checked', async ({ page }) => {
        // Initially, date field should be disabled
        expect(await isFieldDisabled(page, 'ปีที่จบ ค.ศ.')).toBe(true);

        // Check "จบการศึกษา"
        await checkCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(800); // Wait for Vue reactivity and field state update

        // Now date field should be enabled
        expect(await isFieldDisabled(page, 'ปีที่จบ ค.ศ.')).toBe(false);
    });

    test('should enable year field when "จบการศึกษา" is unchecked', async ({ page }) => {
        // Initially, year field should be enabled (unchecked)
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(false);

        // Check "จบการศึกษา"
        await checkCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(800); // Wait for Vue reactivity

        // Now year field should be disabled
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(true);

        // Uncheck "จบการศึกษา"
        await uncheckCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(800); // Wait for Vue reactivity

        // Year field should be enabled again
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(false);
    });

    test('should enable disability fields when "มีภาวะความพิการ" is checked', async ({ page }) => {
        // Initially, disability select should be disabled
        expect(await isFieldDisabled(page, 'เลือกประเภทความพิการ')).toBe(true);

        // Check "มีภาวะความพิการ"
        await checkCheckbox(page, 'มีภาวะความพิการ');
        await page.waitForTimeout(800); // Wait for Vue reactivity

        // Now disability fields should be enabled
        expect(await isFieldDisabled(page, 'เลือกประเภทความพิการ')).toBe(false);
        expect(await isFieldDisabled(page, 'รายละเอียด')).toBe(false);
    });

    test('should disable submit button when PDPA is not checked', async ({ page }) => {
        const submitButton = page.getByRole('button', { name: /เพิ่มข้อมูล|แก้ไขข้อมูล/ });

        // Initially disabled (PDPA not checked)
        expect(await submitButton.isDisabled()).toBe(true);

        // Check PDPA
        await checkCheckbox(page, /ข้าพเจ้ายินยอมให้ใช้ข้อมูลส่วนบุคคล/);
        await page.waitForTimeout(800); // Wait for Vue reactivity and button state update

        // Submit button should be enabled
        expect(await submitButton.isDisabled()).toBe(false);
    });
});

test.describe('FormComponent - Select Dropdowns', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses for dropdowns
        await mockApiResponse(page, 'getInstitutes', mockInstitutes);
        await mockApiResponse(page, 'getFaculties', mockFaculties);
        await mockApiResponse(page, 'getDegrees', mockDegrees);
        await mockApiResponse(page, 'getDepartments', mockDepartments);
        await mockApiResponse(page, 'getDisabilitys', mockDisabilities);
        await mockApiResponse(page, 'getProjects', mockProjects);
        await mockApiResponse(page, 'getAdvisors', mockAdvisors);

        await page.goto('/FormComponent');
    });

    test('should select institute from dropdown', async ({ page }) => {
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');

        // Verify selection
        const chip = page.locator('text=สถาบัน:').locator('..').getByText('มหาวิทยาลัยแม่โจ้');
        await expect(chip).toBeVisible();
    });

    test('should select faculty from dropdown', async ({ page }) => {
        // First select institute (cascading requirement)
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');

        // Then select faculty
        await selectOption(page, 'คณะ *', 'คณะวิทยาศาสตร์');

        const chip = page.locator('text=คณะ:').locator('..').getByText('คณะวิทยาศาสตร์');
        await expect(chip).toBeVisible();
    });

    test('should select degree from dropdown', async ({ page }) => {
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');
        await selectOption(page, 'คณะ *', 'คณะวิทยาศาสตร์');
        await selectOption(page, 'ระดับการศึกษา *', 'ปริญญาตรี');

        const chip = page.locator('text=ระดับการศึกษา:').locator('..').getByText('ปริญญาตรี');
        await expect(chip).toBeVisible();
    });

    test('should select department from dropdown', async ({ page }) => {
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');
        await selectOption(page, 'คณะ *', 'คณะวิทยาศาสตร์');
        await selectOption(page, 'ระดับการศึกษา *', 'ปริญญาตรี');
        await selectOption(page, 'สาขาวิชา *', 'วิทยาการคอมพิวเตอร์');

        const chip = page.locator('text=สาขาวิชา:').locator('..').getByText('วิทยาการคอมพิวเตอร์');
        await expect(chip).toBeVisible();
    });

    test('should clear institute selection', async ({ page }) => {
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');
        await clearSelect(page, 'สถาบันการศึกษา *');

        const badge = page.locator('text=สถาบัน:').locator('..').getByText('*none*');
        await expect(badge).toBeVisible();
    });

    test('should filter institute options', async ({ page }) => {
        await selectOptionWithSearch(page, 'สถาบันการศึกษา *', 'แม่โจ้');
        await page.waitForTimeout(1000); // Wait for filter and selection to complete

        const chip = page.locator('text=สถาบัน:').locator('..').getByText(/แม่โจ้/);
        await expect(chip).toBeVisible({ timeout: 10000 });
    });

    test('should select disability type', async ({ page }) => {
        await checkCheckbox(page, 'มีภาวะความพิการ');
        await selectOption(page, 'เลือกประเภทความพิการ', 'ความพิการทางการเคลื่อนไหว');

        const chip = page.locator('text=ความพิการ:').locator('..').getByText('ความพิการทางการเคลื่อนไหว');
        await expect(chip).toBeVisible();
    });

    test('should select project', async ({ page }) => {
        await selectOption(page, 'โครงการ', 'โครงการทดสอบ 1');

        const chip = page.locator('text=โครงการ:').locator('..').getByText('โครงการทดสอบ 1');
        await expect(chip).toBeVisible();
    });

    test('should select advisor', async ({ page }) => {
        await selectOption(page, 'ผู้ดูแลกลุ่ม', 'อาจารย์สมชาย ใจดี');

        const chip = page.locator('text=ผู้ดูแลกลุ่ม:').locator('..').getByText('อาจารย์สมชาย ใจดี');
        await expect(chip).toBeVisible();
    });
});

test.describe('FormComponent - Cascading Selects', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getInstitutes', mockInstitutes);
        await mockApiResponse(page, 'getFaculties', mockFaculties);
        await mockApiResponse(page, 'getDegrees', mockDegrees);
        await mockApiResponse(page, 'getDepartments', mockDepartments);

        await page.goto('/FormComponent');
    });

    test('should trigger faculty load when institute is selected', async ({ page }) => {
        // Select institute
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');

        // Faculty dropdown should now have options
        await page.getByLabel('คณะ *').click();

        // Check if faculty options are visible
        const facultyOption = page.getByRole('option', { name: 'คณะวิทยาศาสตร์' });
        await expect(facultyOption).toBeVisible();
    });

    test('should complete full cascading selection', async ({ page }) => {
        // Select institute → faculty → degree → department
        await selectOption(page, 'สถาบันการศึกษา *', 'มหาวิทยาลัยแม่โจ้');
        await page.waitForTimeout(500); // Wait for cascade

        await selectOption(page, 'คณะ *', 'คณะวิทยาศาสตร์');
        await page.waitForTimeout(500);

        await selectOption(page, 'ระดับการศึกษา *', 'ปริญญาตรี');
        await page.waitForTimeout(500);

        await selectOption(page, 'สาขาวิชา *', 'วิทยาการคอมพิวเตอร์');

        // Verify all selections
        await expect(page.getByText('มหาวิทยาลัยแม่โจ้')).toBeVisible();
        await expect(page.getByText('คณะวิทยาศาสตร์')).toBeVisible();
        await expect(page.getByText('ปริญญาตรี')).toBeVisible();
        await expect(page.getByText('วิทยาการคอมพิวเตอร์')).toBeVisible();
    });
});

test.describe('FormComponent - Form Submission', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getInstitutes', mockInstitutes);
        await mockApiResponse(page, 'getFaculties', mockFaculties);
        await mockApiResponse(page, 'getDegrees', mockDegrees);
        await mockApiResponse(page, 'getDepartments', mockDepartments);
        await mockApiResponse(page, 'getProjects', mockProjects);
        await mockApiResponse(page, 'getAdvisors', mockAdvisors);

        await page.goto('/FormComponent');
    });

    test('should show confirmation dialog when submitting', async ({ page }) => {
        await fillCompleteForm(page, testIndividual);
        await submitForm(page);

        // Check for confirmation dialog
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('ยืนยัน');
        await expect(dialog).toContainText('คุณต้องการบันทึกการเพิ่มข้อมูลหรือไม่?');
    });

    test('should submit form successfully when confirmed', async ({ page }) => {
        // Mock API response for insert
        await mockApiResponse(page, 'insert', { success: true, message: 'บันทึกสำเร็จ' });

        await fillCompleteForm(page, testIndividual);
        await submitForm(page);
        await confirmDialog(page);

        // Wait for API call and response
        await page.waitForTimeout(1000);
    });

    test('should reset form when reset button is clicked', async ({ page }) => {
        await fillCompleteForm(page, testIndividual);
        await resetForm(page);

        // Verify fields are cleared
        const birthdayValue = await page.getByLabel('ปีเกิด ค.ศ.*').inputValue();
        expect(birthdayValue).toBe('');
    });
});

test.describe('FormComponent - Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/FormComponent');
    });

    test('should require PDPA checkbox to enable submit', async ({ page }) => {
        const submitButton = page.getByRole('button', { name: /เพิ่มข้อมูล/ });

        // Initially disabled
        expect(await submitButton.isDisabled()).toBe(true);

        // Check PDPA
        await checkCheckbox(page, /ข้าพเจ้ายินยอมให้ใช้ข้อมูลส่วนบุคคล/);
        await page.waitForTimeout(800); // Wait for Vue reactivity

        // Now enabled
        expect(await submitButton.isDisabled()).toBe(false);
    });

    test('should validate conditional graduation date field', async ({ page }) => {
        // When graduated, date field should be enabled
        await checkCheckbox(page, 'จบการศึกษา');
        await page.waitForTimeout(800); // Wait for Vue reactivity
        expect(await isFieldDisabled(page, 'ปีที่จบ ค.ศ.')).toBe(false);

        // Can fill the date
        await fillTextInput(page, 'ปีที่จบ ค.ศ.', '2023');
        const value = await page.getByLabel('ปีที่จบ ค.ศ.').inputValue();
        expect(value).toBe('2023');
    });

    test('should validate conditional year field', async ({ page }) => {
        // When not graduated, year field should be enabled
        expect(await isFieldDisabled(page, 'ชั้นปี')).toBe(false);

        // Can fill the year
        await fillTextInput(page, 'ชั้นปี', '4');
        const value = await page.getByLabel('ชั้นปี').inputValue();
        expect(value).toBe('4');
    });
});

test.describe('FormComponent - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/FormComponent');
    });

    test('should navigate to home when clicking "ออก" button', async ({ page }) => {
        await page.getByRole('button', { name: 'ออก' }).click();

        // Should navigate to home page
        await expect(page).toHaveURL('/');
    });

    test('should navigate to FormRegistration', async ({ page }) => {
        await page.getByRole('button', { name: 'กลับฟอร์มการลงทะเบียน' }).click();

        await expect(page).toHaveURL('/FormRegistration');
    });

    test('should navigate to FormPlanCareer', async ({ page }) => {
        await page.getByRole('button', { name: 'ไปฟอร์มกำหนดอาชีพเป้าหมาย' }).click();

        await expect(page).toHaveURL('/FormPlanCareer');
    });
});

test.describe('FormComponent - Bulk Delete', () => {
    test.beforeEach(async ({ page }) => {
        await mockApiResponse(page, 'getInstitutes', mockInstitutes);
        // Mock get all data
        await mockApiResponse(page, 'getAll', [testIndividual, { ...testIndividual, individual_id: '2', full_name: 'Test 2' }]);
        await page.goto('/FormComponent');
    });

    test('should show bulk delete button when items selected', async ({ page }) => {
        // Initially no checkboxes checked, button hidden
        const deleteBtn = page.getByRole('button', { name: 'ลบที่เลือก' });
        await expect(deleteBtn).toBeHidden();

        // Check first row checkbox
        // Note: Quasar table header checkbox selects all, row checkbox selects one
        // We target the first row's checkbox
        const firstRowCheckbox = page.locator('tbody tr').first().locator('.q-checkbox');
        await firstRowCheckbox.click();

        // Button should appear
        await expect(deleteBtn).toBeVisible();
    });

    test('should delete selected items', async ({ page }) => {
        // Prepare mocks
        await mockApiResponse(page, 'delete', { success: true });
        // After delete, reload returns empty
        await mockApiResponse(page, 'getAll', []);

        // Select item
        await page.locator('tbody tr').first().locator('.q-checkbox').click();

        // Click delete selected
        await page.getByRole('button', { name: 'ลบที่เลือก' }).click();

        // Confirm
        await confirmDialog(page);

        // Should reload and be empty
        // In real app logic verify reload happened or notification
        await page.waitForTimeout(1000);
        // Verify notification success if possible, or simple wait
        const notification = page.locator('.q-notification__message');
        await expect(notification).toContainText('ลบข้อมูลสำเร็จ');
    });
});
