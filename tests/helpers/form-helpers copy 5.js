import { expect } from '@playwright/test';

/**
 * Shared Helper Functions for Quasar/Vue Playwright Tests
 * - Robust Quasar q-select handling
 * - Stable waits for Quasar loading
 * - Dialog helpers
 * - Table helpers
 * - QTree helpers
 */

/* ---------------------------
 * Utilities
 * --------------------------- */

export function escapeRegExp(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function uniq(prefix = 'ทักษะ-IT') {
  const ts = new Date().toISOString().replace(/[:.TZ-]/g, '');
  return `${prefix}-${ts}`;
}

/**
 * Get a usable input locator from a data-testid that might be on:
 * - the <input>/<textarea> itself, OR
 * - a wrapper (q-field / label / div)
 */
export async function getInputByTestId(page, testId) {
  const node = page.getByTestId(testId);
  const isInput = await node
    .evaluate(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
    .catch(() => false);

  return isInput
    ? node
    : node.locator('input.q-field__native, textarea.q-field__native, input, textarea').first();
}

/* ---------------------------
 * Quasar idle / notification
 * --------------------------- */

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
  if (!page || page.isClosed()) return;

  // นับเฉพาะ “loading overlay จริง”
  const SPINNER_SEL =
    '.q-inner-loading--showing:visible .q-spinner, ' +
    '.q-inner-loading--showing:visible .q-spinner-dots, ' +
    '.q-loading:visible .q-spinner, ' +
    '.q-loading:visible .q-spinner-dots';

  const INNER_LOADING_SEL = '.q-inner-loading--showing:visible, .q-loading:visible';

  const LINEAR_SEL =
    '.q-linear-progress[role="progressbar"]:visible, ' +
    '.q-linear-progress--indeterminate:visible';

  await expect
    .poll(async () => {
      if (page.isClosed()) return 0;

      let total = 0;
      if (!ignoreSpinners) total += await page.locator(SPINNER_SEL).count().catch(() => 0);
      if (!ignoreInnerLoading) total += await page.locator(INNER_LOADING_SEL).count().catch(() => 0);
      if (!ignoreLinear) total += await page.locator(LINEAR_SEL).count().catch(() => 0);

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

/* ---------------------------
 * Dialog helpers
 * --------------------------- */

export async function closeDialogIfPresent(page, timeout = 3_000) {
  const t = Number(timeout) || 3_000;
  const dialog = page.locator('.q-dialog:visible').last();
  if (await dialog.count().catch(() => 0)) {
    const closeBtn = dialog.locator('button').filter({ hasText: /ปิด|Close|ยกเลิก/i }).first();
    if (await closeBtn.count().catch(() => 0)) {
      await closeBtn.click({ force: true }).catch(() => { });
      await expect(dialog).toBeHidden({ timeout: t }).catch(() => { });
    }
  }
}

export async function confirmDialog(
  page,
  { buttonPattern = /OK|ตกลง|ยืนยัน|Confirm|ใช่/i, timeout = 20_000 } = {}
) {
  const t = Number(timeout) || 20_000;
  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });

  const okBtn = dialog.locator('button').filter({ hasText: buttonPattern }).first();
  await expect(okBtn).toBeVisible({ timeout: t });
  await okBtn.click({ force: true });
}

/**
 * รอให้ dialog “พร้อมใช้งานจริง” โดยรอ field ที่รู้ว่าอยู่ใน dialog
 */
export async function waitForDialogReady(page, timeout = 20_000, { readyTestId = 'select-target-career' } = {}) {
  const t = Number(timeout) || 20_000;
  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });

  const readyEl = page.getByTestId(readyTestId);
  await expect(readyEl, `รอ dialog field (${readyTestId}) ให้พร้อมใช้งาน`).toBeVisible({ timeout: t });

  // บางหน้ามี enable ช้า ไม่ต้อง fail ทันที
  await expect(readyEl).toBeEnabled({ timeout: Math.floor(t / 2) }).catch(() => { });
  await page.waitForTimeout(250);
}

