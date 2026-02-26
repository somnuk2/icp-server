import { test, expect } from '@playwright/test';
import {
  confirmDialog as confirmDialogHelper,
} from './helpers/form-helpers.js';

const BASE_URL = 'http://localhost:9000/icp-project-app';
const TEST_USER = {
  username: 'somnuk.sin@gmail.com',
  password: '123456',
};

const T = {
  short: 3_000,
  medium: 10_000,
  long: 20_000,
  xlong: 45_000,
};

// ---------- Utilities ----------
function uniq(prefix = 'ทักษะทดสอบ') {
  const ts = new Date().toISOString().replace(/[:.TZ-]/g, '');
  return `${prefix}-${ts}`;
}

/**
 * Quasar keeps some spinner DOM around; only check VISIBLE spinners.
 */
async function waitForQuasarIdle(page, timeout = T.long) {
  await expect
    .poll(async () => {
      const visibleSpinners = await page.locator('.q-spinner:visible, .q-spinner-dots:visible').count();
      const innerLoading = await page.locator('.q-inner-loading--showing:visible').count();
      const linear = await page.locator('.q-linear-progress:visible').count();
      return visibleSpinners + innerLoading + linear;
    }, { timeout })
    .toBe(0);

  await page.waitForTimeout(150);
}

async function waitForNotification(page, pattern = /สำเร็จ|ไม่สำเร็จ|เตือน|warning/i, timeout = T.long) {
  const notif = page.locator('.q-notification').last();
  await notif.waitFor({ state: 'visible', timeout });
  const text = (await notif.innerText()).trim();
  expect(text).toMatch(pattern);
  return text;
}

/**
 * Click OK/Confirm in any Quasar dialog (fallback if helper isn't enough)
 */
async function confirmDialogFallback(page) {
  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: T.long });

  const okBtn = dialog.locator('button').filter({ hasText: /OK|ตกลง|ยืนยัน|Confirm|ใช่/i }).first();
  await expect(okBtn).toBeVisible({ timeout: T.long });
  await okBtn.click();
}

/**
 * Robust confirm dialog: use your helper if it exists, else fallback.
 */
async function confirmDialog(page) {
  try {
    await confirmDialogHelper(page);
  } catch {
    await confirmDialogFallback(page);
  }
}

async function gotoFormQualification(page) {
  await page.goto(`${BASE_URL}/FormQualification`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });
  await waitForQuasarIdle(page, T.xlong);

  // Tree section should exist
  await expect(page.locator('.q-tree')).toBeVisible({ timeout: T.xlong });
}

async function openManualDialog(page) {
  const btn = page.locator('button:has-text("เพิ่มคุณสมบัติด้วยตนเอง")').first();
  await expect(btn).toBeVisible({ timeout: T.long });
  await btn.click();

  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: T.long });
  await expect(dialog).toContainText(/เพิ่มข้อมูลคุณสมบัติ|แก้ไขข้อมูล/);
}

/**
 * Select first option in an opened Quasar menu
 * Return option text (first line).
 */
async function pickOptionFromOpenMenu(page, optionIndex = 0) {
  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: T.long });

  const items = menu.locator('.q-item');
  await expect.poll(async () => await items.count(), { timeout: T.long }).toBeGreaterThan(0);

  const item = items.nth(optionIndex);
  const rawText = (await item.innerText()).trim();
  // often includes multiple lines (label + caption)
  const firstLine = rawText.split('\n')[0].trim();
  await item.click();
  return firstLine;
}

/**
 * For q-select with data-testid: open, (optional) type search, pick option index.
 * Return picked option label.
 */
async function selectByTestId(page, testId, { searchText = '', optionIndex = 0 } = {}) {
  const el = page.getByTestId(testId);
  await expect(el).toBeVisible({ timeout: T.long });
  await el.click();

  if (searchText) {
    await page.keyboard.type(searchText);
  }

  const picked = await pickOptionFromOpenMenu(page, optionIndex);
  return picked;
}

/**
 * Type and press Enter in currently focused q-select input (for new-value).
 */
async function typeAndEnter(page, text) {
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}

/**
 * Find a tree node header by qualification label.
 */
function treeNodeHeaderByText(page, text) {
  return page.locator('.q-tree__node-header').filter({ hasText: text }).first();
}

async function clickTreeEdit(page, qualificationName) {
  const header = treeNodeHeaderByText(page, qualificationName);
  await expect(header).toBeVisible({ timeout: T.long });

  const editBtn = header.locator('button:has(i.material-icons:text("edit")), button:has(.material-icons:text("edit"))').first();
  await expect(editBtn).toBeVisible({ timeout: T.long });
  await editBtn.click();

  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: T.long });
  await expect(dialog).toContainText('แก้ไขข้อมูล');
}

