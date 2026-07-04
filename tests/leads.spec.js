const { test, expect } = require('@playwright/test');

// Sign in before every lead test so each starts on the dashboard.
async function login(page) {
  await page.goto('/index.html');
  await page.getByTestId('login-email').fill('test@example.com');
  await page.getByTestId('login-password').fill('x');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('table', { name: 'Leads' })).toBeVisible();
}

test.describe('Leads dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows the four seed leads', async ({ page }) => {
    await expect(page.getByTestId('lead-rows').getByRole('row')).toHaveCount(4);
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 4 of 4 leads');
  });

  test('search filters by name', async ({ page }) => {
    await page.getByTestId('search').fill('Priya');
    await expect(page.getByTestId('lead-rows').getByRole('row')).toHaveCount(1);
    await expect(page.getByText('Northwind Retail')).toBeVisible();
  });

  test('search that matches nothing shows the empty state', async ({ page }) => {
    await page.getByTestId('search').fill('zzzz-no-match');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 0 of 4 leads');
  });

  test('status filter narrows the list', async ({ page }) => {
    await page.getByTestId('filter-new').click();
    // Two seed leads are "New" (Marcus Webb, Tomás Rivera).
    await expect(page.getByTestId('lead-rows').getByRole('row')).toHaveCount(2);
    await expect(page.getByText('Marcus Webb')).toBeVisible();
    await expect(page.getByText('Priya Raman')).toBeHidden();
  });

  test('add a valid lead updates the table and shows a toast', async ({ page }) => {
    await page.getByTestId('add-lead').click();
    await page.getByTestId('lead-name').fill('Nadia Khan');
    await page.getByTestId('lead-company').fill('Acme Co');
    await page.getByTestId('lead-email').fill('nadia@acme.com');
    await page.getByTestId('lead-save').click();

    await expect(page.getByTestId('toast')).toHaveText('Lead added.');
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 5 of 5 leads');
    await expect(page.getByText('Nadia Khan')).toBeVisible();
  });

  test('add lead validates required fields and email format', async ({ page }) => {
    await page.getByTestId('add-lead').click();
    await page.getByTestId('lead-save').click();
    await expect(page.getByTestId('name-error')).toHaveText('Name is required.');
    await expect(page.getByTestId('email-error')).toHaveText('Email is required.');

    await page.getByTestId('lead-name').fill('Bad Email');
    await page.getByTestId('lead-email').fill('not-an-email');
    await page.getByTestId('lead-save').click();
    await expect(page.getByTestId('email-error')).toHaveText('Enter a valid email address.');
  });

  test('blocks a duplicate email', async ({ page }) => {
    await page.getByTestId('add-lead').click();
    await page.getByTestId('lead-name').fill('Copy Cat');
    await page.getByTestId('lead-email').fill('priya@northwind.com'); // already exists
    await page.getByTestId('lead-save').click();
    await expect(page.getByTestId('duplicate-error'))
      .toHaveText('A lead with this email already exists.');
  });

  test('edit a lead saves changes', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Priya Raman' }).click();
    await page.getByTestId('lead-company').fill('Northwind Global');
    await page.getByTestId('lead-save').click();
    await expect(page.getByTestId('toast')).toHaveText('Changes saved.');
    await expect(page.getByText('Northwind Global')).toBeVisible();
  });

  test('delete a lead removes the row after confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete Marcus Webb' }).click();
    await page.getByTestId('delete-confirm').click();
    await expect(page.getByTestId('toast')).toHaveText('Lead deleted.');
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 3 of 3 leads');
    await expect(page.getByText('Marcus Webb')).toBeHidden();
  });

  test('cancelling a delete keeps the lead', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete Marcus Webb' }).click();
    await page.getByTestId('delete-cancel').click();
    await expect(page.getByText('Marcus Webb')).toBeVisible();
    await expect(page.getByTestId('lead-count')).toHaveText('Showing 4 of 4 leads');
  });

  test('sign out returns to the login screen', async ({ page }) => {
    await page.getByTestId('sign-out').click();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
});
