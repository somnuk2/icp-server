import { expect } from '@playwright/test';

/**
 * Shared Helper Functions for Quasar/Vue Playwright Tests
 * - Robust Quasar q-select handling
 * - Stable waits for Quasar loading
 * - Dialog helpers
 * - Table helpers
 * - FormQualification helpers
 */

/* ---------------------------
 * Generic Waits / Utilities
 * --------------------------- */

// export async function waitForQuasarIdle(
//   page,
//   timeout = 20_000,
//   {
//     ignoreSpinners = false,       // ✅ AI ทำงานค้าง: true
//     ignoreInnerLoading = false,   // ✅ AI overlay: true
//     ignoreLinear = false          // ✅ progress bar: true
//   } = {}
// ) {
//   const t = Number(timeout) || 20_000;

//   // ถ้า page ถูกปิดแล้ว ให้จบทันที (กัน error Target page closed)
//   if (page.isClosed()) return;

//   await expect.poll(async () => {
//     if (page.isClosed()) return 0;

//     let total = 0;

//     if (!ignoreSpinners) {
//       total += await page.locator('.q-spinner:visible, .q-spinner-dots:visible').count().catch(() => 0);
//     }
//     if (!ignoreInnerLoading) {
//       total += await page.locator('.q-inner-loading--showing:visible').count().catch(() => 0);
//     }
//     if (!ignoreLinear) {
//       total += await page.locator('.q-linear-progress:visible').count().catch(() => 0);
//     }

//     return total;
//   }, { timeout: t }).toBe(0);

//   await page.waitForTimeout(150);
// }
export async function waitForQuasarIdle(
  page,
  timeout = 20_000,
  {
    ignoreSpinners = false,
    ignoreInnerLoading = false,
    ignoreLinear = false
  } = {}
) {
  const t = Number(timeout) || 20_000;
  if (page.isClosed()) return;

  // ✅ นับเฉพาะ “loading overlay จริง”
  const SPINNER_SEL =
    '.q-inner-loading--showing:visible .q-spinner, ' +
    '.q-inner-loading--showing:visible .q-spinner-dots, ' +
    '.q-loading:visible .q-spinner, ' +
    '.q-loading:visible .q-spinner-dots';

  const INNER_LOADING_SEL = '.q-inner-loading--showing:visible, .q-loading:visible';

  // linear บางหน้ามีค้าง/ตกแต่ง ให้จับเฉพาะที่เป็น progress จริง
  const LINEAR_SEL =
    '.q-linear-progress[role="progressbar"]:visible, ' +
    '.q-linear-progress--indeterminate:visible';

  await expect
    .poll(async () => {
      if (page.isClosed()) return 0;

      let total = 0;

      if (!ignoreSpinners) {
        total += await page.locator(SPINNER_SEL).count().catch(() => 0);
      }
      if (!ignoreInnerLoading) {
        total += await page.locator(INNER_LOADING_SEL).count().catch(() => 0);
      }
      if (!ignoreLinear) {
        total += await page.locator(LINEAR_SEL).count().catch(() => 0);
      }

      return total;
    }, { timeout: t })
    .toBe(0);

  await page.waitForTimeout(150);
}

export async function waitForNotificationText(page, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const notif = page.locator('.q-notification').last();
  await notif.waitFor({ state: 'visible', timeout: t });
  return (await notif.innerText()).trim();
}

export async function closeDialogIfPresent(page, timeout = 3_000) {
  const t = Number(timeout) || 3_000;
  const dialog = page.locator('.q-dialog:visible').last();
  if (await dialog.count()) {
    const closeBtn = dialog.locator('button').filter({ hasText: /ปิด|Close|ยกเลิก/i }).first();
    if (await closeBtn.count()) {
      await closeBtn.click();
      await expect(dialog).toBeHidden({ timeout: t }).catch(() => { });
    }
  }
}

export async function confirmDialog(page, {
  buttonPattern = /OK|ตกลง|ยืนยัน|Confirm|ใช่/i,
  timeout = 20_000
} = {}) {
  const t = Number(timeout) || 20_000;

  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });

  const okBtn = dialog.locator('button').filter({ hasText: buttonPattern }).first();
  await expect(okBtn).toBeVisible({ timeout: t });
  await okBtn.click();
}

export function uniq(prefix = 'ทักษะ-IT') {
  const ts = new Date().toISOString().replace(/[:.TZ-]/g, '');
  return `${prefix}-${ts}`;
}

/**
 * Get a usable input locator from a data-testid that might be on:
 * - the <input> itself, OR
 * - a wrapper (q-field / label / div)
 */