async function clickTreeDelete(page, qualificationName) {
  const header = treeNodeHeaderByText(page, qualificationName);
  await expect(header).toBeVisible({ timeout: T.long });

  const delBtn = header.locator('button:has(i.material-icons:text("delete")), button:has(.material-icons:text("delete"))').first();
  await expect(delBtn).toBeVisible({ timeout: T.long });
  await delBtn.click();

  // Confirm dialog for deleteItem()
  await confirmDialog(page);
}

/**
 * Add a new qualification via dialog, including creating a new qualification name (new-value)
 * and (optionally) new group name (new-value).
 */
async function addQualificationViaDialog(page, { qualName, groupName }) {
  await openManualDialog(page);

  // 1) pick plan career (must exist)
  const pickedCareer = await selectByTestId(page, 'select-target-career', { searchText: '', optionIndex: 0 });

  // 2) set qualification group first (optional but useful for group creation flow)
  if (groupName) {
    const groupSelect = page.getByTestId('select-qualification-group');
    await expect(groupSelect).toBeVisible({ timeout: T.long });
    await groupSelect.click();
    await typeAndEnter(page, groupName);
  }

  // 3) add new qualification name -> triggers confirm dialog in onNewQualification()
  const qualSelect = page.getByTestId('select-qualification-name');
  await expect(qualSelect).toBeVisible({ timeout: T.long });
  await qualSelect.click();
  await typeAndEnter(page, qualName);

  // confirm create qualification in DB
  await confirmDialog(page);
  await waitForNotification(page, /เพิ่มคุณสมบัติใหม่สำเร็จ|สำเร็จ/i, T.xlong);
  await waitForQuasarIdle(page, T.long);

  // 4) pick target + level (choose option 0)
  const pickedTarget = await selectByTestId(page, 'select-target-value', { optionIndex: 0 });
  const pickedLevel = await selectByTestId(page, 'select-level', { optionIndex: 0 });

  // 5) submit add
  const submitBtn = page.getByTestId('btn-submit-qual');
  await expect(submitBtn).toBeVisible({ timeout: T.long });
  await submitBtn.click();

  await waitForNotification(page, /บันทึกข้อมูลสำเร็จ|สำเร็จ/i, T.xlong);
  await waitForQuasarIdle(page, T.xlong);

  return { pickedCareer, pickedTarget, pickedLevel };
}

async function editQualificationViaDialog(page, { newTargetIndex = 1, newLevelIndex = 1, newGroupName = '' }) {
  // dialog should already be open in edit mode
  if (newGroupName) {
    const groupSelect = page.getByTestId('select-qualification-group');
    await expect(groupSelect).toBeVisible({ timeout: T.long });
    await groupSelect.click();
    await typeAndEnter(page, newGroupName);
  }

  const pickedTarget = await selectByTestId(page, 'select-target-value', { optionIndex: newTargetIndex });
  const pickedLevel = await selectByTestId(page, 'select-level', { optionIndex: newLevelIndex });

  const submitBtn = page.getByTestId('btn-submit-qual');
  await expect(submitBtn).toBeVisible({ timeout: T.long });
  await submitBtn.click();

  await waitForNotification(page, /แก้ไขข้อมูลสำเร็จ|สำเร็จ/i, T.xlong);
  await waitForQuasarIdle(page, T.xlong);

  return { pickedTarget, pickedLevel };
}