/* ---------------------------
 * Navigation helpers
 * --------------------------- */

export async function ensureDrawerOpen(page, timeout = 10_000) {
  const t = Number(timeout) || 10_000;

  const drawer = page.locator('.q-drawer').first();
  if (!(await drawer.isVisible().catch(() => false))) {
    const menuBtn = page.getByLabel('Menu').first();
    if (await menuBtn.count().catch(() => 0)) {
      await menuBtn.click({ force: true }).catch(() => { });
    } else {
      await page
        .locator('button:has(i.material-icons:has-text("menu")), button:has(.material-icons:has-text("menu"))')
        .first()
        .click({ force: true })
        .catch(() => { });
    }
    await drawer.waitFor({ state: 'visible', timeout: t });
  }
}

export async function gotoRoute(page, baseUrl, path, { idleTimeout = 45_000 } = {}) {
  const t = Number(idleTimeout) || 45_000;
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: t }).catch(() => { });
  await waitForQuasarIdle(page, t).catch(() => { });
}

/* ---------------------------
 * Form input helpers
 * --------------------------- */

export async function fillTextInput(page, label, value) {
  await page.getByLabel(label).fill(String(value));
}

export async function checkCheckbox(page, testId, timeout = 20_000) {
  await setQuasarCheckbox(page, testId, true, timeout);
}

export async function uncheckCheckbox(page, testId, timeout = 20_000) {
  await setQuasarCheckbox(page, testId, false, timeout);
}

/**
 * Robust toggle for Quasar q-checkbox where native input is hidden.
 */
export async function setQuasarCheckbox(page, testId, desired, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const deadline = Date.now() + t;

  const root = page.getByTestId(testId);
  await expect(root).toBeVisible({ timeout: t });
  await root.scrollIntoViewIfNeeded().catch(() => { });

  const rootRole = await root.getAttribute('role').catch(() => null);
  const roleCb = rootRole === 'checkbox' ? root : root.locator('[role="checkbox"]').first();
  const hasRole = rootRole === 'checkbox' || (await roleCb.count().catch(() => 0)) > 0;

  const getState = async () => {
    if (hasRole) {
      const aria = await roleCb.getAttribute('aria-checked').catch(() => null);
      if (aria === 'true') return true;
      if (aria === 'false') return false;
      if (aria === 'mixed') return true;
    }
    const cls = (await root.getAttribute('class').catch(() => '')) || '';
    return /q-checkbox__inner--truthy|q-checkbox--truthy|q-checkbox--checked/i.test(cls);
  };

  const target = hasRole
    ? roleCb
    : (await root.locator('.q-checkbox__inner').count().catch(() => 0))
      ? root.locator('.q-checkbox__inner').first()
      : root;

  while (Date.now() < deadline) {
    const cur = await getState();
    if (cur === desired) return;

    await target.focus().catch(() => { });
    await page.keyboard.press('Space').catch(() => { });
    await waitForQuasarIdle(page, 3_000).catch(() => { });

    const cur2 = await getState();
    if (cur2 === desired) return;

    await target.click({ force: true }).catch(() => { });
    await waitForQuasarIdle(page, 3_000).catch(() => { });

    const cur3 = await getState();
    if (cur3 === desired) return;

    await page.waitForTimeout(120);
  }

  throw new Error(`Timeout setting checkbox ${testId} to ${desired}`);
}

/**
 * ✅ Robust helper for "จบการศึกษา" + "ปีที่จบ"
 */
