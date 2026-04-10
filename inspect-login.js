/**
 * Mini script เพื่อดู Selector จริงๆ ของหน้า Login
 */
import { chromium } from 'playwright';

const BASE_URL = 'https://icp.sif.or.th/icp-project-app';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE_URL}/#/LoginPage`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// ดึง HTML ของ inputs ทั้งหมด
const inputs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('input')).map((el, i) => ({
    index: i,
    type: el.type,
    id: el.id,
    name: el.name,
    className: el.className,
    ariaLabel: el.getAttribute('aria-label'),
    placeholder: el.placeholder,
  }));
});

console.log('=== INPUT ELEMENTS ===');
console.log(JSON.stringify(inputs, null, 2));

// ดึง Submit button
const buttons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).map((el, i) => ({
    index: i,
    type: el.type,
    className: el.className,
    textContent: el.textContent?.trim().substring(0, 50),
  }));
});

console.log('\n=== BUTTONS ===');
console.log(JSON.stringify(buttons, null, 2));

await browser.close();
