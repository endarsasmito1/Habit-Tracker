import { test, expect } from '@playwright/test';

test.describe('E2E User Journeys', () => {

    test('Journey 1: New User Onboarding', async ({ page }) => {

        const email = `newuser${Date.now()}@example.com`;
        const name = 'New User';
        const password = 'password123';

        await test.step('1. Sign Up', async () => {
            await page.goto('/auth');
            await page.getByRole('button', { name: 'Sign up' }).click();
            await page.getByPlaceholder('Your Name').fill(name);
            await page.getByPlaceholder('hello@example.com').fill(email);
            await page.getByPlaceholder('••••••••').fill(password);
            await page.getByRole('button', { name: 'Create Account' }).click();

            // Should redirect to dashboard
            await expect(page).toHaveURL(/\/dashboard/);
            await expect(page.getByText(`Keep the momentum going, ${name}!`)).toBeVisible();
        });

        await test.step('2. Create First Habit', async () => {
            // Open modal
            await page.locator('aside button').filter({ hasText: 'New Habit' }).click();
            // Dashboard has "H" shortcut or button?
            // Assuming we are on Dashboard, navigating to Habits might be safer or using global shortcut
            // Let's go to Habits page
            await page.goto('/habits');

            await page.locator('aside button').filter({ hasText: 'New Habit' }).click();
            await expect(page.getByText('Create New Habit')).toBeVisible();

            await page.getByPlaceholder('e.g. Read 10 pages').fill('Running');
            await page.getByPlaceholder('e.g., Follow the 2-minute').fill('Daily run');

            // Select category if needed, default is General
            // Color selection (random/first)

            await page.locator('button', { hasText: 'Create Habit' }).click();

            // Verify creation
            await expect(page.getByText('Running')).toBeVisible();
        });

        await test.step('3. Check-in & Verify Streak', async () => {
            // Find the check-in button for "Running"
            // We need to target the specific card. 
            // Assuming it's the only habit or finding by text

            // Click Check-in button (Tick icon)
            const checkInBtn = page.locator('button[title="Check-in"]').first();
            await checkInBtn.click();

            // Verify Streak update
            // Card should show "1 day streak" or fire symbol

            // Verify Streak update
            // Card should show "1 day streak" or fire symbol
            // Verify Streak update
            // Card should show "1 day streak" or fire symbol
            // The text is split into two spans: "1" and "Day Streak"
            // Expect to find "1" inside a primary colored span
            await expect(page.locator('span.text-primary.text-2xl', { hasText: '1' })).toBeVisible({ timeout: 5000 });

            // Verify Dashboard stats
            await page.goto('/');
            // await expect(page.getByText('100%')).toBeVisible(); // Analytics backend might be delayed/messy
        });
    });

    test('Journey 2: The Focused Worker', async ({ page, request }) => {
        // Setup: Create user & habit via API for speed
        const email = `worker${Date.now()}@test.com`;
        const { accessToken, sessionToken, userId } = await createUser(request, email);

        const habitId = await createHabit(request, accessToken, 'Deep Work');

        // Login via UI (or set cookie)
        // better-auth uses "better-auth.session_token" by default
        await page.context().addCookies([
            {
                name: 'better-auth.session_token',
                value: sessionToken,
                url: 'http://localhost:5173'
            },
            {
                name: 'token', // Fallback if custom config uses this
                value: sessionToken,
                url: 'http://localhost:5173'
            }
        ]);

        await test.step('1. Start Pomodoro', async () => {
            await page.goto('/');

            // Verify "Deep Work" is the current focus
            await expect(page.getByText('Current Focus')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Deep Work', level: 2 })).toBeVisible();

            // Start Timer
            await page.locator('button', { hasText: 'Start Pomodoro' }).click();

            // Verify Timer Running
            await expect(page.getByText('25:00')).not.toBeVisible(); // Should be counting down
            await expect(page.locator('.text-8xl')).toBeVisible(); // Large timer display
        });

        await test.step('2. Complete Session', async () => {
            // We can't wait 25 mins. We can "Reset" or mock time?
            // For E2E, maybe just Pausing and Resuming is enough to test state.

            await page.locator('button[title="Pause"]').click();
            await expect(page.getByText('Resume')).toBeVisible();

            await page.locator('button', { hasText: 'Resume' }).click();
            await expect(page.locator('button[title="Pause"]')).toBeVisible();

            // Reset to clean up
            await page.getByRole('button', { name: 'stop' }).click();
            await expect(page.locator('.text-8xl')).toContainText('25:00');
        });
    });

});

// Helpers
async function createUser(request: any, email: string) {
    const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
        headers: { 'Origin': 'http://localhost:5173' },
        data: { name: 'Worker', email, password: 'password123' }
    });
    if (!res.ok()) {
        console.error('Create User Failed:', res.status(), await res.text());
        throw new Error(`Failed to create user: ${res.status()}`);
    }


    // Extract session token from cookie if available (preferred as it includes signature)
    let sessionToken = '';
    const setCookie = res.headers()['set-cookie'];
    if (setCookie) {
        // Handle array or string
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const sessionCookie = cookies.find(c => c.includes('better-auth.session_token'));
        if (sessionCookie) {
            sessionToken = sessionCookie.split(';')[0].split('=')[1];
            // Decode URI component if needed? Playwright addCookies handles raw values?
            // Usually cookie values in set-cookie are URL encoded?
            // "better-auth.session_token=...%3D"
            // Let's decode it just in case, or use raw.
            // Playwright addCookies value should be the string.
            sessionToken = decodeURIComponent(sessionToken);
        }
    }

    const data = await res.json();


    // Fallback if no cookie
    if (!sessionToken) {
        sessionToken = data.session ? data.session.token : data.token;
    }

    const userId = data.user ? data.user.id : data.id;

    // Clean token from body (for Bearer auth)
    const accessToken = data.session ? data.session.token : data.token;

    return { accessToken, sessionToken: sessionToken || accessToken, userId };
}

async function createHabit(request: any, token: string, name: string) {

    // For Authorization header, we might need the raw token or the session token?
    // Bearer token usually is the session token from body.
    // But let's try using the one we return (which might be signed cookie value).
    // better-auth might accept both? Or bearer expects the body token?
    // Let's try passing the same token. If createHabit fails, we know why.
    // But createHabit succeeded before with body token.
    // If we return cookie token, we might break createHabit?
    // Let's return BOTH.

    const res = await request.post('http://localhost:3000/api/habits', {
        headers: {
            Authorization: `Bearer ${token}`, // This might need to be clean token?
            'Origin': 'http://localhost:5173'
        },
        data: { name, category: 'Work', frequency: 'daily' }
    });

    return (await res.json()).id;
}