export async function getInputByTestId(page, testId) {
  const node = page.getByTestId(testId);
  const isInput = await node.evaluate(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA').catch(() => false);
  return isInput
    ? node
    : node.locator('input.q-field__native, textarea.q-field__native, input, textarea').first();
}

export async function ensureDrawerOpen(page, timeout = 10_000) {
  const t = Number(timeout) || 10_000;

  const drawer = page.locator('.q-drawer').first();
  if (!(await drawer.isVisible())) {
    const menuBtn = page.getByLabel('Menu').first();
    if (await menuBtn.count()) {
      await menuBtn.click();
    } else {
      // FIX: Playwright doesn't support :text() pseudo
      await page
        .locator('button:has(i.material-icons:has-text("menu")), button:has(.material-icons:has-text("menu"))')
        .first()
        .click()
        .catch(() => { });
    }
    await drawer.waitFor({ state: 'visible', timeout: t });
  }
}

/* ---------------------------
 * Form input helpers
 * --------------------------- */

export async function fillTextInput(page, label, value) {
  await page.getByLabel(label).fill(value);
}

/**
 * Robust toggle for Quasar q-checkbox where native input is hidden.
 * Strategy:
 *  - Read state from aria-checked (preferred) or class fallback
 *  - Toggle by focus + Space (best for Quasar)
 *  - Has real timeout (no infinite loop)
 */
export async function setQuasarCheckbox(page, testId, desired, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const deadline = Date.now() + t;

  const root = page.getByTestId(testId);
  await expect(root).toBeVisible({ timeout: t });
  await root.scrollIntoViewIfNeeded().catch(() => { });

  const rootRole = await root.getAttribute('role').catch(() => null);
  const roleCb = (rootRole === 'checkbox') ? root : root.locator('[role="checkbox"]').first();
  const hasRole = (rootRole === 'checkbox') || (await roleCb.count()) > 0;

  const getState = async () => {
    if (hasRole) {
      const aria = await roleCb.getAttribute('aria-checked').catch(() => null);
      if (aria === 'true') return true;
      if (aria === 'false') return false;
      if (aria === 'mixed') return true;
    }
    const cls = (await root.getAttribute('class')) || '';
    return /q-checkbox__inner--truthy|q-checkbox--truthy|q-checkbox--checked/i.test(cls);
  };

  const target = hasRole
    ? roleCb
    : (await root.locator('.q-checkbox__inner').count())
      ? root.locator('.q-checkbox__inner').first()
      : root;

  while (Date.now() < deadline) {
    const cur = await getState();
    if (cur === desired) return;

    // best: focus + Space
    await target.focus().catch(() => { });
    await page.keyboard.press('Space').catch(() => { });
    await waitForQuasarIdle(page, 3_000);

    const cur2 = await getState();
    if (cur2 === desired) return;

    // fallback: click
    await target.click({ force: true }).catch(() => { });
    await waitForQuasarIdle(page, 3_000);

    const cur3 = await getState();
    if (cur3 === desired) return;

    await page.waitForTimeout(120);
  }

  throw new Error(`Timeout setting checkbox ${testId} to ${desired}`);
}

/**
 * ✅ Robust helper for "จบการศึกษา" + "ปีที่จบ"
 * - ticks checkbox
 * - waits for graduation year INPUT to be enabled (not just class)
 * - fills year & verifies value
 *
 * Works whether data-testid is on wrapper OR on <input> itself (your DOM shows it's on <input>)
 */
export async function checkGraduatedAndFillYear(page, {
  checkboxTestId = 'checkbox-graduated',
  gradInputTestId = 'input-graduation-date',
  year = '2568',
  timeout = 45_000
} = {}) {
  const t = Number(timeout) || 45_000;

  await setQuasarCheckbox(page, checkboxTestId, true, t);

  const input = await getInputByTestId(page, gradInputTestId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  await input.click({ force: true });
  await input.fill(String(year));
  await expect(input).toHaveValue(String(year), { timeout: t });

  await waitForQuasarIdle(page, 3_000);
}

export async function fillQuasarInputWhenEnabled(page, testId, value, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const input = await getInputByTestId(page, testId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  await input.click({ force: true });
  await input.fill(String(value));

  await waitForQuasarIdle(page, 3_000);
}

export async function fillQuasarInputByTestId(page, testId, value, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const input = await getInputByTestId(page, testId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  await input.focus().catch(() => { });
  await page.keyboard.press('ControlOrMeta+A').catch(() => { });
  await page.keyboard.press('Backspace').catch(() => { });

  await input.fill(String(value)).catch(async () => {
    await page.keyboard.type(String(value), { delay: 20 });
  });

  await waitForQuasarIdle(page, 3_000);
}

/**
 * Robust q-select handler (Quasar portal)
 * - Waits for field visible & enabled
 * - Opens by clicking .q-field__control (fallback press ArrowDown)
 * - Optional typing searchText (focus input first)
 */
export async function selectQuasarOption(page, fieldLabel, optionTextOrRegex, {
  searchText = null,
  timeout = 30_000,
} = {}) {
  const t = Number(timeout) || 30_000;

  const field = page.locator('.q-field').filter({ hasText: fieldLabel }).first();
  await field.waitFor({ state: 'visible', timeout: t });
  await field.scrollIntoViewIfNeeded().catch(() => { });

  await expect(field).not.toHaveClass(/q-field--disabled|disabled/i, { timeout: t });

  const control = field.locator('.q-field__control').first();
  await control.click({ timeout: t }).catch(async () => {
    await control.focus().catch(() => { });
    await page.keyboard.press('ArrowDown').catch(() => { });
  });

  const menu = page.locator('.q-menu:visible').last();
  await menu.waitFor({ state: 'visible', timeout: t });

  await expect.poll(async () => await menu.locator('.q-item').count(), { timeout: t })
    .toBeGreaterThan(0);

  if (searchText) {
    // try focus the field input first
    const fieldInput = field.locator('input').first();
    if (await fieldInput.count()) {
      await fieldInput.focus().catch(() => { });
    }
    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(200);

    await expect.poll(async () => await menu.locator('.q-item').count(), { timeout: t })
      .toBeGreaterThan(0);
  }

  const item = menu.locator('.q-item').filter({ hasText: optionTextOrRegex }).first();
  await item.waitFor({ state: 'visible', timeout: t });
  await item.click({ timeout: t });

  await menu.waitFor({ state: 'hidden', timeout: t }).catch(() => { });
}

/* ---------------------------
 * Table helpers
 * --------------------------- */

export async function waitForTableUpdate(page, timeout = 5_000) {
  const t = Number(timeout) || 5_000;
  await page.waitForSelector('.q-table__progress', { state: 'hidden', timeout: t }).catch(() => { });
  await page.waitForTimeout(800);
}


export async function searchInTable(page, searchText) {
  await page.getByPlaceholder('ค้นหาข้อมูลส่วนตัว').fill(searchText);
  await waitForTableUpdate(page);
}

/* ---------------------------
 * Navigation helpers
 * --------------------------- */

export async function gotoRoute(page, baseUrl, path, {
  idleTimeout = 45_000
} = {}) {
  const t = Number(idleTimeout) || 45_000;
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: t }).catch(() => { });
  await waitForQuasarIdle(page, t);
}

/* ---------------------------
 * FormQualification helpers
 * --------------------------- */

export async function gotoFormQualification(page, baseUrl, idleTimeout = 45_000) {
  const t = Number(idleTimeout) || 45_000;
  await gotoRoute(page, baseUrl, '/FormQualification', { idleTimeout: t });
  await expect(page.locator('.q-tree')).toBeVisible({ timeout: t });
}

export async function openManualQualificationDialog(page, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const btn = page.locator('button:has-text("เพิ่มคุณสมบัติด้วยตนเอง")').first();
  await expect(btn).toBeVisible({ timeout: t });
  await btn.click();

  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });
  await expect(dialog).toContainText(/เพิ่มข้อมูลคุณสมบัติ|แก้ไขข้อมูล/);
}

export async function pickOptionFromMenu(page, indexPreferred = 0, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: t });

  const items = menu.locator('.q-item');
  await expect.poll(async () => await items.count(), { timeout: t }).toBeGreaterThan(0);

  const cnt = await items.count();
  const idx = cnt > indexPreferred ? indexPreferred : 0;

  const item = items.nth(idx);
  const raw = (await item.innerText()).trim();
  const firstLine = raw.split('\n')[0].trim();
  await item.click();
  return firstLine;
}

export async function selectByTestId(page, testId, { optionIndex = 0, searchText = '' } = {}, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const root = page.getByTestId(testId);
  await expect(root).toBeVisible({ timeout: t });

  const control = root.locator('.q-field__control');
  if (await control.count()) {
    await control.first().click({ timeout: t });
  } else {
    await root.click({ timeout: t });
  }

  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: t });

  if (searchText) {
    const inputInRoot = root.locator('input').first();
    if (await inputInRoot.count()) await inputInRoot.focus().catch(() => { });

    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(200);
  }

  return await pickOptionFromMenu(page, optionIndex, t);
}

export async function typeAndEnter(page, text) {
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}
// ===========================
// QTree helpers (ROBUST)
// ===========================

export function treeNodeHeaderByText(page, text) {
  // จำกัด scope ใน .q-tree เพื่อกันชน element อื่น
  return page.locator('.q-tree .q-tree__node-header').filter({ hasText: text }).first();
}

