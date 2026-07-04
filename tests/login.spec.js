const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('requires both email and password', async ({ page }) => {
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error'))
      .toHaveText('Enter both email and password.');
  });

  test('rejects a non-demo email', async ({ page }) => {
    await page.getByTestId('login-email').fill('pradeep');
    await page.getByTestId('login-password').fill('abc');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error'))
      .toHaveText('Invalid credentials. Use test@example.com.');
  });

  test('signs in with the demo account and any password', async ({ page }) => {
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('literally-anything');
    await page.getByTestId('login-submit').click();
    // Dashboard is shown: the leads table appears.
    await expect(page.getByRole('table', { name: 'Leads' })).toBeVisible();
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 4 of 4 leads');
  });

  test('email match is case-insensitive', async ({ page }) => {
    await page.getByTestId('login-email').fill('TEST@Example.com');
    await page.getByTestId('login-password').fill('x');
    await page.getByTestId('login-submit').click();
    await expect(page.getByRole('table', { name: 'Leads' })).toBeVisible();
  });

  test('Enter key in the password field submits', async ({ page }) => {
    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('x');
    await page.getByTestId('login-password').press('Enter');
    await expect(page.getByRole('table', { name: 'Leads' })).toBeVisible();
  });
});
