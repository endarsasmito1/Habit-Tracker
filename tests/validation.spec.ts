import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 17: Input Validation & XSS', () => {
    test('1. XSS in habit name renders as text', async ({ page, request }) => {
        const xssName = 'Safe <script>alert("xss")</script>'; // Mixed content so it doesn't become empty
        const res = await request.post(`${API}/habits`, {
            data: { name: xssName, category: 'General', frequency: 'daily' },
        });
        const habit = await res.json();
        // Sanitization strips tags
        expect(habit.name).toBe('Safe ');

        await page.goto(`/habits/${habit.id}`);
        await page.waitForLoadState('networkidle');

        // Should NOT execute script — if it did, a dialog would appear
        // Verify the text is rendered literally
        const content = await page.content();
        expect(content).not.toContain('<script>alert');
        // The text should be escaped in the DOM
    });

    test('2. XSS in description', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `XSSDesc ${Date.now()}`, category: 'General', frequency: 'daily', description: '<img src=x onerror=alert(1)>' },
        })).json();

        expect(habit.description).not.toContain('<img');
        expect(habit.description).toBe('');
        // React auto-escapes, so this should be safe in the UI
    });

    test('3. XSS in check-in notes', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `XSSNotes ${Date.now()}`, category: 'General', frequency: 'daily' },
        })).json();

        const res = await request.post(`${API}/checkins`, {
            data: { habitId: habit.id, date: '2025-07-01', status: 'completed', notes: '<script>alert("xss")</script>' },
        });
        const log = await res.json();
        expect(log.notes).not.toContain('<script>');
        expect(log.notes).toBe('');
    });

    test('4. XSS in category name', async ({ request }) => {
        // Pure XSS payload => empty string => 400 Bad Request (Validation)
        const res = await request.post(`${API}/categories`, {
            data: { name: '<img src=x onerror=alert(1)>' },
        });
        expect(res.status()).toBe(400);
    });

    test('5. SQL injection in search', async ({ page }) => {
        await page.goto('/habits');
        await page.waitForLoadState('networkidle');

        const search = page.getByPlaceholder('Search habits...');
        await search.fill("'; DROP TABLE habits; --");
        await page.waitForTimeout(500);

        // Page should not crash
        await expect(page.locator('body')).toBeVisible();

        // Verify habits are still accessible
        const res = await page.request.get(`${API}/habits`);
        expect(res.ok()).toBeTruthy();
    });

    test('6. Unicode/emoji in all text fields', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: '🎯💪 Workout 📚', category: '🏋️ Fitness', frequency: 'daily', description: '🌟 Daily exercise routine 💫' },
        })).json();

        expect(habit.name).toContain('🎯');
        expect(habit.name).toContain('📚');
        expect(habit.category).toContain('🏋️');
        expect(habit.description).toContain('🌟');

        // Check-in with emoji
        const log = await (await request.post(`${API}/checkins`, {
            data: { habitId: habit.id, date: '2025-08-01', status: 'completed', notes: '😊 Great workout! 💪' },
        })).json();
        expect(log.notes).toContain('😊');
    });

    test('7. HTML entities in name', async ({ request }) => {
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: 'Read &amp; Write &lt;books&gt;', category: 'General', frequency: 'daily' },
        })).json();

        expect(habit.name).toContain('&amp;');
    });

    test('8. Very long description', async ({ request }) => {
        const longDesc = 'A'.repeat(5000);
        const habit = await (await request.post(`${API}/habits`, {
            data: { name: `LongDesc ${Date.now()}`, category: 'General', frequency: 'daily', description: longDesc },
        })).json();

        // Should either save full text or truncate gracefully
        expect(habit.description.length).toBeGreaterThan(0);
    });
});