/**
 * Expand all collapsed nodes in Quasar QTree safely.
 * - Quasar uses .q-tree__arrow and adds .q-tree__arrow--rotate when expanded
 * - Re-render may detach locators, so always re-query inside loop
 */
export async function expandAllTreeNodes(page, {
  treeSelector = '.q-tree',
  timeout = 45_000,
  maxRounds = 50,
} = {}) {
  const t = Number(timeout) || 45_000;

  const tree = page.locator(treeSelector).first();
  await expect(tree).toBeVisible({ timeout: t });

  for (let round = 0; round < maxRounds; round++) {
    // ✅ re-query arrows every round (กัน detach)
    const collapsedArrows = page
      .locator(`${treeSelector} .q-tree__arrow:not(.q-tree__arrow--rotate)`)
      .filter({ has: page.locator('.q-icon') });

    let n = 0;
    try {
      n = await collapsedArrows.count();
    } catch {
      // tree อาจ re-render ระหว่างนับ -> รอแล้ววนใหม่
      await waitForQuasarIdle(page, 3_000);
      continue;
    }

    if (n === 0) return;

    // คลิกทีละอัน (คลิกแบบ force ลดปัญหา overlay)
    await collapsedArrows.first().click({ force: true }).catch(() => { });
    await waitForQuasarIdle(page, 3_000);
  }

  // ถ้าถึง maxRounds แล้วยังไม่หมด ให้ไม่ throw แต่ปล่อยผ่าน
}

/**
 * Expand QTree until a node header containing `text` becomes visible.
 * Works even when tree is deeply nested (career -> group -> qualification).
 *
 * IMPORTANT:
 * - ไม่ใช้ waitForQuasarIdle เพราะมี spinner AI ค้างได้
 * - ใช้การ expand + poll จน node โผล่จริง
 */
export async function ensureTreeNodeHeaderVisible(page, text, timeout = 45_000) {
  const t = Number(timeout) || 45_000;
  const tree = page.locator('.q-tree').first();

  await expect(tree).toBeVisible({ timeout: t });

  const headerLocator = tree.locator('.q-tree__node-header').filter({ hasText: text }).first();

  const maxRounds = 40; // กัน loop ไม่จบ
  for (let round = 0; round < maxRounds; round++) {
    // ถ้าเจอแล้ว -> scroll + return
    const cnt = await headerLocator.count().catch(() => 0);
    if (cnt > 0) {
      await headerLocator.scrollIntoViewIfNeeded().catch(() => { });
      if (await headerLocator.isVisible().catch(() => false)) {
        return headerLocator;
      }
    }

    // ยังไม่เจอ -> expand arrow ที่ยังพับอยู่
    const collapsedArrows = tree.locator('.q-tree__arrow:not(.q-tree__arrow--rotate)');
    const n = await collapsedArrows.count().catch(() => 0);

    // ถ้าไม่มี arrow ให้ขยายแล้ว -> break ไป fail ตอนท้าย
    if (n === 0) break;

    // คลิกขยายทีละอัน (บนสุดก่อน)
    await collapsedArrows.first().click({ force: true }).catch(() => { });
    await page.waitForTimeout(120); // ให้ DOM update
  }

  // รอบสุดท้ายให้ fail แบบอ่านง่าย
  await expect(headerLocator).toBeVisible({ timeout: t });
  return headerLocator;
}

/**
 * Click action button (edit/delete) inside the target node header.
 * - auto expand tree until node visible
 */
export async function clickTreeAction(page, nodeText, action /* 'edit' | 'delete' */, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const header = await ensureTreeNodeHeaderVisible(page, nodeText, t);
  await expect(header).toBeVisible({ timeout: t });

  const iconName = action === 'delete' ? 'delete' : 'edit';

  const btn = header.locator(
    `button:has(i.material-icons:text("${iconName}")), button:has(.material-icons:text("${iconName}"))`
  ).first();

  await expect(btn).toBeVisible({ timeout: t });
  await btn.click({ force: true });

  return header;
}
/**
 * Click edit/delete button inside a tree node header by icon name.
 * iconText = "edit" | "delete"
 */
export async function clickTreeActionByText(page, nodeText, iconText, timeout = 20_000, {
  treeSelector = '.q-tree',
} = {}) {
  const t = Number(timeout) || 20_000;

  const header = await ensureTreeNodeHeaderVisible(page, nodeText, t, { treeSelector });
  await expect(header).toBeVisible({ timeout: t }).catch(() => { });

  // ✅ ตาม HTML ของคุณ icon อยู่ใน <i class="material-icons">edit</i>
  const btn = header.locator(
    `button:has(i.material-icons:text("${iconText}")), button:has(.material-icons:text("${iconText}"))`
  ).first();

  await expect(btn).toBeVisible({ timeout: t });
  await btn.click({ force: true });

  await waitForQuasarIdle(page, 3_000);
}

export async function clickTreeEdit(page, qualificationName, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  await clickTreeAction(page, qualificationName, 'edit', t);

  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });
  await expect(dialog).toContainText('แก้ไขข้อมูล');
}

export async function clickTreeDelete(page, qualificationName, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  await clickTreeAction(page, qualificationName, 'delete', t);

  // ลบแล้วปกติจะมี confirm dialog ต่อ
  await confirmDialog(page, { timeout: t });
}

export async function addQualificationViaDialog(page, { qualName, groupName }, timeout = 45_000) {
  const t = Number(timeout) || 45_000;

  await openManualQualificationDialog(page, t);

  const pickedCareer = await selectByTestId(page, 'select-target-career', { optionIndex: 0 }, t);

  if (groupName) {
    const groupSelect = page.getByTestId('select-qualification-group');
    await expect(groupSelect).toBeVisible({ timeout: t });
    await groupSelect.click();
    await typeAndEnter(page, groupName);
  }

  const qualSelect = page.getByTestId('select-qualification-name');
  await expect(qualSelect).toBeVisible({ timeout: t });
  await qualSelect.click();
  await typeAndEnter(page, qualName);

  await confirmDialog(page, { timeout: t });
  const notif1 = await waitForNotificationText(page, t);
  expect(notif1).toMatch(/เพิ่มคุณสมบัติใหม่สำเร็จ|สำเร็จ/i);

  await waitForQuasarIdle(page, t);

  await selectByTestId(page, 'select-target-value', { optionIndex: 0 }, t);
  await selectByTestId(page, 'select-level', { optionIndex: 0 }, t);

  const submit = page.getByTestId('btn-submit-qual');
  await expect(submit).toBeVisible({ timeout: t });
  await submit.click();

  const notif2 = await waitForNotificationText(page, t);
  expect(notif2).toMatch(/บันทึกข้อมูลสำเร็จ|สำเร็จ/i);

  await waitForQuasarIdle(page, t);
  return { pickedCareer };
}