export async function checkGraduatedAndFillYear(
  page,
  {
    checkboxTestId = 'checkbox-graduated',
    gradInputTestId = 'input-graduation-date',
    year = '2568',
    timeout = 45_000
  } = {}
) {
  const t = Number(timeout) || 45_000;

  await setQuasarCheckbox(page, checkboxTestId, true, t);

  const input = await getInputByTestId(page, gradInputTestId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  await input.click({ force: true });
  await input.fill(String(year));
  await expect(input).toHaveValue(String(year), { timeout: t });

  await waitForQuasarIdle(page, 3_000).catch(() => { });
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

  await waitForQuasarIdle(page, 3_000).catch(() => { });
}

/* ---------------------------
 * Quasar q-select helpers
 * --------------------------- */

/**
 * Robust q-select by label text in .q-field
 */
export async function selectQuasarOption(
  page,
  fieldLabel,
  optionTextOrRegex,
  { searchText = null, timeout = 30_000 } = {}
) {
  const t = Number(timeout) || 30_000;

  const field = page.locator('.q-field').filter({ hasText: fieldLabel }).first();
  await field.waitFor({ state: 'visible', timeout: t });
  await field.scrollIntoViewIfNeeded().catch(() => { });

  // ต้องไม่ disabled
  await expect(field).not.toHaveClass(/q-field--disabled|disabled/i, { timeout: t });

  // เปิดเมนู
  const control = field.locator('.q-field__control').first();
  await control.click({ timeout: t }).catch(async () => {
    await control.focus().catch(() => { });
    await page.keyboard.press('ArrowDown').catch(() => { });
  });

  const menu = page.locator('.q-menu:visible').last();
  await menu.waitFor({ state: 'visible', timeout: t });

  await expect.poll(async () => await menu.locator('.q-item').count(), { timeout: t }).toBeGreaterThan(0);

  // ค้นหา
  if (searchText) {
    const fieldInput = field.locator('input').first();
    if (await fieldInput.count().catch(() => 0)) await fieldInput.focus().catch(() => { });
    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(200);
  }

  const item = menu.locator('.q-item').filter({ hasText: optionTextOrRegex }).first();
  await item.waitFor({ state: 'visible', timeout: t });
  await item.click({ force: true });

  await menu.waitFor({ state: 'hidden', timeout: t }).catch(() => { });
}

/**
 * q-select ที่ data-testid อยู่บน <input> (ใช้ใน FormPlan manual dialog)
 */
export async function openQuasarSelectByInputTestId(page, inputTestId, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

  const input = page.getByTestId(inputTestId);
  await expect(input).toBeVisible({ timeout: t });
  await expect(input).toBeEnabled({ timeout: t });

  const field = input.locator('xpath=ancestor::label[contains(@class,"q-field")][1]');
  await expect(field).toBeVisible({ timeout: t });

  // ปิดเมนูค้าง
  await page.keyboard.press('Escape').catch(() => { });
  await page.waitForTimeout(50);

  const icon = field.locator('.q-select__dropdown-icon').first();
  const control = field.locator('.q-field__control').first();

  if (await icon.count().catch(() => 0)) {
    await icon.click({ force: true });
  } else {
    await control.click({ force: true });
  }

  await input.focus().catch(() => { });
  await page.keyboard.press('ArrowDown').catch(() => { });

  await expect(input).toHaveAttribute('aria-expanded', 'true', { timeout: t }).catch(() => { });

  const lbId = await input.getAttribute('aria-controls');
  if (!lbId) throw new Error(`No aria-controls on q-select input testid=${inputTestId}`);

  const listbox = page.locator(`#${lbId}`);
  await expect(listbox).toBeVisible({ timeout: t });

  const items = listbox.locator('.q-item');
  await expect.poll(async () => await items.count(), { timeout: t }).toBeGreaterThan(0);

  return { listbox, items, input };
}

export async function openQuasarSelectFromDialogAndPick(dialog, page, testId, valueOrIndex = 0, cfg = {}) {
  const { timeout = 30_000, waitAfter = 300 } = cfg;

  const inputHost = dialog.getByTestId(testId);
  await expect(inputHost).toBeVisible({ timeout });

  // ✅ 1) รอให้ enabled จริง (Quasar disabled class)
  await expect.poll(async () => {
    const disabled = await inputHost.isDisabled().catch(() => true);
    if (disabled) return false;

    const fieldEl = await inputHost.evaluateHandle(el => el.closest('.q-field')).catch(() => null);
    if (!fieldEl) return false;

    const hasDisabledClass = await fieldEl.evaluate(el => el?.classList.contains('q-field--disabled')).catch(() => true);
    return !hasDisabledClass;
  }, { timeout, intervals: [300, 600, 1000] }).toBe(true);

  // ✅ 2) โฟกัสที่ input combobox จริง ๆ (อย่าคลิก wrapper อย่างเดียว)
  const qField = inputHost.locator('xpath=ancestor::div[contains(@class,"q-field")][1]');
  const combo = qField.locator('input[role="combobox"], input').first();

  // helper: ลองเปิดเมนูหลายวิธี
  const tryOpen = async () => {
    // A) click combobox
    if (await combo.count().catch(() => 0)) {
      await combo.click({ force: true }).catch(() => { });
    } else {
      await inputHost.click({ force: true }).catch(() => { });
    }

    // B) ArrowDown เพื่อ force render เมนู (สำคัญมากสำหรับ q-select)
    await page.keyboard.press('ArrowDown').catch(() => { });
    await page.waitForTimeout(120);

    // C) ถ้ายังไม่มา ลอง click dropdown icon
    const ddIcon = qField.locator('.q-select__dropdown-icon, .q-field__append .q-icon').first();
    if (await ddIcon.isVisible().catch(() => false)) {
      await ddIcon.click({ force: true }).catch(() => { });
      await page.waitForTimeout(120);
    }
  };

  // helper: หา listbox (3 ชั้น fallback)
  const resolveListbox = async () => {
    // 1) aria-controls (ดีที่สุด)
    const ariaControls = await combo.getAttribute('aria-controls').catch(() => null)
      || await inputHost.getAttribute('aria-controls').catch(() => null);

    if (ariaControls) {
      const byId = page.locator(`#${ariaControls}`);
      if (await byId.count().catch(() => 0)) return byId;
    }

    // 2) role=listbox ล่าสุด
    const listboxes = page.locator('[role="listbox"]');
    const lbCount = await listboxes.count().catch(() => 0);
    if (lbCount > 0) {
      // เอาตัวท้ายสุดที่ visible
      for (let i = lbCount - 1; i >= 0; i--) {
        const lb = listboxes.nth(i);
        if (await lb.isVisible().catch(() => false)) return lb;
      }
    }

    // 3) q-menu visible ล่าสุด
    const menus = page.locator('.q-menu');
    const mCount = await menus.count().catch(() => 0);
    if (mCount > 0) {
      for (let i = mCount - 1; i >= 0; i--) {
        const m = menus.nth(i);
        if (await m.isVisible().catch(() => false)) return m;
      }
    }

    return null;
  };

  // ✅ 3) ลองเปิด menu แบบ retry จนกว่าจะเจอ listbox จริง
  let listbox = null;
  await expect.poll(async () => {
    await tryOpen();
    listbox = await resolveListbox();
    return !!listbox;
  }, {
    timeout: Math.max(timeout, 20_000),
    intervals: [250, 500, 800, 1200],
    message: `Cannot open q-select menu for testId=${testId}`
  }).toBe(true);

  // ✅ 4) ตอนนี้ listbox ต้องมีจริง และ visible
  await expect(listbox).toBeVisible({ timeout: 10_000 });

  // ✅ 5) ดึงรายการ option แบบทนทุก DOM
  const options = listbox.locator('[role="option"], .q-item');
  await expect.poll(async () => await options.count(), { timeout: 15_000 }).toBeGreaterThan(0);

  if (typeof valueOrIndex === 'number') {
    const cnt = await options.count();
    await options.nth(Math.min(valueOrIndex, cnt - 1)).click({ force: true });
  } else {
    await options.filter({ hasText: valueOrIndex }).first().click({ force: true });
  }

  // ✅ 6) menu ปิด best effort
  await expect(listbox).toBeHidden({ timeout: 5_000 }).catch(() => { });
  if (waitAfter) await page.waitForTimeout(waitAfter);
}

export async function selectOptionByInputTestId(
  page,
  inputTestId,
  optionTextOrRegex,
  { searchText = null, timeout = 20_000 } = {}
) {
  const t = Number(timeout) || 20_000;
  const { items, input } = await openQuasarSelectByInputTestId(page, inputTestId, t);

  if (searchText) {
    await input.focus().catch(() => { });
    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(150);
    await expect.poll(async () => await items.count(), { timeout: t }).toBeGreaterThan(0);
  }

  const item = items.filter({ hasText: optionTextOrRegex }).first();
  await expect(item).toBeVisible({ timeout: t });
  await item.click({ force: true });
}

export async function selectFirstOptionByInputTestId(page, inputTestId, timeout = 20_000) {
  const { items } = await openQuasarSelectByInputTestId(page, inputTestId, timeout);
  await items.first().click({ force: true });
}

/**
 * เลือก career แล้วพยายามหา qualification ให้ได้อย่างน้อย 1 อัน (ใช้ใน FormPlan)
 */
export async function pickCareerAndQualification(page, timeout = 20_000) {
  const t = Number(timeout) || 20_000;

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
      // ไม่มี qual -> ลอง career ถัดไป
    }
  }

  throw new Error('No qualifications found for any of the first careers (manual dialog)');
}

