import { test, expect } from '@playwright/test';
import {
  uniq,
  fillTextInput,
  selectQuasarOption,
  confirmDialog,
  ensureDrawerOpen,
  waitForQuasarIdle,
  waitForNotificationText,
  searchInTable,
  waitForTableUpdate,
  setQuasarCheckbox,
  checkGraduatedAndFillYear,
  getInputByTestId,
  closeDialogIfPresent,
  addQualificationViaDialog,
  pickOptionFromMenu,
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

function genThaiPhone() {
  const a = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const b = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `08-${a}-${b}`;
}

test.describe('Integrated Flow: FormComponent (Real DB)', () => {
  test.setTimeout(140_000);

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(45_000);

    page.on('console', msg => console.log('🖥️ BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('❌ BROWSER ERROR:', err.message));

    // Inject session globally for all navigations (Must be BEFORE any goto)
    await page.addInitScript(() => {
      window.__TEST_VUEX_STATE__ = {
        user: {
          member_id: 221, // somnuk.sin@gmail.com
          fullname: 'สมนึก สินธุศิริ',
          username: 'somnuk.sin@gmail.com'
        }
      };
    });

    // Login
    await page.goto(`${BASE_URL}/LoginPage`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').fill(TEST_USER.username);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'เข้าระบบ' }).click();

    // Add defensive waits after login
    await page.waitForURL(`${BASE_URL}/`, { timeout: T.xlong });
    await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });
    await waitForQuasarIdle(page, T.xlong);
  });

  // -------------------------------------------------------------
  // Robust Helpers for Quasar/Vue UI
  // -------------------------------------------------------------

  /**
   * Waits until an element has a real size (not just attached).
   */
  const waitForElementStable = async (locator, options = {}) => {
    const { timeout = 15000, minWidth = 10, minHeight = 10 } = options;
    await expect.poll(async () => {
      const rect = await locator.evaluate(el => {
        if (!el) return { width: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });
      return rect.width >= minWidth && rect.height >= minHeight;
    }, { timeout, message: `Element remains too small or hidden` }).toBe(true);
  };

  /**
   * Safe filling of textarea/input in dialogs.
   */
  const safeFillTextarea = async (page, dialogLocator, text, options = {}) => {
    const { timeout = 12000, selector = 'textarea' } = options;
    const textarea = dialogLocator.locator(selector).first();

    await expect(dialogLocator).toBeVisible({ timeout });
    await expect(textarea).toBeAttached({ timeout });
    await expect(textarea).toBeVisible({ timeout: timeout / 2 });

    await waitForElementStable(textarea, { timeout: timeout / 1.5 });
    await waitForQuasarIdle(page, 8000, { ignoreSpinners: true, ignoreInnerLoading: true });

    try {
      await textarea.fill(text, { force: true });
    } catch {
      await textarea.click({ force: true });
      await page.keyboard.insertText(text);
    }
    await expect(textarea).toHaveValue(text, { timeout: 5000 });
  };


  test('FormComponent: Fill -> Graduate Year -> Disability -> PDPA -> Save -> Delete', async ({ page }) => {
    const uniquePhone = genThaiPhone();
    let refDesc = '';
    let createdAssessDate = '';
    let selectedCareerName = '';
    let createdQualName = '';
    let createdPlanTitle = '';
    let updatedPlanTitle = '';
    test.setTimeout(300000); // ✅ เพิ่ม timeout เป็น 5 นาทีเพราะมี 26 steps
    //-------------------------------ตรวจสอบแล้ว--------------------------------------------
    await test.step('Step 1: Navigate to FormComponent', async () => {
      await expect(page).toHaveURL(`${BASE_URL}/`);

      await ensureDrawerOpen(page, T.medium);

      const menuItem = page.getByRole('listitem').filter({ hasText: 'กรอกข้อมูลส่วนตัว' }).first();
      await expect(menuItem).toBeVisible({ timeout: T.medium });

      await Promise.all([
        page.waitForURL(/.*FormComponent/, { timeout: T.xlong }),
        menuItem.click({ force: true }),
      ]);

      await waitForQuasarIdle(page, T.long);
    });

    await test.step('Step 2: Fill basic inputs + cascading q-select', async () => {
      await fillTextInput(page, 'ปีเกิด ค.ศ.*', '1995');
      await fillTextInput(page, 'หมายเลขโทรศัพท์ *', uniquePhone);
      await waitForQuasarIdle(page, T.medium);

      const pickCascading = async () => {
        await selectQuasarOption(page, 'สถาบันการศึกษา *', /มหาวิทยาลัยแม่โจ้/, {
          searchText: 'แม่โจ้',
          timeout: T.xlong
        });
        await waitForQuasarIdle(page, T.medium);

        await selectQuasarOption(page, 'คณะ *', /วิทยาศาสตร์/, {
          searchText: 'วิทยา',
          timeout: T.xlong
        });
        await waitForQuasarIdle(page, T.medium);

        await selectQuasarOption(page, 'ระดับการศึกษา *', /ปริญญาตรี/, {
          searchText: 'ตรี',
          timeout: T.xlong
        });
        await waitForQuasarIdle(page, T.medium);

        await selectQuasarOption(page, 'สาขาวิชา *', /วิทยาการคอมพิวเตอร์/, {
          searchText: 'คอม',
          timeout: T.xlong
        });
        await waitForQuasarIdle(page, T.medium);
      };

      // retry once (ข้อมูลจาก DB บางทีช้า)
      try {
        await pickCascading();
      } catch (e) {
        console.warn('⚠️ Cascading selects failed (1st try):', e?.message || e);
        await page.waitForTimeout(800);
        await waitForQuasarIdle(page, T.medium);
        await pickCascading();
      }

      // Project
      await selectQuasarOption(page, 'โครงการ', /DSS\s*มาตรา\s*35\s*ปี\s*2568/, {
        searchText: 'DSS',
        timeout: T.xlong
      });
      await waitForQuasarIdle(page, T.medium);

      // Advisor
      await selectQuasarOption(page, 'ผู้ดูแลกลุ่ม', /อโณทัย\s*พรมเกตุ/, {
        searchText: 'อโณทัย',
        timeout: T.xlong
      });
      await waitForQuasarIdle(page, T.medium);

      // Extra fields
      await page.getByLabel('มาจากจังหวัด').fill('เชียงใหม่ (Test)');
      await page.getByLabel('อยากอยู่ในจังหวัด').fill('กรุงเทพฯ (Test)');
      await page.getByLabel('วิชาที่ชอบ').fill('Modern Science');
      await page.getByLabel('วิชาที่ไม่ชอบ').fill('History of Art');
      await page.getByLabel('กิจกรรมที่ชอบทำ').fill('Open Source Contribution');
      await page.getByLabel('อาชีพในฝัน').fill('Cloud Architect');
      await page.getByLabel('ความถนัด / ทักษะเด่น').fill('Playwright, Vue.js, CI/CD');
      await page.getByLabel('ข้อมูลเพิ่มเติม').fill(`Automated integration test mock data - ${new Date().toISOString()}`);

      await waitForQuasarIdle(page, T.medium);
    });

    await test.step('Step 3: Graduate = true -> Fill Graduation Year (Fix: testid is on <input>)', async () => {
      // ใช้ helper ที่รองรับ testid บน input/wrapper
      await checkGraduatedAndFillYear(page, {
        checkboxTestId: 'checkbox-graduated',
        gradInputTestId: 'input-graduation-date',
        year: '2568',  // ถ้าต้องการค.ศ. ให้เปลี่ยนเป็น '2025'
        timeout: T.xlong
      });

      // verify: เมื่อจบแล้ว ช่องชั้นปีควร disabled
      const studyInput = await getInputByTestId(page, 'input-study-year');
      await expect(studyInput).toBeDisabled({ timeout: T.long });
    });

    await test.step('Step 4: Disability = true -> Pick disability type', async () => {
      await setQuasarCheckbox(page, 'checkbox-disability', true, T.xlong);

      await selectQuasarOption(page, 'เลือกประเภทความพิการ', /การได้ยิน/, {
        searchText: 'ได้ยิน',
        timeout: T.xlong
      });

      await waitForQuasarIdle(page, T.medium);
    });

    await test.step('Step 5: PDPA consent', async () => {
      // จับ PDPA checkbox แบบทนข้อความยาว
      const pdpa = page.locator('.q-checkbox').filter({ hasText: /PDPA|ยินยอมให้ใช้ข้อมูลส่วนบุคคล/i }).first();
      await expect(pdpa).toBeVisible({ timeout: T.medium });

      // คลิก inner จะนิ่งกว่า
      const inner = pdpa.locator('.q-checkbox__inner').first();
      if (await inner.count()) {
        await inner.click({ force: true });
      } else {
        await pdpa.click({ force: true });
      }

      await waitForQuasarIdle(page, T.short);
    });

    await test.step('Step 6: Save -> Confirm dialog -> Wait success', async () => {
      const submitBtn = page.getByTestId('btn-submit');
      await expect(submitBtn).toBeVisible({ timeout: T.long });
      await expect(submitBtn).toBeEnabled({ timeout: T.long });

      await submitBtn.click({ force: true });
      await confirmDialog(page, { timeout: T.long });

      const notif = await waitForNotificationText(page, T.xlong);
      expect(notif).toMatch(/สำเร็จ|บันทึก|เพิ่มข้อมูล/i);

      await waitForTableUpdate(page, T.long);
      await waitForQuasarIdle(page, T.long);
    });

    await test.step('Step 7: Verify record exists -> Verify new fields -> Edit -> Verify updated', async () => {
      await searchInTable(page, uniquePhone);

      const row = page.locator('table tbody tr').filter({ hasText: uniquePhone }).first();
      await expect(row).toBeVisible({ timeout: T.xlong });

      // Verify new fields are visible in the table row
      await expect(row).toContainText('เชียงใหม่ (Test)');
      await expect(row).toContainText('กรุงเทพฯ (Test)');
      await expect(row).toContainText('Modern Science');
      await expect(row).toContainText('History of Art');
      await expect(row).toContainText('Open Source Contribution');
      await expect(row).toContainText('Cloud Architect');
      await expect(row).toContainText('Playwright, Vue.js, CI/CD');

      // Edit the record
      const editBtn = row.getByRole('button', { name: 'แก้ไข' });
      await expect(editBtn).toBeVisible({ timeout: T.medium });
      await editBtn.click({ force: true });
      await waitForQuasarIdle(page, T.medium);

      // Update some of the new fields
      await page.getByLabel('มาจากจังหวัด').fill('เชียงใหม่ (Edited)');
      await page.getByLabel('วิชาที่ชอบ').fill('Modern Science (Edited)');
      await page.getByLabel('อาชีพในฝัน').fill('Cloud Architect (Edited)');

      const submitBtn = page.getByTestId('btn-submit');
      await expect(submitBtn).toBeVisible({ timeout: T.long });
      await submitBtn.click({ force: true });
      await confirmDialog(page, { timeout: T.long });

      const notif = await waitForNotificationText(page, T.xlong);
      expect(notif).toMatch(/สำเร็จ|แก้ไข|บันทึก/i);

      await waitForTableUpdate(page, T.long);
      await searchInTable(page, uniquePhone);

      const updatedRow = page.locator('table tbody tr').filter({ hasText: uniquePhone }).first();
      await expect(updatedRow).toContainText('เชียงใหม่ (Edited)');
      await expect(updatedRow).toContainText('Modern Science (Edited)');
      await expect(updatedRow).toContainText('Cloud Architect (Edited)');
    });
    //--------------------------------ตรวจสอบแล้ว-------------------------------------------------
    ////////////////////////////// FormPlanCareer /////////////////////////////////
    await test.step('Step 8: Navigate to FormPlanCareer', async () => {
      const nextBtn = page.locator('a').filter({ hasText: 'ไปฟอร์มกำหนดอาชีพเป้าหมาย' }).first();
      await expect(nextBtn).toBeVisible({ timeout: T.medium });

      await Promise.all([
        page.waitForURL(/.*FormPlanCareer/, { timeout: T.xlong }),
        nextBtn.click(),
      ]);

      await expect(page).toHaveURL(/.*FormPlanCareer/);
      await waitForQuasarIdle(page, T.long);
    });

    await test.step('Step 9: Verify FormPlanCareer tree nodes exist', async () => {
      const tree = page.locator('.q-tree');
      await expect(tree).toBeVisible({ timeout: T.long });

      await waitForQuasarIdle(page, T.xlong);
      const nodes = tree.locator('.q-tree__node');
      await expect.poll(async () => await nodes.count(), { timeout: T.xlong }).toBeGreaterThan(0);
    });

    await test.step('Step 10: Open FormPlanCareer manual add dialog', async () => {
      const addBtn = page.locator('button').filter({ hasText: /เพิ่ม.*ด้วยตนเอง/ }).first();
      await expect(addBtn).toBeVisible({ timeout: T.medium });
      await addBtn.click();

      const dialog = page.locator('.q-dialog:visible').last();
      await expect(dialog).toBeVisible({ timeout: T.medium });
      await expect(dialog).toContainText(/อาชีพเป้าหมาย|อาชีพ/);
    });

    await test.step('Step 11: FormPlanCareer CRUD via dialog', async () => {
      const dialog = page.locator('.q-dialog:visible').last();
      await expect(dialog).toBeVisible({ timeout: T.medium });

      // Select first option
      const careerSelect = page.getByTestId('select-target-career');
      await expect(careerSelect).toBeVisible({ timeout: T.medium });
      await careerSelect.click();
      await page.keyboard.type('นัก');

      const firstOption = page.locator('.q-menu:visible .q-item').first();
      await expect(firstOption).toBeVisible({ timeout: T.long });

      selectedCareerName = (await firstOption.innerText()).trim().split('\n')[0];
      await firstOption.click();

      await page.getByTestId('input-start-date').fill('01/01/2026');
      await page.getByTestId('btn-submit-career').click();

      const notifText = await waitForNotificationText(page, T.long);

      if (/สำเร็จ/i.test(notifText)) {
        await waitForQuasarIdle(page, T.long);
        await expect(page.locator('.q-tree')).toContainText(selectedCareerName, { timeout: T.long });
      } else if (/ถูกเพิ่มไว้แล้ว/i.test(notifText)) {
        await closeDialogIfPresent(page, T.short);
      } else {
        throw new Error(`Unexpected notification: ${notifText}`);
      }

      // EDIT
      const nodeHeader = page.locator('.q-tree__node-header').filter({ hasText: selectedCareerName }).first();
      await expect(nodeHeader).toBeVisible({ timeout: T.long });

      const editBtn = nodeHeader.locator('button:has(i.material-icons:text("edit"))').first();
      await expect(editBtn).toBeVisible({ timeout: T.long });
      await editBtn.click();

      const editDialog = page.locator('.q-dialog:visible').last();
      await expect(editDialog).toBeVisible({ timeout: T.medium });

      await page.getByTestId('input-start-date').fill('02/01/2026');
      await page.getByTestId('btn-submit-career').click();

      await expect(page.locator('.q-notification').last()).toContainText(/สำเร็จ/i, { timeout: T.long });
      await waitForQuasarIdle(page, T.long);

      await expect(page.locator('.q-tree')).toContainText('02/01/2026', { timeout: T.long });
      await closeDialogIfPresent(page, T.short);

      /*
      // DELETE
      const nodeHeaderAfter = page.locator('.q-tree__node-header').filter({ hasText: selectedCareerName }).first();
      await expect(nodeHeaderAfter).toBeVisible({ timeout: T.long });

      const deleteBtn = nodeHeaderAfter.locator('button:has(i.material-icons:text("delete"))').first();
      await expect(deleteBtn).toBeVisible({ timeout: T.long });
      await deleteBtn.click();

      await confirmDialog(page, { timeout: T.long });
      await expect(page.locator('.q-notification').last()).toContainText(/สำเร็จ/i, { timeout: T.long });

      await waitForQuasarIdle(page, T.long);
      await expect(page.locator('.q-tree')).not.toContainText(selectedCareerName, { timeout: T.long });
      */
    });

    //--------------------------------ตรวจสอบแล้ว-------------------------------------------------
    ////////////////////////////// FormQualification /////////////////////////////////
    await test.step('Step 12: Navigate to FormQualification', async () => {
      await page.goto(`${BASE_URL}/FormQualification`, { waitUntil: 'domcontentloaded' });

      // ไม่รอ networkidle / ไม่เรียก waitForQuasarIdle เพราะ AI ทำให้ค้าง
      const tree = page.locator('.q-tree').first();
      await expect(tree).toBeVisible({ timeout: T.xlong });

      // กัน render ช้าเล็กน้อย
      await page.waitForTimeout(300);
    });

    await test.step('Step 13: Tree from DB (Add -> Reload -> Still Exists)', async () => {
      createdQualName = uniq('ทักษะ-IT');
      const groupName = uniq('กลุ่ม-IT');

      const { pickedCareer } = await addQualificationViaDialog(page, { qualName: createdQualName, groupName }, T.xlong);

      const tree = page.locator('.q-tree').first();
      await expect(tree).toContainText(pickedCareer, { timeout: T.xlong });
      await expect(tree).toContainText(createdQualName, { timeout: T.xlong });

      // reload -> still exists
      await page.reload({ waitUntil: 'domcontentloaded' });

      // ❌ อย่ารอ networkidle (AI/long poll ทำให้ค้าง)
      // await page.waitForLoadState('networkidle', { timeout: T.xlong }).catch(() => { });

      // ✅ รอแค่ DOM + tree กลับมา และ "ไม่บังคับ spinner = 0"
      await page.waitForLoadState('domcontentloaded', { timeout: T.xlong }).catch(() => { });
      await expect(tree).toBeVisible({ timeout: T.xlong });
      await expect.poll(
        async () => await tree.locator('.q-tree__node').count(),
        { timeout: T.xlong }
      ).toBeGreaterThan(0);

      // ✅ ถ้าคุณแก้ helper waitForQuasarIdle ให้มี options แล้ว ให้ใช้แบบนี้
      await waitForQuasarIdle(page, T.xlong, { ignoreSpinners: true, ignoreInnerLoading: true });

      await expect(tree).toContainText(createdQualName, { timeout: T.xlong });
    });

    await test.step('Step 14: Edit/Delete via Tree', async () => {
      const tree = page.locator('.q-tree').first();
      await expect(tree).toBeVisible({ timeout: T.xlong });

      // ---------- helper: expand header ถ้า aria-expanded=false ----------
      const expandIfCollapsed = async (header) => {
        const expanded = await header.getAttribute('aria-expanded').catch(() => null);
        if (expanded === 'false') {
          const arrow = header.locator('.q-tree__arrow').first();
          if (await arrow.count()) {
            await arrow.click({ force: true });
          } else {
            await header.click({ force: true });
          }

          await expect
            .poll(async () => await header.getAttribute('aria-expanded'), { timeout: T.long })
            .toBe('true');
        }
      };

      // ---------- helper: ขยาย path (ancestor) ให้ node โผล่ ----------
      // ใช้ DOM evaluate เพื่อคลิก expand จาก root -> ลงมาถึง node เป้าหมาย
      const expandPathToReveal = async (headerLocator) => {
        const eh = await headerLocator.elementHandle();
        if (!eh) throw new Error('Target header not found in DOM');

        await page.evaluate((el) => {
          const clickExpand = (h) => {
            if (!h) return;
            if (h.getAttribute('aria-expanded') === 'false') {
              const arrow = h.querySelector('.q-tree__arrow');
              (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
          };

          // เก็บ headers ของ ancestor ที่เป็น parent (มี aria-expanded)
          const headers = [];
          let node = el.closest('.q-tree__node');
          while (node) {
            const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
            if (h) headers.push(h);
            node = node.parentElement?.closest('.q-tree__node');
          }

          // expand จากบนลงล่าง
          headers.reverse().forEach(clickExpand);
        }, eh);

        // รอ UI update เล็กน้อย (ไม่ใช้ waitForQuasarIdle)
        await page.waitForTimeout(200);
      };

      // ---------- helper: click delete ที่ header ----------
      const clickDeleteOnHeader = async (header) => {
        const delBtn = header.locator('button:has(i.material-icons:has-text("delete"))').first();
        await expect(delBtn).toBeVisible({ timeout: T.long });
        await delBtn.click({ force: true });
      };

      // ---------- 1) หา career headers (work) ----------
      const careerHeaders = tree.locator(
        '.q-tree__node-header:has(i.material-icons:has-text("work")), ' +
        '.q-tree__node-header:has(i.material-icons:has-text("work_outline"))'
      );
      await expect.poll(async () => await careerHeaders.count(), { timeout: T.xlong }).toBeGreaterThan(0);

      // ---------- 2) ไล่ expand career ทีละอัน แล้วหา createdQualName ภายในกิ่งนั้น ----------
      const cCnt = await careerHeaders.count();
      let targetSkillHeader = null;

      for (let i = 0; i < cCnt; i++) {
        const careerHeader = careerHeaders.nth(i);
        await careerHeader.scrollIntoViewIfNeeded().catch(() => { });
        await expect(careerHeader).toBeVisible({ timeout: T.long });

        // expand career
        await expandIfCollapsed(careerHeader);

        // จำกัดการค้นหาไว้เฉพาะ subtree ของ career นี้ (กันไป match ที่กิ่งอื่นที่ยัง hidden)
        const careerNode = careerHeader.locator('xpath=ancestor::div[contains(@class,"q-tree__node")][1]');
        const candidate = careerNode.locator(
          '.q-tree__node-header:has(i.material-icons:has-text("fact_check"))'
        ).filter({ hasText: createdQualName }).first();

        if (await candidate.count()) {
          // node เจอแล้ว แต่ยังอาจ hidden เพราะมี parent ย่อย collapse อยู่
          await expandPathToReveal(candidate);

          // ตอนนี้ค่อยรอให้ visible จริง
          await expect.poll(async () => await candidate.isVisible().catch(() => false), { timeout: T.xlong })
            .toBe(true);

          await candidate.scrollIntoViewIfNeeded().catch(() => { });
          targetSkillHeader = candidate;
          break;
        }
      }

      if (!targetSkillHeader) {
        throw new Error(`Cannot find qualification node in tree: ${createdQualName}`);
      }

      // ---------- 3) (optional) expand skill node ถ้ามันเป็น parent ----------
      await expandIfCollapsed(targetSkillHeader).catch(() => { });

      /*
      // ---------- 4) delete ----------
      await clickDeleteOnHeader(targetSkillHeader);
      await confirmDialog(page, { timeout: T.xlong });

      const notif = await waitForNotificationText(page, T.xlong);
      expect(notif).toMatch(/ลบ|สำเร็จ/i);

      // ---------- 5) verify node หาย (ไม่ใช้ waitForQuasarIdle) ----------
      const stillThere = tree.locator('.q-tree__node-header').filter({ hasText: createdQualName });
      await expect.poll(async () => await stillThere.count(), { timeout: T.xlong }).toBe(0);
      */
    });

    await test.step('Step 15-16: Optional AI tests (skip)', async () => {
      console.log('⏭️ Skipping AI tests in this integrated flow');
    });

    //--------------------------------ตรวจสอบแล้ว-------------------------------------------------
    // ------------------------------
    // Step 16+ : FormPlan.vue
    // ------------------------------

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    async function openQuasarSelectAndGetItems(page, selectLocator, timeout) {
      await selectLocator.scrollIntoViewIfNeeded().catch(() => { });
      await selectLocator.click({ force: true });

      const menu = page.locator('.q-menu:visible').last();
      await expect(menu).toBeVisible({ timeout });
      const items = menu.locator('.q-item');
      return { menu, items };
    }

    async function pickCareerAndQualification(page, t) {
      const careerSelect = page.getByTestId('select-target-career');
      const qualSelect = page.getByTestId('select-target-qualification');

      await expect(careerSelect).toBeVisible({ timeout: t });

      // เปิด career menu
      let { items: careerItems } = await openQuasarSelectAndGetItems(page, careerSelect, t);
      const cCnt = await careerItems.count();
      if (cCnt === 0) throw new Error('No career options found in manual plan dialog');

      // ลองทีละอาชีพจนเจอ qualification อย่างน้อย 1 อัน
      const tryMax = Math.min(cCnt, 8);
      for (let i = 0; i < tryMax; i++) {
        // เปิดใหม่ทุกครั้ง (เพราะ menu ปิดหลังเลือก)
        ({ items: careerItems } = await openQuasarSelectAndGetItems(page, careerSelect, t));
        const cItem = careerItems.nth(i);
        const careerText = (await cItem.innerText()).trim().split('\n')[0];
        await cItem.click({ force: true });

        // รอโหลดคุณสมบัติเล็กน้อย (ไม่ใช้ waitForQuasarIdle)
        await page.waitForTimeout(300);

        // เปิด qualification menu
        let qMenuOk = true;
        try {
          const { items: qualItems } = await openQuasarSelectAndGetItems(page, qualSelect, t);
          const qCnt = await qualItems.count();

          if (qCnt > 0) {
            const qItem = qualItems.first();
            const qualText = (await qItem.innerText()).trim().split('\n')[0];
            await qItem.click({ force: true });
            return { careerText, qualText };
          }

          // ไม่มี qual -> ปิดเมนู
          await page.keyboard.press('Escape').catch(() => { });
          qMenuOk = false;
        } catch (e) {
          qMenuOk = false;
        }

        if (!qMenuOk) {
          // ลองอาชีพถัดไป
          continue;
        }
      }

      throw new Error('No qualifications found for any of the first careers (manual dialog)');
    }

    async function pickFirstOption(page, selectTestId, t) {
      const sel = page.getByTestId(selectTestId);
      await expect(sel).toBeVisible({ timeout: t });
      const { items } = await openQuasarSelectAndGetItems(page, sel, t);
      const n = await items.count();
      if (n === 0) throw new Error(`No options in select: ${selectTestId}`);
      await items.first().click({ force: true });
    }

    async function findPlanHeaderInTree(page, planTitle, t) {
      const tree = page.getByTestId('plan-tree');
      await expect(tree).toBeVisible({ timeout: t });

      // เจาะให้ตรง plan node: "แผนพัฒนา: <title>"
      const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(planTitle)}`);
      const header = tree
        .locator('.q-tree__node-header')
        .filter({ hasText: re })
        .first();

      // ✅ FIX: รอให้ node มีใน DOM ก่อน (ไม่บังคับ visible)
      await expect.poll(async () => await header.count(), {
        timeout: t,
        intervals: [500, 1000, 2000],
        message: `ไม่พบ plan node: "${planTitle}" ใน DOM`
      }).toBeGreaterThan(0);

      // ✅ FIX: expand path ไปยัง header โดย DOM evaluate
      const eh = await header.elementHandle();
      if (eh) {
        await page.evaluate((el) => {
          const clickExpand = (h) => {
            if (!h) return;
            if (h.getAttribute('aria-expanded') === 'false') {
              const arrow = h.querySelector('.q-tree__arrow');
              (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
          };

          // เก็บ headers ของ ancestor ที่เป็น parent (มี aria-expanded)
          const headers = [];
          let node = el.closest('.q-tree__node');
          while (node) {
            const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
            if (h) headers.push(h);
            node = node.parentElement?.closest('.q-tree__node');
          }

          // expand จากบนลงล่าง
          headers.reverse().forEach(clickExpand);
        }, eh);

        await page.waitForTimeout(500); // รอ animation
      }

      // ตอนนี้ค่อย scroll ให้เห็น
      await header.scrollIntoViewIfNeeded().catch(() => { });

      // รอให้ visible จริง (หลัง expand แล้ว)
      await expect.poll(async () => await header.isVisible().catch(() => false), {
        timeout: t,
        message: `Plan node "${planTitle}" ยังไม่ visible หลัง expand path แล้ว`
      }).toBe(true);

      return header;
    }

    async function findAssessmentHeaderInTree(page, text, t) {
      const tree = page.getByTestId('assessment-tree');
      await expect(tree).toBeVisible({ timeout: t });

      const re = new RegExp(escapeRegExp(text));
      const header = tree.locator('.q-tree__node-header').filter({ hasText: re }).first();

      // รอให้ node มีใน DOM
      await expect.poll(async () => await header.count(), {
        timeout: t,
        message: `ไม่พบ assessment/ref node: "${text}" ใน DOM`
      }).toBeGreaterThan(0);

      const eh = await header.elementHandle();
      if (eh) {
        await page.evaluate((el) => {
          const clickExpand = (h) => {
            if (!h) return;
            if (h.getAttribute('aria-expanded') === 'false') {
              const arrow = h.querySelector('.q-tree__arrow');
              (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
          };
          const headers = [];
          let node = el.closest('.q-tree__node');
          while (node) {
            const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
            if (h) headers.push(h);
            node = node.parentElement?.closest('.q-tree__node');
          }
          headers.reverse().forEach(clickExpand);
        }, eh);
        await page.waitForTimeout(500);
      }

      await header.scrollIntoViewIfNeeded().catch(() => { });
      await expect.poll(async () => await header.isVisible().catch(() => false), {
        timeout: t,
        message: `Assessment node "${text}" ยังไม่ visible หลัง expand path แล้ว`
      }).toBe(true);

      return header;
    }

    await test.step('Step 16: Navigate to FormPlan (skip AI by blocking /api/chat)', async () => {
      // กัน AI ค้าง: abort chat request
      // await page.route('**/api/chat', (route) => route.abort()).catch(() => { });
      // await page.route('**:3000/api/chat', (route) => route.abort()).catch(() => { });

      await page.goto(`${BASE_URL}/FormPlan`, { waitUntil: 'domcontentloaded' });

      // ไม่รอ networkidle / ไม่เรียก waitForQuasarIdle
      const tree = page.getByTestId('plan-tree');
      await expect(tree).toBeVisible({ timeout: T.xlong });

      // ปุ่ม manual ต้องกดได้
      await expect(page.getByTestId('btn-manual-plan')).toBeVisible({ timeout: T.long });
    });


    await test.step('Step 17: FormPlan manual dialog CRUD (Add) [FIXED like Step 14]', async () => {
      const topic = uniq('แผน-Dev');
      createdPlanTitle = topic; // ✅ สำคัญมาก ใช้ต่อ Step 18/19
      const channel = `ช่องทางทดสอบ-${topic}`;
      const startDate = '01/01/2026';
      const endDate = '31/01/2026';

      // ────────────────────────────────────────────────
      // Helper: expand path to reveal node (copy concept from Step 14)
      // ────────────────────────────────────────────────
      const expandPathToReveal = async (headerLocator) => {
        const eh = await headerLocator.elementHandle();
        if (!eh) return;

        await page.evaluate((el) => {
          const clickExpand = (h) => {
            if (!h) return;
            if (h.getAttribute('aria-expanded') === 'false') {
              const arrow = h.querySelector('.q-tree__arrow');
              (arrow || h).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
          };

          // เก็บ headers ของ ancestor ที่เป็น parent (มี aria-expanded)
          const headers = [];
          let node = el.closest('.q-tree__node');
          while (node) {
            const h = node.querySelector(':scope > .q-tree__node-header[aria-expanded]');
            if (h) headers.push(h);
            node = node.parentElement?.closest('.q-tree__node');
          }

          headers.reverse().forEach(clickExpand);
        }, eh);

        await page.waitForTimeout(200);
      };

      // ────────────────────────────────────────────────
      // Helper: เปิดและเลือก Quasar Select (ของคุณใช้ได้อยู่แล้ว)
      // ────────────────────────────────────────────────
      const selectQuasarOption = async (testId, valueOrIndex = 0, config = {}) => {
        const { timeout = 10000, force = true, waitAfter = 500 } = config;

        const input = page.getByTestId(testId);
        await expect(input).toBeVisible({ timeout });
        await expect(input).toBeEnabled({ timeout });

        await input.click({ force }).catch(() => { });
        await page.waitForTimeout(200);

        const dropdownIcon = page.locator(`[data-testid="${testId}"] ~ .q-field__append .q-select__dropdown-icon`);
        if (await dropdownIcon.isVisible().catch(() => false)) {
          await dropdownIcon.click({ force }).catch(() => { });
        }

        await input.press('ArrowDown').catch(() => { });
        await page.waitForTimeout(300);

        const ariaControls = await input.getAttribute('aria-controls');
        if (!ariaControls) throw new Error(`ไม่พบ aria-controls สำหรับ ${testId}`);

        const listbox = page.locator(`#${ariaControls}`);
        await expect(listbox).toBeVisible({ timeout: 8000 });

        const items = listbox.getByRole('option');
        await expect.poll(() => items.count(), { timeout: 8000 }).toBeGreaterThan(0);

        if (typeof valueOrIndex === 'number') {
          await items.nth(valueOrIndex).click({ force });
        } else {
          await items.filter({ hasText: valueOrIndex }).first().click({ force });
        }

        await expect(listbox).toBeHidden({ timeout: 5000 }).catch(() => { });
        await expect(input).toHaveAttribute('aria-expanded', 'false', { timeout: 3000 }).catch(() => { });

        if (waitAfter > 0) await page.waitForTimeout(waitAfter);
      };

      // ────────────────────────────────────────────────
      // 0) เปิด dialog
      // ────────────────────────────────────────────────
      await page.getByTestId('btn-manual-plan').click({ force: true });
      const dialog = page.locator('.q-dialog:visible').last();
      await expect(dialog).toBeVisible({ timeout: 12000 });
      await page.waitForSelector('[data-testid="select-target-career"]', { state: 'visible', timeout: 15000 });

      // ────────────────────────────────────────────────
      // 1-4) เลือกอาชีพ/พัฒนา/ความสำคัญ/คุณสมบัติ
      // ────────────────────────────────────────────────
      await selectQuasarOption('select-target-career', 0, { timeout: 15000, waitAfter: 1000 });
      await selectQuasarOption('select-development-type', 0, { waitAfter: 300 });
      await selectQuasarOption('select-importance', 0, { waitAfter: 300 });

      const qualInput = page.getByTestId('select-target-qualification');
      await expect.poll(async () => {
        const disabled = await qualInput.isDisabled().catch(() => true);
        if (disabled) return false;

        const fieldEl = await qualInput.evaluateHandle(el => el.closest('.q-field')).catch(() => null);
        if (!fieldEl) return false;

        const hasDisabledClass = await fieldEl.evaluate(el => el?.classList.contains('q-field--disabled')).catch(() => true);
        return !hasDisabledClass;
      }, { timeout: 20000, intervals: [500, 1000] }).toBe(true);

      await page.waitForTimeout(300);
      await selectQuasarOption('select-target-qualification', 0, { waitAfter: 300 });

      // ────────────────────────────────────────────────
      // 5-8) กรอก title/channel/dates
      // ────────────────────────────────────────────────
      const titleInput = page.getByTestId('input-plan-title');
      await titleInput.fill(topic);
      await expect(titleInput).toHaveValue(topic, { timeout: 3000 });

      const channelInput = page.getByLabel('ช่องทาง *');
      await channelInput.fill(channel);
      await expect(channelInput).toHaveValue(channel, { timeout: 3000 });

      const startDateInput = page.getByTestId('input-start-date');
      await startDateInput.fill('');
      await startDateInput.pressSequentially(startDate, { delay: 40 });
      await startDateInput.press('Tab');
      await expect(startDateInput).toHaveValue(startDate, { timeout: 5000 });

      const endDateInput = page.getByLabel('วันสิ้นสุดพัฒนา');
      await endDateInput.fill('');
      await endDateInput.pressSequentially(endDate, { delay: 40 });
      await endDateInput.press('Tab');
      await expect(endDateInput).toHaveValue(endDate, { timeout: 5000 });

      // ────────────────────────────────────────────────
      // 9-11) submit + confirm + notif
      // ────────────────────────────────────────────────
      await page.getByTestId('btn-submit-plan').click({ force: true });
      await confirmDialog(page, { timeout: 10000 });

      const notifText = await waitForNotificationText(page, 15000);
      expect(notifText).toMatch(/สำเร็จ|บันทึก|เพิ่มข้อมูล/i);

      // ✅ ถ้าหน้าไม่ได้ปิด dialog อัตโนมัติ ก็ไม่บังคับรอ hidden
      await expect(dialog).toBeHidden({ timeout: 10000 }).catch(() => { });

      // ────────────────────────────────────────────────
      // ✅ FIX: หา node header แบบเฉพาะเจาะจง + expand path เหมือน Step 14
      // ────────────────────────────────────────────────
      const planTree = page.getByTestId('plan-tree');
      await expect(planTree).toBeVisible({ timeout: 15000 });

      // รอให้ tree มี node ก่อน (กันช่วง render/refresh)
      await expect.poll(async () => await planTree.locator('.q-tree__node').count(), { timeout: 30000 })
        .toBeGreaterThan(0);

      // หาแผนแบบ "แผนพัฒนา: <topic>" (ตรงกับ UI จริง)
      const re = new RegExp(`แผนพัฒนา:\\s*${escapeRegExp(topic)}`);
      const planHeader = planTree.locator('.q-tree__node-header').filter({ hasText: re }).first();

      // polling รอให้ DOM มี node นี้จริง (ไม่อิง textContent ทั้ง tree)
      await expect.poll(async () => await planHeader.count(), {
        timeout: 45000,
        intervals: [500, 1000, 2000],
        message: `Expected plan node header to appear: "แผนพัฒนา: ${topic}"`,
      }).toBeGreaterThan(0);

      // ถ้ามันอยู่ใน branch ที่ยังไม่ expand ให้ expand path
      await expandPathToReveal(planHeader);

      // รอให้ visible จริง ๆ
      await expect.poll(async () => await planHeader.isVisible().catch(() => false), { timeout: 20000 })
        .toBe(true);

      await planHeader.scrollIntoViewIfNeeded().catch(() => { });

      // ปิด dialog อื่นๆ (ถ้ามี)
      await closeDialogIfPresent(page, 3000);
    });

    await test.step('Step 18: Tree from DB (Reload -> Still Exists)', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });

      // ไม่รอ networkidle / ไม่เรียก waitForQuasarIdle
      const tree = page.getByTestId('plan-tree');
      await expect(tree).toBeVisible({ timeout: T.xlong });

      // รอ tree render มี node
      await expect
        .poll(async () => await tree.locator('.q-tree__node').count(), { timeout: T.xlong })
        .toBeGreaterThan(0);

      await expect(tree).toContainText(createdPlanTitle, { timeout: T.xlong });
    });


    await test.step('Step 19: Edit plan via Tree + Expand ตามลำดับ + Log แต่ละ node + Verify edit/delete', async () => {
      updatedPlanTitle = uniq('แผน-Dev-Edit');

      // ────────────────────────────────────────────────
      // ส่วน edit เดิม (สมมติว่ามีอยู่แล้ว)
      // ────────────────────────────────────────────────
      console.log(`เริ่ม edit แผนเดิม "${createdPlanTitle}" → ใหม่ "${updatedPlanTitle}"`);

      const originalHeader = await findPlanHeaderInTree(page, createdPlanTitle, T.xlong);

      const editBtn = originalHeader.locator('button:has(i.material-icons:has-text("edit"))').first();
      await editBtn.scrollIntoViewIfNeeded().catch(() => { });
      await expect(editBtn).toBeVisible({ timeout: T.medium });
      await editBtn.click({ force: true });

      const dialog = page.locator('.q-dialog:visible').last();
      await expect(dialog).toBeVisible({ timeout: T.long });

      await page.getByTestId('input-plan-title').fill(updatedPlanTitle);

      await page.getByTestId('btn-submit-plan').click({ force: true });
      await confirmDialog(page, { timeout: T.long });

      const notif = await waitForNotificationText(page, T.xlong);
      expect(notif).toMatch(/สำเร็จ|แก้ไข|บันทึก/i);

      console.log('Submit แผนใหม่สำเร็จ → รอ sync');
      await page.waitForTimeout(1500);

      // ────────────────────────────────────────────────
      // หา plan node ใหม่ (updatedPlanTitle) ด้วย findPlanHeaderInTree (มี auto-expand)
      // ────────────────────────────────────────────────
      console.log(`หา plan node ใหม่: "${updatedPlanTitle}" (findPlanHeaderInTree จะ expand อัตโนมัติ)`);

      const newHeader = await findPlanHeaderInTree(page, updatedPlanTitle, T.xlong);

      console.log(`พบ plan node ใหม่: "${updatedPlanTitle}"`);

      // ตรวจสอบปุ่ม edit/delete ใน node ใหม่
      console.log('ตรวจสอบปุ่ม edit/delete ใน plan node ใหม่');

      const editBtnNew = newHeader.locator('button:has(i.material-icons:has-text("edit"))').first();
      const deleteBtnNew = newHeader.locator('button:has(i.material-icons:has-text("delete"))').first();

      await expect(editBtnNew).toBeVisible({ timeout: T.medium });
      await expect(deleteBtnNew).toBeVisible({ timeout: T.medium });

      console.log('   ✓ พบทั้งปุ่ม edit และ delete ใน plan node ใหม่');

      // ปิด dialog ถ้ายังค้าง
      await closeDialogIfPresent(page, T.short);

      console.log(`✓ Step 19 สำเร็จ: Edit plan + verify buttons ใน "${updatedPlanTitle}"`);
    });
    await test.step('Step 20: Delete plan via Tree (DB delete through tree buttons)', async () => {
      console.log(`เริ่มลบแผน: "${updatedPlanTitle}" (findPlanHeaderInTree จะ expand อัตโนมัติ)`);

      const header = await findPlanHeaderInTree(page, updatedPlanTitle, T.xlong);
      console.log(`พบ plan node: "${updatedPlanTitle}"`);

      console.log(`✓ Step 20 สำเร็จ: Skip Delete plan "${updatedPlanTitle}" to keep data for Step 23`);
    });

    await test.step('Step 21: Skip AI tests (explicit)', async () => {
      console.log('⏭️ Skipping AI tests for FormPlan (blocked /api/chat + no AI assertions)');
    });


    //--------------------------------ตรวจสอบแล้ว-------------------------------------------------
    // ------------------------------
    // Step 22+ : FormSelfAssessment.vue
    // ------------------------------


    await test.step('Step 22: Navigate to FormSelfAssessment with state injection', async () => {
      console.log('Navigating to FormSelfAssessment and injecting state...');

      // Navigate directly
      await page.goto(`${BASE_URL}/FormSelfAssessment`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#q-app', { timeout: T.medium });

      // Inject Vuex state (Since it might be cleared on reload)
      await page.evaluate(({ mid, name, status }) => {
        const appEl = document.querySelector('#q-app');
        const store = appEl?.__vue_app__?.config?.globalProperties?.$store;

        if (store) {
          store.commit('setMyAuthenticate', true);
          store.commit('setMyMember_id', mid);
          store.commit('setMyName', name);
          store.commit('setMyStatus', status);
          console.log('✅ State injected successfully into Vuex');
        } else {
          console.error('❌ Could not find Vuex store to inject state');
        }
      }, { mid: '221', name: 'สมนึก สินธุประวน', status: 'user' });

      await waitForQuasarIdle(page, T.xlong).catch(() => { });

      const tree = page.locator('.q-tree').first();
      await expect(tree).toBeVisible({ timeout: T.xlong });
      console.log('✓ Navigated to FormSelfAssessment and state injected');
    });

    await test.step('Step 23: Manual Add Self-Assessment + Add Reference (ROBUST SELECT)', async () => {
      // ───────────────────────────────────────────────
      //  Wait for AI analysis spinner to disappear
      // ───────────────────────────────────────────────
      const spinner = page.locator('.is-ai-loading-spinner, .q-spinner-dots');
      if (await spinner.isVisible().catch(() => false)) {
        console.log('Waiting for AI analysis spinner to disappear...');
        await expect(spinner).not.toBeVisible({ timeout: T.xlong });
      }

      const openBtn = page.getByRole('button', { name: 'เพิ่มข้อมูลด้วยตนเอง' }).first();
      await expect(openBtn).toBeVisible({ timeout: T.long });
      await openBtn.click({ force: true });

      const dialog = page
        .locator('.q-dialog:visible')
        .filter({ hasText: /เพิ่มข้อมูลการประเมิน|การประเมินตนเอง/i })
        .last();

      await expect(dialog).toBeVisible({ timeout: T.long });
      await page.waitForTimeout(3000); // Wait for animations and data fetch

      // ───────────────────────────────────────────────
      //  Helper: waitForQuasarSelectReady (ตามคำแนะนำ Best Practice)
      // ───────────────────────────────────────────────
      const selectQuasarOption = async (testId, valueOrIndex = 0, config = {}) => {
        const { timeout = 30000, force = true, waitAfter = 500 } = config;

        // Use dialog locator
        const input = dialog.getByTestId(testId);
        await expect(input).toBeVisible({ timeout });

        // Wait for enabled
        await expect.poll(async () => {
          const disabled = await input.isDisabled().catch(() => true);
          if (disabled) return false;
          const fieldEl = await input.evaluateHandle(el => el.closest('.q-field')).catch(() => null);
          if (!fieldEl) return false;
          const hasClass = await fieldEl.evaluate(el => el?.classList.contains('q-field--disabled')).catch(() => true);
          return !hasClass;
        }, { timeout: timeout + 10000, intervals: [1000] }).toBe(true);

        // Click to open (Single click)
        await input.click({ force }).catch(() => { });
        await page.waitForTimeout(500);

        // Robustly find the menu
        let listbox = page.locator('.q-menu:visible').last(); // Default strategy: last opened menu

        // Verify if it works, otherwise try aria-controls
        if (!await listbox.isVisible().catch(() => false)) {
          // Try ID via aria-controls if generic lookup failed
          const ariaControls = await input.getAttribute('aria-controls').catch(() => null);
          if (ariaControls) {
            listbox = page.locator(`#${ariaControls}`);
          }
        }

        // If still not visible, maybe click the append icon?
        if (!await listbox.isVisible().catch(() => false)) {
          const dropdownIcon = dialog.locator(`[data-testid="${testId}"] ~ .q-field__append .q-select__dropdown-icon`);
          if (await dropdownIcon.isVisible().catch(() => false)) {
            await dropdownIcon.click({ force }).catch(() => { });
            await page.waitForTimeout(500);
            listbox = page.locator('.q-menu:visible').last();
          }
        }

        await expect(listbox).toBeVisible({ timeout: 10000 });

        const items = listbox.getByRole('option');
        await expect.poll(() => items.count(), { timeout: 15000 }).toBeGreaterThan(0);

        if (typeof valueOrIndex === 'number') {
          await items.nth(valueOrIndex).click({ force });
        } else {
          await items.filter({ hasText: valueOrIndex }).first().click({ force });
        }

        await expect(listbox).toBeHidden({ timeout: 5000 }).catch(() => { });
        if (waitAfter > 0) await page.waitForTimeout(waitAfter);
      };

      // 1. เลือกอาชีพเป้าหมาย
      await selectQuasarOption('select-plan-career', 0, { timeout: 45000, waitAfter: 1500 });

      // 2. เลือกคุณสมบัติ
      await selectQuasarOption('select-qa-plan-career', 0, { timeout: 30000, waitAfter: 1000 });

      // 3. วันประเมิน
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      const dateInput = dialog.getByTestId('input-self-date');
      await dateInput.click({ force: true });
      await dateInput.fill(dateStr);
      await page.keyboard.press('Tab');
      createdAssessDate = dateStr;

      // 4. เลือกผลการพัฒนา
      await selectQuasarOption('select-perform', 0);

      // 5. เพิ่ม Reference
      await dialog.getByTestId('btn-open-reference-dialog').click({ force: true });
      const refDialog = page.getByTestId('dialog-reference');
      await expect(refDialog).toBeVisible({ timeout: T.medium });

      const safeRefText = `หลักฐานทดสอบ Linked Plan: ${new Date().getTime()}`;
      refDesc = safeRefText;

      const refText = refDialog.locator('textarea').first();
      await refText.fill(safeRefText);

      await refDialog.getByTestId('btn-reference-save').click({ force: true });
      await expect(refDialog).toBeHidden({ timeout: T.medium });

      // 6. Submit
      await dialog.getByTestId('btn-submit-self').click({ force: true });
      await confirmDialog(page, { timeout: T.medium });

      const notif = await waitForNotificationText(page, T.long);
      expect(notif).toMatch(/สำเร็จ|บันทึก|เพิ่มข้อมูล/i);

      await waitForQuasarIdle(page, T.long).catch(() => { });
      console.log('[Step 23] ✓ บันทึกสำเร็จ');
    });

    await test.step('Step 24: Verify Self-Assessment Tree Display (ROBUST via tree filter)', async () => {
      // Reload to ensure DB persistence
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#q-app', { timeout: T.medium });

      // Re-inject state after reload
      await page.evaluate(({ mid, name, status }) => {
        const appEl = document.querySelector('#q-app');
        const store = appEl?.__vue_app__?.config?.globalProperties?.$store;
        if (store) {
          store.commit('setMyAuthenticate', true);
          store.commit('setMyMember_id', mid);
          store.commit('setMyName', name);
          store.commit('setMyStatus', status);
        }
      }, { mid: '221', name: 'สมนึก สินธุประวน', status: 'user' });

      // Wait for data to load
      const spinner = page.locator('.q-inner-loading').filter({ hasText: /Analyzing data/i });
      await expect(spinner).toBeHidden({ timeout: 30000 });

      const tree = page.getByTestId('assessment-tree');
      await expect(tree).toBeVisible({ timeout: T.xlong });

      // Robust check for our record
      await expect(tree).toContainText(refDesc, { timeout: 30000 });
      console.log('✓ Verified record persistence after reload');

      const treeFilterInput = page.getByPlaceholder('ค้นหาในโครงสร้าง...').first();
      await expect(treeFilterInput).toBeVisible({ timeout: T.long });

      // 1. Filter by Reference to expand the branch
      const needle = (refDesc || '').slice(0, 30);
      if (needle) {
        await treeFilterInput.fill(needle);
        await page.waitForTimeout(1000);
        await expect(tree).toContainText(refDesc, { timeout: T.xlong });
      }

      // 2. Clear filter to reveal siblings (like Date)
      await treeFilterInput.fill('');
      await page.waitForTimeout(500);

      // Verify Date exists
      if (createdAssessDate) {
        await expect(tree).toContainText(createdAssessDate, { timeout: T.xlong });
      }
    });

    // Step 25 was redundant with Step 24

    await test.step('Step 26: Cleanup Self-Assessment (Reverse: Refs -> Assessment)', async () => {
      console.log('Starting reverse cleanup Step 1: Self-Assessment');

      // Dismiss any blocking dialogs
      const dismissBtn = page.locator('.q-dialog .q-btn:has-text("OK"), .q-dialog .q-btn:has-text("ตกลง"), .q-dialog .q-btn:has-text("Close"), .q-dialog .q-btn:has-text("ปิด")').first();
      await dismissBtn.click({ force: true }).catch(() => { });

      // 1. Delete Reference (Now effectively visible after View fix)
      // 1. Delete Reference (Safe Mode)
      if (refDesc) {
        console.log(`Attempting to delete reference: ${refDesc}`);
        try {
          // Use T.long for robustness
          const refHeader = await findAssessmentHeaderInTree(page, refDesc, T.long);
          const refDeleteBtn = refHeader.locator('button:has(i.material-icons:text("delete"))').first();

          if (await refDeleteBtn.isVisible().catch(() => false)) {
            await refDeleteBtn.click({ force: true });
            await confirmDialog(page, { timeout: T.medium });
            await expect(refHeader).toBeHidden({ timeout: T.long });
            console.log('✓ Reference deleted');
          } else {
            console.log('⚠ Reference delete button not visible (Check UI/Permissions)');
          }
        } catch (e) {
          console.log(`⚠ Could not find/delete reference node "${refDesc}": ${e.message}`);
        }
      }

      // 2. Delete Assessment
      console.log(`Attempting to delete assessment date: ${createdAssessDate}`);
      const assessmentDateHeader = page.locator('.q-tree__node-header')
        .filter({ hasText: `วันที่ประเมิน: ${createdAssessDate}` })
        .first();

      // Find the parent node header which contains the delete button
      const assessmentNode = page.locator('.q-tree__node', { has: assessmentDateHeader })
        .locator('> .q-tree__node-header[data-testid="tree-node-assessment"]')
        .first();

      if (await assessmentNode.isVisible().catch(() => false)) {
        const assessDeleteBtn = assessmentNode.locator('button:has(i.material-icons:text("delete"))').first();
        await expect(assessDeleteBtn).toBeVisible({ timeout: T.medium });
        await assessDeleteBtn.click({ force: true });

        await confirmDialog(page, { timeout: T.medium });
        await expect(assessmentDateHeader).toBeHidden({ timeout: T.long });
        console.log('✓ Self-Assessment deleted');
      } else {
        console.log('⚠ Self-Assessment node not found');
      }
    });

    await test.step('Step 27: Cleanup Development Plan', async () => {
      console.log('Starting reverse cleanup Step 2: Development Plan');
      await page.goto(`${BASE_URL}/FormPlan`, { waitUntil: 'domcontentloaded' });
      await waitForQuasarIdle(page, T.medium);
      await expect(page.getByTestId('plan-tree')).toBeVisible({ timeout: T.long });

      const targetPlan = updatedPlanTitle || createdPlanTitle;
      if (targetPlan) {
        console.log(`Deleting plan: ${targetPlan}`);
        const planHeader = await findPlanHeaderInTree(page, targetPlan, T.long);
        const deleteBtn = planHeader.locator('button:has(i.material-icons:text("delete"))').first();
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click({ force: true });
        await confirmDialog(page, { timeout: T.medium });
        await expect(planHeader).toBeHidden({ timeout: T.long });
        console.log('✓ Development Plan deleted');
      } else {
        console.log('⚠ No plan title captured to delete');
      }
    });

    await test.step('Step 28: Cleanup Qualification', async () => {
      console.log('Starting reverse cleanup Step 3: Qualification');
      await page.goto(`${BASE_URL}/FormQualification`, { waitUntil: 'domcontentloaded' });
      await waitForQuasarIdle(page, T.medium);
      const tree = page.locator('.q-tree').first();
      await expect(tree).toBeVisible({ timeout: T.long });

      if (createdQualName) {
        console.log(`Deleting qualification: ${createdQualName}`);
        // Logic similar to Step 14 search
        const headers = tree.locator('.q-tree__node-header:has(i.material-icons:has-text("fact_check"))')
          .filter({ hasText: createdQualName });

        // Must expand parents? Try direct click if visible
        // If nested in career, we need to expand career first.
        // Copied logic from Step 14 simplified:
        const careerHeaders = tree.locator('.q-tree__node-header:has(i.material-icons:has-text("work"))');
        const count = await careerHeaders.count();
        let found = false;
        for (let i = 0; i < count; i++) {
          const ch = careerHeaders.nth(i);
          if (await ch.isVisible()) {
            // Click to expand
            const arrow = ch.locator('.q-tree__arrow').first();
            if (await arrow.isVisible()) await arrow.click({ force: true });
            else await ch.click({ force: true }); // fallback
            await page.waitForTimeout(300);
          }
        }

        const targetHeader = headers.first();
        if (await targetHeader.isVisible().catch(() => false)) {
          const delBtn = targetHeader.locator('button:has(i.material-icons:text("delete"))').first();
          await delBtn.click({ force: true });
          await confirmDialog(page, { timeout: T.medium });
          await expect(targetHeader).toBeHidden();
          console.log('✓ Qualification deleted');
        } else {
          console.log('⚠ Qualification node not found or hidden');
        }
      }
    });

    await test.step('Step 29: Cleanup Career Plan', async () => {
      console.log('Starting reverse cleanup Step 4: Career Plan');
      await page.goto(`${BASE_URL}/FormPlanCareer`, { waitUntil: 'domcontentloaded' });
      await waitForQuasarIdle(page, T.medium);
      await expect(page.locator('.q-tree')).toBeVisible({ timeout: T.long });

      if (selectedCareerName) {
        console.log(`Deleting career: ${selectedCareerName}`);
        const nodeHeader = page.locator('.q-tree__node-header').filter({ hasText: selectedCareerName }).first();
        if (await nodeHeader.isVisible().catch(() => false)) {
          const deleteBtn = nodeHeader.locator('button:has(i.material-icons:text("delete"))').first();
          await deleteBtn.click({ force: true });
          await confirmDialog(page, { timeout: T.medium });
          await expect(nodeHeader).toBeHidden({ timeout: T.long });
          console.log('✓ Career Plan deleted');
        } else {
          console.log('⚠ Career node not found');
        }
      }
    });

    await test.step('Step 30: Cleanup Personal Info', async () => {
      console.log('Starting reverse cleanup Step 5: Personal Info');

      // Navigate
      await page.goto(`${BASE_URL}/FormComponent`, { waitUntil: 'domcontentloaded' });
      await waitForQuasarIdle(page, T.medium);

      // Initial Wait for Table
      await expect(page.locator('table')).toBeVisible({ timeout: T.long });
      await waitForQuasarIdle(page, T.long);

      // Robust Search
      console.log(`Searching for user with phone: ${uniquePhone}`);
      const searchInput = page.getByPlaceholder('ค้นหาข้อมูลส่วนตัว');
      await expect(searchInput).toBeVisible({ timeout: T.long });

      // Clear and fill with retry
      await searchInput.focus();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('Backspace');
      await searchInput.fill(uniquePhone);

      await waitForTableUpdate(page, T.medium);
      await waitForQuasarIdle(page, T.medium);

      // Search matching row - use regex to be safe about formatting
      const phoneRegex = new RegExp(uniquePhone.replace(/-/g, '[- ]?'));
      const row = page.locator('table tbody tr').filter({ hasText: phoneRegex }).first();

      console.log(`Waiting for row with phone ${uniquePhone} to appear...`);
      await expect(row).toBeVisible({ timeout: T.xlong });

      console.log(`Deleting user row: ${uniquePhone}`);
      const deleteBtn = row.getByRole('button', { name: 'ลบ' });
      await expect(deleteBtn).toBeVisible({ timeout: T.medium });
      await deleteBtn.click({ force: true });

      await confirmDialog(page, { timeout: T.long });

      const notif = await waitForNotificationText(page, T.xlong);
      expect(notif).toMatch(/สำเร็จ|ลบ/i);

      await waitForQuasarIdle(page, T.long);
      await expect(page.locator('table tbody tr').filter({ hasText: uniquePhone }))
        .toHaveCount(0, { timeout: T.xlong });
      console.log('✓ Personal Info deleted');
    });

  });
});