export async function editQualificationViaDialog(page, timeout = 45_000) {
  const t = Number(timeout) || 45_000;

  try {
    await selectByTestId(page, 'select-target-value', { optionIndex: 1 }, t);
  } catch {
    await selectByTestId(page, 'select-target-value', { optionIndex: 0 }, t);
  }

  try {
    await selectByTestId(page, 'select-level', { optionIndex: 1 }, t);
  } catch {
    await selectByTestId(page, 'select-level', { optionIndex: 0 }, t);
  }

  const submit = page.getByTestId('btn-submit-qual');
  await expect(submit).toBeVisible({ timeout: t });
  await submit.click();

  const notif = await waitForNotificationText(page, t);
  expect(notif).toMatch(/แก้ไขข้อมูลสำเร็จ|สำเร็จ/i);

  await waitForQuasarIdle(page, t);
}

//------------------------------
function treeRoot(page) {
  return page.locator('.q-tree').first();
}

async function expandHeaderIfCollapsed(header, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  await header.scrollIntoViewIfNeeded().catch(() => { });
  await expect(header).toBeVisible({ timeout: t });

  const expanded = await header.getAttribute('aria-expanded').catch(() => null);
  // ถ้าไม่มี aria-expanded แสดงว่าไม่ใช่ parent ที่ expand ได้
  if (expanded === null) return;

  if (expanded === 'false') {
    const arrow = header.locator('.q-tree__arrow').first();
    if (await arrow.count()) {
      await arrow.click({ force: true });
    } else {
      // fallback: click header
      await header.click({ force: true });
    }

    // รอให้ expanded เป็น true
    await expect(header).toHaveAttribute('aria-expanded', 'true', { timeout: t });

    // tree บางทีโหลด/transition ช้า
    await waitForQuasarIdle(header.page(), 10_000, { ignoreSpinners: true }).catch(() => { });
    await header.page().waitForTimeout(150);
  }
}

/**
 * Step 1: click เลือก “อาชีพที่ N” (index เริ่ม 0)
 * อาชีพ = header ที่มี icon 'work' + มี arrow (expandable)
 */

export async function openCareerByIndex(page, index = 0, timeout = 45_000) {
  const t = Number(timeout) || 45_000;

  // กันหลงหน้า (ช่วยจับเร็ว)
  await expect(page).toHaveURL(/FormPlanCareer|FormQualification/i, { timeout: t });

  const tree = page.locator('.q-tree').first();
  await expect(tree).toBeVisible({ timeout: t });

  // รอให้มี node header ก่อน (กัน data ยังไม่มา)
  await expect.poll(
    async () => await tree.locator('.q-tree__node-header').count(),
    { timeout: t }
  ).toBeGreaterThan(0);

  // หา career header จาก icon work (เผื่อ work_outline ด้วย)
  const careers = tree.locator(
    '.q-tree__node-header:has(i.material-icons:has-text("work")), ' +
    '.q-tree__node-header:has(i.material-icons:has-text("work_outline"))'
  );

  // บางรอบ icon ยังไม่ render ให้ poll รอ
  await expect.poll(
    async () => await careers.count(),
    { timeout: t }
  ).toBeGreaterThan(0);

  const cnt = await careers.count();
  const idx = Math.min(Math.max(index, 0), cnt - 1);
  const header = careers.nth(idx);

  await header.scrollIntoViewIfNeeded().catch(() => { });
  await expect(header).toBeVisible({ timeout: t });

  // expand ถ้ายังไม่ expanded
  const expanded = await header.getAttribute('aria-expanded').catch(() => null);
  if (expanded === 'false') {
    const arrow = header.locator('.q-tree__arrow').first();
    if (await arrow.count()) {
      await arrow.click({ force: true });
    } else {
      await header.click({ force: true });
    }

    // รอให้ expand แล้ว
    await expect(header).toHaveAttribute('aria-expanded', 'true', { timeout: t }).catch(() => { });
  }

  return header;
}

/**
 * Step 2: click เลือก “ทักษะ/คุณสมบัติที่ N” ภายในอาชีพที่เลือก
 * ทักษะ = header ที่มี icon 'fact_check' และมีปุ่ม edit/delete
 */
export async function openSkillByIndexUnderCareer(page, careerHeader, index = 0, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  // node container ของ career
  const careerNode = careerHeader.locator('xpath=ancestor::div[contains(@class,"q-tree__node")][1]');
  await expect(careerNode).toBeVisible({ timeout: t });

  // skills อยู่ใต้ careerNode ใน children
  const skills = careerNode.locator('.q-tree__children .q-tree__node-header')
    .filter({ has: careerNode.locator('i.material-icons:text("fact_check")') });

  // ถ้า career ยังไม่ expanded จริง จะหาไม่เจอ
  await expect.poll(async () => await skills.count(), { timeout: t }).toBeGreaterThan(0);

  const cnt = await skills.count();
  const idx = Math.min(index, cnt - 1);
  const header = skills.nth(idx);

  // ถ้า skill เป็น parent ก็ expand ได้เหมือนกัน (บางหน้าเป็น parent)
  await expandHeaderIfCollapsed(header, t);

  return header;
}

/**
 * Step 2 (แบบเจาะชื่อ): หา skill ภายใต้ career ด้วยชื่อ (เช่น createdQualName)
 */
export async function findSkillByTextUnderCareer(page, careerHeader, skillText, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const careerNode = careerHeader.locator('xpath=ancestor::div[contains(@class,"q-tree__node")][1]');
  await expect(careerNode).toBeVisible({ timeout: t });

  const header = careerNode.locator('.q-tree__children .q-tree__node-header, .q-tree__children .q-tree__node-header-content')
    .filter({ hasText: skillText })
    .first();

  // ให้พยายาม expand career เผื่อยังไม่ขยาย (กันเงื่อนไขแปลก)
  await expandHeaderIfCollapsed(careerHeader, t);

  await expect(header).toBeVisible({ timeout: t });
  await header.scrollIntoViewIfNeeded().catch(() => { });
  return header;
}

/**
 * Step 3: click ปุ่ม edit/delete ของ skill header
 */
export async function clickSkillAction(skillHeader, action = 'edit', timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const icon = action === 'delete' ? 'delete' : 'edit';

  const btn = skillHeader.locator('button')
    .filter({ has: skillHeader.locator(`i.material-icons:text("${icon}")`) })
    .first();

  await expect(btn).toBeVisible({ timeout: t });
  await btn.click({ force: true });
}

export async function fillQuasarDateByTestId(page, testId, value, timeout) {
  const input = page.getByTestId(testId);
  await expect(input).toBeVisible({ timeout });

  // q-input บางทีต้อง click ก่อน fill
  await input.click({ force: true });
  await input.fill(value);

  // commit ค่าให้แน่น
  await page.keyboard.press('Enter').catch(() => { });
  await input.blur().catch(() => { });
  await page.waitForTimeout(150);
}