/* ---------------------------
 * Table helpers
 * --------------------------- */

export async function waitForTableUpdate(page, timeout = 5_000) {
  const t = Number(timeout) || 5_000;
  await page.waitForSelector('.q-table__progress', { state: 'hidden', timeout: t }).catch(() => { });
  await page.waitForTimeout(350);
}

export async function searchInTable(page, searchText) {
  await page.getByPlaceholder('ค้นหาข้อมูลส่วนตัว').fill(String(searchText));
  await waitForTableUpdate(page);
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
  const btn = page.locator('button:has-text("เพิ่มข้อมูลด้วยตนเอง")').first();
  await expect(btn).toBeVisible({ timeout: t });
  await btn.click({ force: true });

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
  await item.click({ force: true });
  return firstLine;
}

export async function selectByTestId(
  page,
  testId,
  { optionIndex = 0, searchText = '' } = {},
  timeout = 20_000
) {
  const t = Number(timeout) || 20_000;

  const root = page.getByTestId(testId);
  await expect(root).toBeVisible({ timeout: t });

  const control = root.locator('.q-field__control');
  if (await control.count().catch(() => 0)) {
    await control.first().click({ timeout: t });
  } else {
    await root.click({ timeout: t });
  }

  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: t });

  if (searchText) {
    const inputInRoot = root.locator('input').first();
    if (await inputInRoot.count().catch(() => 0)) await inputInRoot.focus().catch(() => { });
    await page.keyboard.press('ControlOrMeta+A').catch(() => { });
    await page.keyboard.type(searchText, { delay: 30 });
    await page.waitForTimeout(200);
  }

  return await pickOptionFromMenu(page, optionIndex, t);
}

