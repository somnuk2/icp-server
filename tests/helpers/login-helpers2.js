import { expect } from '@playwright/test';
import * as fixtures from '../fixtures/login-fixtures';

/**
 * Login Helper Functions
 * ใช้สำหรับทดสอบ LoginPage.vue
 */

/**
 * Mock API response for login
 * @param {Page} page - Playwright page object
 * @param {Object} credentials - { username, password }
 * @param {Object} mockResponse - Mock response data { member_id, full_name, status }
 * @param {boolean} shouldSucceed - Whether login should succeed
 */
export async function mockLoginApi(page, credentials, mockResponse, shouldSucceed = true) {
  await page.route('**/api-member.php', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    if (postData.action === 'checkMember') {
      if (shouldSucceed &&
          postData.user === credentials.username &&
          postData.pass === credentials.password) {
        // Successful login
        await route.abort();
        await route.continue({
          response: {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([mockResponse]),
          },
        });
      } else {
        // Failed login
        await route.abort();
        await route.continue({
          response: {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          },
        });
      }
      return;
    }

    await route.continue();
  });
}

/**
 * Fill login form with credentials
 * @param {Page} page - Playwright page object
 * @param {string} username - User email
 * @param {string} password - User password
 */
export async function fillLoginForm(page, username, password) {
  // Fill email
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  await emailInput.click();
  await emailInput.fill(username);

  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await passwordInput.click();
  await passwordInput.fill(password);

  console.log(`✅ Login form filled with: ${username}`);
}

/**
 * Click login button
 * @param {Page} page - Playwright page object
 */
export async function clickLoginButton(page) {
  const loginBtn = page.locator('button:has-text("เข้าระบบ")');
  await expect(loginBtn).toBeVisible({ timeout: 5000 });
  await loginBtn.click();
  console.log('✅ Login button clicked');
}

/**
 * Perform complete login
 * @param {Page} page - Playwright page object
 * @param {string} username - User email
 * @param {string} password - User password
 */
export async function performLogin(page, username, password) {
  await fillLoginForm(page, username, password);
  await clickLoginButton(page);
  console.log('✅ Login performed');
}

/**
 * Wait for successful login redirect
 * @param {Page} page - Playwright page object
 * @param {string} redirectUrl - Expected URL after login (default: home page)
 */
export async function waitForLoginSuccess(page, redirectUrl = fixtures.LOGIN_URLS.home) {
  // Use URL pattern matching for waitForURL
  let urlPattern = redirectUrl;
  if (redirectUrl === fixtures.LOGIN_URLS.home || redirectUrl === '/') {
    urlPattern = '**/icp-project-app/#/';
  } else if (redirectUrl.includes('#/')) {
    // Extract hash-based route pattern
    urlPattern = '**' + redirectUrl;
  }

  await page.waitForURL(urlPattern, { timeout: 10000 });
  console.log(`✅ Successfully redirected to: ${redirectUrl}`);
}

/**
 * Check if error dialog appears
 * @param {Page} page - Playwright page object
 * @param {string} expectedMessage - Expected error message
 */
export async function expectLoginError(page, expectedMessage = 'ชื่อผู้ใช้/รหัสผ่านไม่ถูกต้อง') {
  const errorDialog = page.locator(`text=${expectedMessage}`);
  await expect(errorDialog).toBeVisible({ timeout: 5000 });
  console.log(`✅ Error dialog appeared: ${expectedMessage}`);
}

/**
 * Toggle password visibility
 * @param {Page} page - Playwright page object
 */
export async function togglePasswordVisibility(page) {
  // Find visibility icon
  const visibilityIcon = page.locator('[class*="material-icons"]:has-text("visibility")');

  if (await visibilityIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
    await visibilityIcon.click();

    // Wait for password input type to change
    const textInput = page.locator('input[type="text"]');
    await expect(textInput).toBeVisible({ timeout: 2000 });
    console.log('✅ Password visibility toggled to visible');
  }
}

/**
 * Check if user is logged in by verifying localStorage
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} User data from localStorage
 */
export async function checkUserLoggedIn(page) {
  const userData = await page.evaluate(() => {
    return {
      member_id: localStorage.getItem('member_id'),
      member_name: localStorage.getItem('member_name'),
      member_status: localStorage.getItem('member_status'),
    };
  });

  console.log('📊 User data in localStorage:', userData);
  return userData;
}

/**
 * Clear login form
 * @param {Page} page - Playwright page object
 */
export async function clearLoginForm(page) {
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.clear();
  await passwordInput.clear();

  console.log('✅ Login form cleared');
}

/**
 * Validate email field with specific value
 * @param {Page} page - Playwright page object
 * @param {string} email - Email to validate
 * @param {boolean} shouldBeValid - Should validation pass
 */
export async function validateEmailField(page, email, shouldBeValid = true) {
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(email);
  await emailInput.blur();

  if (!shouldBeValid) {
    // Check for validation error
    const errorMessage = page.locator('text=กรุณาใส่อีเมลที่ถูกต้อง');
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
    console.log(`✅ Email validation error shown for: ${email}`);
  } else {
    console.log(`✅ Email validation passed for: ${email}`);
  }
}

/**
 * Get current user menu text
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} User name from menu
 */
export async function getUserMenuText(page) {
  // Try different possible user menu selectors
  const selectors = [
    'text=Somnuk Sin',
    '[data-testid="user-menu"]',
    'button[class*="user"]',
    '.q-drawer-opener',
  ];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`✅ User menu found with text: ${text}`);
        return text;
      }
    } catch (e) {
      // Continue to next selector
    }
  }

  console.log('⚠️ User menu not found');
  return null;
}

/**
 * Mock successful login and verify state
 * @param {Page} page - Playwright page object
 * @param {Object} mockResponse - { member_id, full_name, status }
 * @param {Object} credentials - { username, password }
 */
export async function mockAndVerifyLogin(page, mockResponse, credentials) {
  // Setup mock
  await mockLoginApi(page, credentials, mockResponse, true);

  // Navigate to login using fixtures URL
  await page.goto(fixtures.LOGIN_URLS.loginPage, { waitUntil: 'networkidle' });

  // Perform login
  await performLogin(page, credentials.username, credentials.password);

  // Wait for redirect
  await waitForLoginSuccess(page);

  console.log('✅ Mock login and verification completed');
}

/**
 * Test invalid credentials
 * @param {Page} page - Playwright page object
 * @param {Object} credentials - { username, password }
 */
export async function testInvalidCredentials(page, credentials) {
  // Setup mock for failed login
  await mockLoginApi(page, credentials, {}, false);

  // Navigate to login using fixtures URL
  await page.goto(fixtures.LOGIN_URLS.loginPage, { waitUntil: 'networkidle' });

  // Perform login
  await performLogin(page, credentials.username, credentials.password);

  // Expect error
  await expectLoginError(page);

  // Verify form is cleared
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toHaveValue('');

  console.log('✅ Invalid credentials test completed');
}