export async function fillPlanFieldWithFallback(page, { testId, labelRe, value, timeout }) {
  const byTestId = testId ? page.getByTestId(testId) : null;

  if (byTestId && await byTestId.count().catch(() => 0)) {
    await expect(byTestId).toBeVisible({ timeout });
    await byTestId.click({ force: true });
    await byTestId.fill(value);
    await byTestId.blur().catch(() => { });
    return;
  }

  // fallback: label
  const byLabel = page.getByLabel(labelRe).first();
  await expect(byLabel).toBeVisible({ timeout });
  await byLabel.click({ force: true });
  await byLabel.fill(value);
  await byLabel.blur().catch(() => { });
}

////--------------------------------------------------------------
// export async function waitForDialogReady(page, timeout = 20_000) {
//   const t = Number(timeout) || 20_000;
//   const inner = page.locator('.q-dialog__inner:visible').last();

//   await expect(inner).toBeVisible({ timeout: t });

//   await expect
//     .poll(async () => {
//       const cls = (await inner.getAttribute('class')) || '';
//       return {
//         minimized: cls.includes('q-dialog__inner--minimized'),
//         noPointer: cls.includes('no-pointer-events'),
//       };
//     }, { timeout: t })
//     .toSatisfy(s => !s.minimized && !s.noPointer);
// }

// export async function waitForDialogReady(page, timeout = 20_000) {
//   const t = Number(timeout) || 20_000;

//   const inner = page.locator('.q-dialog__inner:visible').last();
//   await expect(inner).toBeVisible({ timeout: t });

//   await expect
//     .poll(async () => {
//       const cls = (await inner.getAttribute('class')) || '';
//       const minimized = cls.includes('q-dialog__inner--minimized');
//       const noPointer = cls.includes('no-pointer-events');
//       return !minimized && !noPointer;
//     }, { timeout: t })
//     .toBe(true);

//   // เผื่อ transition ยังไม่นิ่ง
//   await page.waitForTimeout(50);
// }

// ใน helpers/form-helpers.js
// export async function waitForDialogReady(page, timeout = 15000, options = {}) {
//   const { readyTestId = 'select-target-career' } = options;

//   const dialog = page.locator('.q-dialog:visible').last();
//   await expect(dialog).toBeVisible({ timeout });

//   const inner = dialog.locator('.q-dialog__inner').first();
//   await expect(inner).toBeVisible({ timeout });

//   // วิธีที่ 1: รอ element ภายในที่เรารู้ว่าโหลดแล้ว (เสถียรสุด)
//   const readyElement = page.getByTestId(readyTestId);
//   await expect(readyElement).toBeVisible({ timeout });
//   await expect(readyElement).toBeEnabled({ timeout }).catch(() => { }); // ถ้าเป็น input/select

//   // หรือ วิธีที่ 2: รอ class ไม่มี minimized + มีขนาดพอสมควร (fallback)
//   await expect.poll(async () => {
//     const cls = await inner.getAttribute('class') || '';
//     const isMinimized = cls.includes('q-dialog__inner--minimized');

//     // เพิ่มเช็คขนาดด้วย (ป้องกัน dialog ยังเล็กมาก)
//     const box = await inner.boundingBox();
//     const isBigEnough = box && box.width > 300 && box.height > 200;

//     return !isMinimized && isBigEnough;
//   }, {
//     timeout,
//     message: 'Dialog ยัง minimized อยู่ หรือขนาดยังเล็กเกินไปหลังจาก timeout'
//   }).toBe(true);
// }

// ใน helpers/form-helpers.js
export async function waitForDialogReady(page, timeout = 20000, options = {}) {
  const { readyTestId = 'select-target-career' } = options;

  // 1. รอ dialog หลักโผล่
  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout });

  // 2. รอ element ภายในที่เรามั่นใจว่าต้องพร้อม (นี่คือหัวใจ)
  const readyElement = page.getByTestId(readyTestId);

  await expect(readyElement, 'รอ field อาชีพเป้าหมายให้ปรากฏและใช้งานได้').toBeVisible({ timeout });

  // เพิ่มความมั่นใจอีกนิด
  await expect(readyElement).toBeEnabled({ timeout: timeout / 2 }).catch(() => {
    console.log('Warning: select-target-career ยัง disabled อยู่ แต่ทำต่อ');
  });

  // Buffer เล็กน้อยเผื่อ animation / focus
  await page.waitForTimeout(600);

  console.log('Dialog ready: select-target-career พร้อมใช้งานแล้ว');
}

