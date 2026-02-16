import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

setup('create test user and authenticate', async ({ page }) => {
    // Ensure dir exists
    const dir = path.dirname(authFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.goto('/auth');

    // Switch to Sign Up
    const toggleBtn = page.getByRole('button', { name: 'Sign Up' });
    if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
    }

    // Fill sign up form
    const testEmail = `e2e_test_${Date.now()}@test.com`;
    await page.getByPlaceholder('Your Name').fill('E2E Test User');
    await page.getByPlaceholder('hello@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill('TestPassword123!');

    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Save storage state (cookies + localStorage)
    await page.context().storageState({ path: authFile });
});