export async function typeAndEnter(page, text) {
  await page.keyboard.type(String(text));
  await page.keyboard.press('Enter');
}

export async function pickFirstFromMenu(page, inputLocator, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  await inputLocator.click({ force: true });
  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: t });
  const first = menu.locator('.q-item').first();
  await expect(first).toBeVisible({ timeout: t });

  const text = (await first.innerText()).trim().split('\n')[0];
  await first.click({ force: true });
  return text;
}

export async function createNewInSelect(page, inputLocator, newText, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  await inputLocator.click({ force: true });
  await page.keyboard.press('ControlOrMeta+A').catch(() => { });
  await page.keyboard.type(newText);

  const menu = page.locator('.q-menu:visible').last();
  await expect(menu).toBeVisible({ timeout: t });

  // 1) ถ้ามีปุ่ม/รายการ “เพิ่ม ...” หรือ “สร้าง ...”
  const addItem = menu.locator('.q-item').filter({ hasText: /เพิ่ม|สร้าง|Add/i }).first();
  if (await addItem.count()) {
    await addItem.click({ force: true });
    return;
  }

  // 2) fallback: กด Enter เผื่อ new-value-mode บน quasar
  await page.keyboard.press('Enter');
}

export async function addQualificationViaDialog(page, { qualName, groupName }, timeout = 45_000) {
  const t = Number(timeout) || 45_000;

  await openManualQualificationDialog(page, t);

  const pickedCareer = await selectByTestId(page, 'select-target-career', { optionIndex: 0 }, t);

  if (groupName) {
    const groupSelect = page.getByTestId('select-qualification-group');
    await expect(groupSelect).toBeVisible({ timeout: t });
    await groupSelect.click({ force: true });
    await typeAndEnter(page, groupName);
  }

  const qualSelect = page.getByTestId('select-qualification-name');
  await expect(qualSelect).toBeVisible({ timeout: t });
  await qualSelect.click({ force: true });
  await typeAndEnter(page, qualName);

  await confirmDialog(page, { timeout: t });

  const notif1 = await waitForNotificationText(page, t);
  expect(notif1).toMatch(/เพิ่มคุณสมบัติใหม่สำเร็จ|สำเร็จ/i);

  await waitForQuasarIdle(page, t, { ignoreSpinners: true, ignoreInnerLoading: true }).catch(() => { });

  await selectByTestId(page, 'select-target-value', { optionIndex: 0 }, t);
  await selectByTestId(page, 'select-level', { optionIndex: 0 }, t);

  const submit = page.getByTestId('btn-submit-qual');
  await expect(submit).toBeVisible({ timeout: t });
  await submit.click({ force: true });

  const notif2 = await waitForNotificationText(page, t);
  expect(notif2).toMatch(/บันทึกข้อมูลสำเร็จ|สำเร็จ/i);

  await waitForQuasarIdle(page, t, { ignoreSpinners: true, ignoreInnerLoading: true }).catch(() => { });
  return { pickedCareer };
}