// ---------- Tests ----------
test.describe('FormQualification.vue - Real DB Integration', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('🖥️ BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('❌ BROWSER ERROR:', err.message));

    // Login
    await page.goto(`${BASE_URL}/LoginPage`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill(TEST_USER.username);
    await page.locator('input[type="password"]').fill(TEST_USER.password);

    await Promise.all([
      page.waitForURL(`${BASE_URL}/`, { timeout: T.xlong }),
      page.locator('button:has-text("เข้าระบบ")').click(),
    ]);

    await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });
    await waitForQuasarIdle(page, T.xlong);
  });

  test('1) Tree is constructed from DB (add -> reload -> still exists)', async ({ page }) => {
    await gotoFormQualification(page);

    const qualName = uniq('ทักษะทดสอบ');
    const groupName = uniq('กลุ่มทดสอบ');

    const { pickedCareer, pickedTarget, pickedLevel } = await addQualificationViaDialog(page, { qualName, groupName });

    // Assert tree shows new record (UI after fetchTableData)
    const tree = page.locator('.q-tree');
    await expect(tree).toContainText(pickedCareer, { timeout: T.xlong });
    await expect(tree).toContainText(qualName, { timeout: T.xlong });
    await expect(tree).toContainText(`ระดับความสำคัญ: ${pickedLevel}`, { timeout: T.xlong });
    // target_value may vary; at least assert target name appears
    await expect(tree).toContainText(pickedTarget, { timeout: T.xlong });

    // Reload and verify again => proves tree built from DB on mount
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });
    await waitForQuasarIdle(page, T.xlong);

    await expect(page.locator('.q-tree')).toContainText(pickedCareer, { timeout: T.xlong });
    await expect(page.locator('.q-tree')).toContainText(qualName, { timeout: T.xlong });
  });

  test('2) Edit/Delete from Tree (edit button opens dialog -> update -> delete -> reload)', async ({ page }) => {
    await gotoFormQualification(page);

    // Create a fresh record first (so edit/delete are deterministic)
    const qualName = uniq('ทักษะทดสอบ-TreeCRUD');
    const groupName = uniq('กลุ่มทดสอบ-TreeCRUD');
    const { pickedCareer } = await addQualificationViaDialog(page, { qualName, groupName });

    const tree = page.locator('.q-tree');
    await expect(tree).toContainText(qualName, { timeout: T.xlong });
    await expect(tree).toContainText(pickedCareer, { timeout: T.xlong });

    // ---- EDIT from tree ----
    await clickTreeEdit(page, qualName);

    // Try pick index 1 for target/level; fallback to index 0 if only 1 option exists
    let editedTargetLabel = '';
    let editedLevelLabel = '';
    try {
      const edited = await editQualificationViaDialog(page, {
        newTargetIndex: 1,
        newLevelIndex: 1,
        newGroupName: uniq('กลุ่มแก้ไข'),
      });
      editedTargetLabel = edited.pickedTarget;
      editedLevelLabel = edited.pickedLevel;
    } catch (e) {
      console.warn('⚠️ Not enough options for index 1; fallback to index 0', e?.message || e);
      const edited = await editQualificationViaDialog(page, {
        newTargetIndex: 0,
        newLevelIndex: 0,
        newGroupName: uniq('กลุ่มแก้ไข'),
      });
      editedTargetLabel = edited.pickedTarget;
      editedLevelLabel = edited.pickedLevel;
    }

    // Assert tree reflects updated target/level text
    await expect(page.locator('.q-tree')).toContainText(`ระดับความสำคัญ: ${editedLevelLabel}`, { timeout: T.xlong });
    await expect(page.locator('.q-tree')).toContainText(editedTargetLabel, { timeout: T.xlong });

    // ---- DELETE from tree ----
    await clickTreeDelete(page, qualName);
    await waitForNotification(page, /ลบข้อมูลสำเร็จ|สำเร็จ/i, T.xlong);
    await waitForQuasarIdle(page, T.xlong);

    await expect(page.locator('.q-tree')).not.toContainText(qualName, { timeout: T.xlong });

    // Reload and verify still gone (DB)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });
    await waitForQuasarIdle(page, T.xlong);

    await expect(page.locator('.q-tree')).not.toContainText(qualName, { timeout: T.xlong });
  });

  test('3) CRUD via Dialog Form (Add + Edit via dialog, Delete via tree)', async ({ page }) => {
    await gotoFormQualification(page);

    const qualName = uniq('ทักษะทดสอบ-Dialog');
    const groupName = uniq('กลุ่มทดสอบ-Dialog');

    // ---- ADD via dialog ----
    const { pickedCareer } = await addQualificationViaDialog(page, { qualName, groupName });
    await expect(page.locator('.q-tree')).toContainText(qualName, { timeout: T.xlong });
    await expect(page.locator('.q-tree')).toContainText(pickedCareer, { timeout: T.xlong });

    // ---- EDIT via dialog (opened from tree edit button, still dialog flow) ----
    await clickTreeEdit(page, qualName);
    const edited = await editQualificationViaDialog(page, {
      newTargetIndex: 0,
      newLevelIndex: 0,
      newGroupName: uniq('กลุ่มแก้ไข-Dialog'),
    });

    await expect(page.locator('.q-tree')).toContainText(`ระดับความสำคัญ: ${edited.pickedLevel}`, { timeout: T.xlong });

    // ---- DELETE (dialog doesn't have delete) => delete via tree ----
    await clickTreeDelete(page, qualName);
    await waitForNotification(page, /ลบข้อมูลสำเร็จ|สำเร็จ/i, T.xlong);
    await waitForQuasarIdle(page, T.xlong);
    await expect(page.locator('.q-tree')).not.toContainText(qualName, { timeout: T.xlong });
  });
});