export async function openQuasarSelectByInputTestId(page, inputTestId, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  // testid อยู่บน <input>
  const input = page.getByTestId(inputTestId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  // field wrapper
  const field = input.locator('xpath=ancestor::label[contains(@class,"q-field")][1]');
  await expect(field).toBeVisible({ timeout: t });

  // ปิดเมนูค้าง (ถ้ามี)
  await page.keyboard.press('Escape').catch(() => { });
  await page.waitForTimeout(50);

  // คลิก dropdown icon หรือ control
  const icon = field.locator('.q-select__dropdown-icon').first();
  const control = field.locator('.q-field__control').first();

  if (await icon.count()) {
    await icon.click({ force: true });
  } else {
    await control.click({ force: true });
  }

  // ช่วยให้เปิดแน่นขึ้น
  await input.focus().catch(() => { });
  await page.keyboard.press('ArrowDown').catch(() => { });

  // รอ expanded
  await expect(input).toHaveAttribute('aria-expanded', 'true', { timeout: t });

  // หา listbox จาก aria-controls (เช่น f_xxx_lb)
  const lbId = await input.getAttribute('aria-controls');
  if (!lbId) throw new Error(`No aria-controls on q-select input testid=${inputTestId}`);

  const listbox = page.locator(`#${lbId}`);
  await expect(listbox).toBeVisible({ timeout: t });

  const items = listbox.locator('.q-item');
  await expect.poll(async () => await items.count(), { timeout: t }).toBeGreaterThan(0);

  return { listbox, items, input };
}

export async function selectFirstOptionByInputTestId(page, inputTestId, timeout = 20_000) {
  const { items } = await openQuasarSelectByInputTestId(page, inputTestId, timeout);
  await items.first().click({ force: true });
}

export async function selectOptionByInputTestId(page, inputTestId, optionTextOrRegex, {
  searchText = null,
  timeout = 20_000,
} = {}) {
  const t = Number(timeout) || 20_000;
  const { items, input } = await openQuasarSelectByInputTestId(page, inputTestId, t);

  if (searchText) {
    await input.focus().catch(() => { });
    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(150);

    // items จะ filter ตาม search
    await expect.poll(async () => await items.count(), { timeout: t }).toBeGreaterThan(0);
  }

  const item = items.filter({ hasText: optionTextOrRegex }).first();
  await expect(item).toBeVisible({ timeout: t });
  await item.click({ force: true });
}

export async function pickCareerAndQualification(page, t) {
  // เปิด career listbox
  let { items: careerItems } = await openQuasarSelectByInputTestId(page, 'select-target-career', t);
  const cCnt = await careerItems.count();
  if (cCnt === 0) throw new Error('No career options found in manual plan dialog');

  const tryMax = Math.min(cCnt, 8);
  for (let i = 0; i < tryMax; i++) {
    ({ items: careerItems } = await openQuasarSelectByInputTestId(page, 'select-target-career', t));
    const cItem = careerItems.nth(i);
    const careerText = (await cItem.innerText()).trim().split('\n')[0];
    await cItem.click({ force: true });

    await page.waitForTimeout(300); // รอ enable qualification

    // เปิด qualification
    try {
      const { items: qualItems } = await openQuasarSelectByInputTestId(page, 'select-target-qualification', t);
      const qCnt = await qualItems.count();
      if (qCnt > 0) {
        const qItem = qualItems.first();
        const qualText = (await qItem.innerText()).trim().split('\n')[0];
        await qItem.click({ force: true });
        return { careerText, qualText };
      }
    } catch {
      // no qual for this career -> continue
    }
  }

  throw new Error('No qualifications found for any of the first careers (manual dialog)');
}

// export async function findPlanHeaderInTree(page, planTitle, t) {
//   const tree = page.getByTestId('plan-tree');
//   await expect(tree).toBeVisible({ timeout: t });

//   // รอให้มี node ก่อน (กันช่วง render/refresh)
//   await expect
//     .poll(async () => await tree.locator('.q-tree__node').count(), { timeout: t })
//     .toBeGreaterThan(0);

//   const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(planTitle)}`);
//   const headerLocator = tree.locator('.q-tree__node-header').filter({ hasText: re }).first();

//   // 1) รอให้ "เจอใน DOM" ก่อน (สำคัญกว่า isVisible)
//   await expect.poll(async () => await headerLocator.count(), {
//     timeout: t,
//     intervals: [500, 1000, 2000],
//     message: `Plan header not found in DOM: แผนพัฒนา: ${planTitle}`,
//   }).toBeGreaterThan(0);

//   // 2) expand ancestor path (เหมือน Step 14)
//   const expandPathToReveal = async (loc) => {
//     const eh = await loc.elementHandle();
//     if (!eh) return;

//     await page.evaluate((el) => {
//       const clickExpand = (h) => {
//         if (!h) return;
//         if (h.getAttribute('aria-expanded') === 'false') {
//           const arrow = h.querySelector('.q-tree__arrow');
//           (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
//         }
//       };

//       const headers = [];
//       let node = el.closest('.q-tree__node');
//       while (node) {
//         const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
//         if (h) headers.push(h);
//         node = node.parentElement?.closest('.q-tree__node');
//       }
//       headers.reverse().forEach(clickExpand);
//     }, eh);

//     await page.waitForTimeout(200);
//   };

//   await expandPathToReveal(headerLocator);

//   // 3) ตอนนี้ค่อยรอให้ visible จริง
//   await expect
//     .poll(async () => await headerLocator.isVisible().catch(() => false), { timeout: t })
//     .toBe(true);

//   await headerLocator.scrollIntoViewIfNeeded().catch(() => { });
//   return headerLocator;
// }

// export async function findPlanHeaderInTree(page, planTitle, t) {
//   const tree = page.getByTestId('plan-tree');
//   await expect(tree).toBeVisible({ timeout: t });

//   // รอให้ tree มี node
//   await expect
//     .poll(async () => await tree.locator('.q-tree__node').count(), { timeout: t })
//     .toBeGreaterThan(0);

//   const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(planTitle)}`);
//   const header = tree.locator('.q-tree__node-header').filter({ hasText: re }).first();

//   // 1) ต้องเจอใน DOM ก่อน
//   await expect.poll(async () => await header.count(), {
//     timeout: t,
//     intervals: [500, 1000, 2000],
//     message: `Plan header not found in DOM: แผนพัฒนา: ${planTitle}`,
//   }).toBeGreaterThan(0);

//   // 2) expand path แบบ Step 14 (แรงขึ้น)
//   const expandPathToReveal = async (headerLocator) => {
//     const eh = await headerLocator.elementHandle();
//     if (!eh) return;

//     await page.evaluate((el) => {
//       const clickExpand = (h) => {
//         if (!h) return;
//         if (h.getAttribute('aria-expanded') === 'false') {
//           const arrow = h.querySelector('.q-tree__arrow');
//           (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
//         }
//       };

//       // expand ancestors from root -> down
//       const headers = [];
//       let node = el.closest('.q-tree__node');
//       while (node) {
//         const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
//         if (h) headers.push(h);
//         node = node.parentElement?.closest('.q-tree__node');
//       }
//       headers.reverse().forEach(clickExpand);
//     }, eh);

//     await page.waitForTimeout(250);
//   };

//   await expandPathToReveal(header);

//   // 3) แทน isVisible: พยายาม scroll + “ทำให้ interact ได้”
//   //    ถ้าถูกซ่อนเพราะ overflow/virtualized, scrollIntoViewIfNeeded จะช่วย render
//   await header.scrollIntoViewIfNeeded().catch(() => { });
//   await page.waitForTimeout(200);

//   // 4) เช็คว่า “คลิกได้จริง” (ไม่ต้อง visible)
//   //    ถ้าคลิกผ่าน locator ไม่ได้ ให้ยิง click ผ่าน evaluate
//   const tryClick = async () => {
//     try {
//       await header.click({ force: true, timeout: 3000 });
//       return true;
//     } catch (_) {
//       const eh = await header.elementHandle();
//       if (!eh) return false;
//       try {
//         await page.evaluate((el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })), eh);
//         return true;
//       } catch (_) {
//         return false;
//       }
//     }
//   };

//   await expect
//     .poll(async () => await tryClick(), {
//       timeout: t,
//       intervals: [500, 1000, 2000],
//       message: `Plan header exists but cannot be interacted: แผนพัฒนา: ${planTitle}`,
//     })
//     .toBe(true);

//   return header;
// }

// export async function findPlanHeaderInTree(page, planTitle, timeout = 45000) {
//   const tree = page.getByTestId('plan-tree');
//   await expect(tree).toBeVisible({ timeout });

//   // Escape title for safe regex
//   const escaped = planTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   const regex = new RegExp(`แผนพัฒนา:\\s*${escaped}`);

//   const header = tree
//     .locator('.q-tree__node-header')
//     .filter({ hasText: regex })
//     .first();

//   // Step 1: Make sure the header exists in DOM at all
//   await expect.poll(async () => await header.count(), {
//     timeout,
//     intervals: [400, 800, 1500],
//     message: `Plan header "แผนพัฒนา: ${planTitle}" never appeared in DOM`,
//   }).toBeGreaterThan(0);

//   // Step 2: Force-expand all the way up to this node
//   await page.evaluate(async (selectorText) => {
//     const header = [...document.querySelectorAll('.q-tree__node-header')]
//       .find(el => el.textContent.match(new RegExp(`แผนพัฒนา:\\s*${selectorText}`)));

//     if (!header) return;

//     let current = header.closest('.q-tree__node');
//     const toExpand = [];

//     while (current) {
//       const parentHeader = current.parentElement?.closest('.q-tree__node')?.querySelector(':scope > .q-tree__node-header[aria-expanded]');
//       if (parentHeader && parentHeader.getAttribute('aria-expanded') === 'false') {
//         toExpand.push(parentHeader);
//       }
//       current = current.parentElement?.closest('.q-tree__node');
//     }

//     // Expand from root → leaf
//     toExpand.reverse().forEach(h => {
//       const arrow = h.querySelector('.q-tree__arrow');
//       (arrow || h).click();
//     });
//   }, planTitle.replace(/"/g, '\\"'));

//   // Small breathing room after programmatic expand
//   await page.waitForTimeout(400);

//   // Step 3: Now poll for visibility — much more likely to succeed
//   await expect.poll(async () => {
//     try {
//       return await header.isVisible();
//     } catch {
//       return false;
//     }
//   }, {
//     timeout: timeout / 2,           // give remaining time
//     intervals: [300, 600, 1200],
//     message: `Plan header found but never became visible: "แผนพัฒนา: ${planTitle}"`
//   }).toBe(true);

//   // Final safety scroll
//   await header.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => { });

//   return header;
// }

// export async function findPlanHeaderInTree(page, planTitle, t = 45000) {
//   const tree = page.getByTestId('plan-tree');
//   await expect(tree).toBeVisible({ timeout: t });

//   const escaped = planTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//   const re = new RegExp(`แผนพัฒนา:\\s*${escaped}`);

//   const header = tree
//     .locator('.q-tree__node-header')
//     .filter({ hasText: re })
//     .first();

//   // 1. รอให้ header ปรากฏใน DOM ก่อน (สำคัญ!)
//   await expect.poll(async () => await header.count(), {
//     timeout: t,
//     intervals: [400, 800, 1500],
//     message: `ไม่พบ header "แผนพัฒนา: ${planTitle}" ใน DOM เลย`,
//   }).toBeGreaterThan(0);

//   // 2. Force expand ทุก ancestor ด้วย JavaScript (เสถียรที่สุด)
//   await page.evaluate((targetTitle) => {
//     const headers = Array.from(document.querySelectorAll('.q-tree__node-header'));
//     const target = headers.find(h => h.textContent.match(new RegExp(`แผนพัฒนา:\\s*${targetTitle}`)));

//     if (!target) return;

//     let node = target.closest('.q-tree__node');
//     const toExpand = [];

//     while (node) {
//       const parent = node.parentElement?.closest('.q-tree__node');
//       if (!parent) break;

//       const parentHeader = parent.querySelector(':scope > .q-tree__node-header[aria-expanded]');
//       if (parentHeader && parentHeader.getAttribute('aria-expanded') === 'false') {
//         toExpand.push(parentHeader);
//       }
//       node = parent;
//     }

//     // Expand จาก root → leaf
//     toExpand.reverse().forEach(h => {
//       const arrow = h.querySelector('.q-tree__arrow');
//       (arrow || h).click();  // ใช้ click บน arrow ก่อน ถ้าไม่มีใช้ header
//     });
//   }, escaped);

//   // รอให้ Quasar render / animation เสร็จ (สำคัญมาก!)
//   await page.waitForTimeout(800);  // เพิ่มจาก 200 → 800 เพื่อความปลอดภัย

//   // 3. Poll visibility หลัง expand แล้ว
//   await expect.poll(async () => await header.isVisible().catch(() => false), {
//     timeout: t / 1.5,  // เหลือเวลาพอสมควร
//     intervals: [300, 600, 1200],
//     message: `พบ header แล้ว แต่ยังไม่ visible หลัง force expand: "แผนพัฒนา: ${planTitle}"`
//   }).toBe(true);

//   await header.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => { });

//   return header;
// }

export async function findPlanHeaderInTree(page, planTitle, t = 45000) {
  const tree = page.getByTestId('plan-tree');
  await expect(tree).toBeVisible({ timeout: t });

  const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(planTitle)}`);
  const header = tree
    .locator('.q-tree__node-header')
    .filter({ hasText: re })
    .first();

  // 1. รอจน header มีอยู่ใน DOM (สำคัญที่สุด!)
  await expect.poll(async () => await header.count(), {
    timeout: t,
    intervals: [400, 800, 1500, 2500],
    message: `ไม่พบ header ใน DOM เลย: "${planTitle}"`,
  }).toBeGreaterThan(0);

  // 2. Force expand ทุก ancestor (รวมตัว header เองถ้ามีลูก)
  await expandPathToReveal(header);

  // 3. Scroll + รอ Quasar animation/re-render (สำคัญมากสำหรับ transition)
  await header.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => { });
  await page.waitForTimeout(1200); // รอ transition + potential re-render

  // 4. Poll isVisible() ด้วย buffer มากขึ้น
  await expect.poll(async () => {
    try {
      return await header.isVisible();
    } catch {
      return false;
    }
  }, {
    timeout: 25000,
    intervals: [500, 1000, 2000],
    message: `Header พบใน DOM แต่ยังไม่ visible หลัง expand หมดแล้ว: "${planTitle}"`,
  }).toBe(true);

  console.log(`✓ Success: Header visible → แผนพัฒนา: ${planTitle}`);
  return header;
}

export const expandPathToReveal = async (headerLocator) => {
  const eh = await headerLocator.elementHandle();
  if (!eh) throw new Error('Cannot get element handle for header');

  await page.evaluate((targetElement) => {
    function expandHeader(h) {
      if (!h) return;
      const currentExpanded = h.getAttribute('aria-expanded');
      if (currentExpanded === 'false') {
        const arrow = h.querySelector('.q-tree__arrow');
        const target = arrow || h; // ถ้าไม่มี arrow คลิก header เอง
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    }

    // หา headers ของทุก ancestor รวมตัวเป้าหมาย
    const headers = [];
    let node = targetElement.closest('.q-tree__node');
    while (node) {
      const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
      if (h) headers.push(h);
      node = node.parentElement?.closest('.q-tree__node');
    }

    // Expand จาก root ลงลึกสุด + retry 3 รอบ (กัน miss)
    for (let attempt = 0; attempt < 3; attempt++) {
      headers.reverse().forEach(expandHeader);
      // รอ animation ของ Quasar (ปกติ 200-400ms)
      const start = performance.now();
      while (performance.now() - start < 450) { } // sync delay ~450ms
    }
  }, eh);

  // รอหลังจาก evaluate ให้ browser update DOM จริง
  await page.waitForTimeout(1200);
};

/**
 * Expand ทุก ancestor ของ locator ที่ให้มา + ตัวมันเองถ้ามีลูกศร
 * @param {Page} page - Playwright page
 * @param {Locator} targetLocator - locator ของ header หรือ node ที่ต้องการทำให้ visible
 * @param {number} [maxRetries=3] - จำนวนครั้งที่ retry การ expand
 * @param {number} [animationDelay=450] - รอ animation แต่ละครั้ง (ms)
 */
// async function forceExpandAllAncestors(page, targetLocator, maxRetries = 3, animationDelay = 450) {
//   const targetHandle = await targetLocator.elementHandle();
//   if (!targetHandle) {
//     throw new Error('Target locator not found in DOM');
//   }

//   await page.evaluate(async ({ target, maxRetries, delay }) => {
//     function expand(header) {
//       if (!header) return;
//       const expanded = header.getAttribute('aria-expanded');
//       if (expanded === 'false') {
//         const arrow = header.querySelector('.q-tree__arrow');
//         const clickTarget = arrow || header;
//         clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
//       }
//     }

//     // หา headers ของทุก ancestor + ตัว target
//     const headers = [];
//     let current = target.closest('.q-tree__node');
//     while (current) {
//       const header = current.querySelector(':scope > .q-tree__node-header[aria-expanded]');
//       if (header) headers.push(header);
//       current = current.parentElement?.closest('.q-tree__node');
//     }

//     // Expand จาก root ลงลึกสุด + retry หลายรอบ
//     for (let attempt = 0; attempt < maxRetries; attempt++) {
//       headers.reverse().forEach(expand);
//       // รอ animation (ใช้ setTimeout แบบ async ใน evaluate)
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }, {
//     target: targetHandle,
//     maxRetries,
//     delay: animationDelay
//   });

//   // รอหลังจาก evaluate ให้ UI update เสร็จจริง ๆ
//   await page.waitForTimeout(1200);
// }
/**
 * Expand ทุก ancestor ของ locator ที่ให้มา + ตัวมันเองถ้ามีลูกศร
 * พร้อม retry, scroll, และ debug log
 */
export async function forceExpandAllAncestors(page, targetLocator, options = {}) {
  const {
    maxRetries = 4,
    animationDelay = 500,      // เพิ่มจาก 450 เป็น 500 เพื่อความปลอดภัย
    maxWaitAfter = 2000,       // รอสูงสุดหลัง expand ทั้งหมด
    debug = true               // เปิด log เพื่อ debug
  } = options;

  const targetHandle = await targetLocator.elementHandle();
  if (!targetHandle) {
    throw new Error('Target locator not found in DOM');
  }

  // Debug ก่อนเริ่ม
  if (debug) {
    console.log('[expand] Starting force expand for target');
  }

  await page.evaluate(async ({ target, maxRetries, delay, debug }) => {
    function expand(header) {
      if (!header) return false;
      const wasCollapsed = header.getAttribute('aria-expanded') === 'false';
      if (!wasCollapsed) return true; // ขยายอยู่แล้ว ไม่ต้องทำอะไร

      const arrow = header.querySelector('.q-tree__arrow');
      const clickTarget = arrow || header;

      // คลิกจริง ๆ
      clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      return wasCollapsed; // คืนว่ามีการคลิกจริงหรือไม่
    }

    // หา headers ของทุก ancestor + ตัว target
    const headers = [];
    let current = target.closest('.q-tree__node');
    while (current) {
      const header = current.querySelector(':scope > .q-tree__node-header[aria-expanded]');
      if (header) headers.push(header);
      current = current.parentElement?.closest('.q-tree__node');
    }

    if (debug) {
      console.log('[expand] Found', headers.length, 'expandable headers');
    }

    // Expand จาก root ลงลึกสุด + retry
    let expandedCount = 0;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      headers.reverse().forEach((header, index) => {
        if (expand(header)) {
          expandedCount++;
          // พยายาม scroll node นี้ให้เห็น (ช่วยในกรณี virtualization)
          header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      if (debug && attempt === 0) {
        console.log('[expand] Attempt', attempt + 1, ': expanded', expandedCount, 'nodes');
      }

      // รอ animation แบบ sync (เสถียรกว่า async ใน evaluate)
      const start = performance.now();
      while (performance.now() - start < delay) { }
    }

    if (debug) {
      console.log('[expand] Completed', maxRetries, 'attempts. Total expanded:', expandedCount);
    }
  }, {
    target: targetHandle,
    maxRetries,
    delay: animationDelay,
    debug
  });

  // รอหลังจาก evaluate ให้ UI update เสร็จ + มี buffer
  await page.waitForTimeout(maxWaitAfter);

  // Optional: ลอง scroll target อีกครั้งหลังจากทั้งหมด
  await targetLocator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => { });

  if (debug) {
    const isVisible = await targetLocator.isVisible().catch(() => false);
    console.log('[expand] Final visibility of target:', isVisible);
  }
}

/**
 * คลิก expand ทุก node ที่ยัง collapse อยู่ใน tree (จากบนลงล่าง)
 * วนลูปหลายรอบเพื่อให้แน่ใจว่าทุก branch เปิดหมด
 */
export async function expandAllExpandableNodes(page, treeLocator, options = {}) {
  const {
    maxRounds = 5,             // จำนวนรอบวนทั้ง tree
    delayPerClick = 400,       // รอหลังคลิกแต่ละครั้ง (ms)
    debug = true
  } = options;

  if (debug) console.log('[expand-all] Starting full tree expansion...');

  for (let round = 1; round <= maxRounds; round++) {
    if (debug) console.log(`[expand-all] Round ${round}/${maxRounds}`);

    // หา header ทุกตัวที่ยัง collapse (aria-expanded="false")
    const collapsedHeaders = treeLocator
      .locator('.q-tree__node-header[aria-expanded="false"]')
      .filter({ has: treeLocator.locator('.q-tree__arrow') }); // มีลูกศรเท่านั้น

    const count = await collapsedHeaders.count();

    if (count === 0) {
      if (debug) console.log('[expand-all] No more collapsed nodes found → done');
      break;
    }

    if (debug) console.log(`[expand-all] Found ${count} collapsed nodes in round ${round}`);

    // คลิกทีละตัว (จากบนลงล่าง เพื่อไม่ให้ miss)
    for (let i = 0; i < count; i++) {
      const header = collapsedHeaders.nth(i);

      // Scroll ให้เห็นก่อน (สำคัญมากใน tree ยาว)
      await header.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => { });

      // คลิก expand
      const arrow = header.locator('.q-tree__arrow').first();
      if (await arrow.isVisible()) {
        await arrow.click({ force: true, timeout: 5000 }).catch(e => {
          console.warn('[expand-all] Click failed on node', i, e.message);
        });
      } else {
        await header.click({ force: true, timeout: 5000 }).catch(() => { });
      }

      // รอ animation เล็กน้อย
      await page.waitForTimeout(delayPerClick);
    }

    // รอให้ tree update หลังรอบหนึ่ง
    await page.waitForTimeout(800);
  }

  // รอสุดท้ายให้ UI เสถียร
  await page.waitForTimeout(1200);

  if (debug) console.log('[expand-all] Expansion completed');
}