/* ---------------------------
 * QTree helpers (robust)
 * --------------------------- */

export function treeNodeHeaderByText(page, text) {
  return page.locator('.q-tree .q-tree__node-header').filter({ hasText: text }).first();
}

/**
 * Expand ancestors of a target header (and itself) so it becomes revealable.
 * ✅ FIX: ต้องรับ page เป็นพารามิเตอร์ (ห้ามอ้าง page แบบ global)
 */
export async function expandPathToReveal(
  page,
  headerLocator,
  { retries = 3, stepDelay = 450, afterDelay = 600 } = {}
) {
  const eh = await headerLocator.elementHandle();
  if (!eh) return false;

  await page.evaluate(
    ({ el, retries, stepDelay }) => {
      function clickExpand(h) {
        if (!h) return;
        if (h.getAttribute('aria-expanded') === 'false') {
          const arrow = h.querySelector('.q-tree__arrow');
          (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
      }

      const headers = [];
      let node = el.closest('.q-tree__node');
      while (node) {
        const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
        if (h) headers.push(h);
        node = node.parentElement?.closest('.q-tree__node');
      }

      // expand จาก root -> leaf และ retry กัน miss
      for (let i = 0; i < retries; i++) {
        headers.slice().reverse().forEach(clickExpand);

        // sync delay (กัน transition/virtualization)
        const start = performance.now();
        while (performance.now() - start < stepDelay) { }
      }
    },
    { el: eh, retries, stepDelay }
  );

  await page.waitForTimeout(afterDelay);
  return true;
}

/**
 * Ensure a node header containing `text` becomes visible.
 * - พยายาม expand หลายชั้น + scroll
 */
export async function ensureTreeNodeHeaderVisible(
  page,
  text,
  timeout = 45_000,
  { treeSelector = '.q-tree' } = {}
) {
  const t = Number(timeout) || 45_000;

  const tree = page.locator(treeSelector).first();
  await expect(tree).toBeVisible({ timeout: t });

  const header = tree.locator('.q-tree__node-header').filter({ hasText: text }).first();

  // ต้องโผล่ใน DOM ก่อน
  await expect.poll(async () => await header.count().catch(() => 0), { timeout: t }).toBeGreaterThan(0);

  // expand path
  await expandPathToReveal(page, header).catch(() => { });

  await header.scrollIntoViewIfNeeded().catch(() => { });
  await page.waitForTimeout(200);

  // รอ visible จริง (ถ้าหน้ามี virtualization จะช่วยได้มาก)
  await expect
    .poll(async () => await header.isVisible().catch(() => false), { timeout: t })
    .toBe(true);

  return header;
}

/**
 * Click action button (edit/delete) inside the target node header.
 */
export async function clickTreeAction(page, nodeText, action /* 'edit' | 'delete' */, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  const header = await ensureTreeNodeHeaderVisible(page, nodeText, t);
  const iconName = action === 'delete' ? 'delete' : 'edit';

  const btn = header
    .locator(`button:has(i.material-icons:text("${iconName}")), button:has(.material-icons:text("${iconName}"))`)
    .first();

  await expect(btn).toBeVisible({ timeout: t });
  await btn.click({ force: true });
  return header;
}

export async function clickTreeEdit(page, nodeText, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  await clickTreeAction(page, nodeText, 'edit', t);
  const dialog = page.locator('.q-dialog:visible').last();
  await expect(dialog).toBeVisible({ timeout: t });
  await expect(dialog).toContainText(/แก้ไขข้อมูล|แก้ไข/);
}

export async function clickTreeDelete(page, nodeText, timeout = 20_000) {
  const t = Number(timeout) || 20_000;
  await clickTreeAction(page, nodeText, 'delete', t);
  await confirmDialog(page, { timeout: t });
}

/**
 * Find plan header in plan-tree for title
 * Uses expandPathToReveal() and robust polling.
 */
export async function findPlanHeaderInTree(page, planTitle, timeout = 45_000) {
  const t = Number(timeout) || 45_000;

  const tree = page.getByTestId('plan-tree');
  await expect(tree).toBeVisible({ timeout: t });

  // รอให้มี node ก่อน
  await expect
    .poll(async () => await tree.locator('.q-tree__node').count().catch(() => 0), { timeout: t })
    .toBeGreaterThan(0);

  const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(planTitle)}`);
  const header = tree.locator('.q-tree__node-header').filter({ hasText: re }).first();

  // ต้องเจอใน DOM ก่อน
  await expect.poll(async () => await header.count().catch(() => 0), {
    timeout: t,
    intervals: [400, 800, 1500, 2500],
    message: `ไม่พบ plan header ใน DOM: "${planTitle}"`
  }).toBeGreaterThan(0);

  await expandPathToReveal(page, header).catch(() => { });
  await header.scrollIntoViewIfNeeded().catch(() => { });
  await page.waitForTimeout(250);

  await expect
    .poll(async () => await header.isVisible().catch(() => false), {
      timeout: Math.min(25_000, t),
      intervals: [500, 1000, 2000],
      message: `พบ header แล้ว แต่ยังไม่ visible: "${planTitle}"`
    })
    .toBe(true);

  return header;
}

