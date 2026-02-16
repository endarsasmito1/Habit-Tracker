import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000/api';

test.describe('Suite 8: Categories API', () => {
    let categoryId: string;

    test('1. List categories (initially may be empty)', async ({ request }) => {
        const res = await request.get(`${API}/categories`);
        expect(res.ok()).toBeTruthy();
        const data = await res.json();
        expect(Array.isArray(data)).toBeTruthy();
    });

    test('2. Create category', async ({ request }) => {
        const res = await request.post(`${API}/categories`, {
            data: { name: `Cat ${Date.now()}`, color: '#ff5733' },
        });
        expect(res.status()).toBe(201);
        const cat = await res.json();
        expect(cat.name).toContain('Cat');
        expect(cat.color).toBe('#ff5733');
        categoryId = cat.id;
    });

    test('3. Create with empty name returns 400', async ({ request }) => {
        const res = await request.post(`${API}/categories`, {
            data: { name: '' },
        });
        expect(res.status()).toBe(400);
    });

    test('4. List after create includes new category', async ({ request }) => {
        // Ensure at least one exists
        const create = await request.post(`${API}/categories`, {
            data: { name: `List Test ${Date.now()}` },
        });
        const cat = await create.json();

        const res = await request.get(`${API}/categories`);
        const cats = await res.json();
        const found = cats.find((c: any) => c.id === cat.id);
        expect(found).toBeTruthy();
    });

    test('5. Update category', async ({ request }) => {
        const create = await request.post(`${API}/categories`, {
            data: { name: `Update Me ${Date.now()}` },
        });
        const cat = await create.json();

        const res = await request.patch(`${API}/categories/${cat.id}`, {
            data: { name: 'Updated Name', color: '#00ff00' },
        });
        expect(res.ok()).toBeTruthy();
        const updated = await res.json();
        expect(updated.name).toBe('Updated Name');
    });

    test('6. Update non-existent returns 404', async ({ request }) => {
        const res = await request.patch(`${API}/categories/fake-id`, {
            data: { name: 'Ghost' },
        });
        expect(res.status()).toBe(404);
    });

    test('7. Delete category', async ({ request }) => {
        const create = await request.post(`${API}/categories`, {
            data: { name: `Delete Me ${Date.now()}` },
        });
        const cat = await create.json();

        const res = await request.delete(`${API}/categories/${cat.id}`);
        expect(res.ok()).toBeTruthy();
    });

    test('8. Delete non-existent returns 404', async ({ request }) => {
        const res = await request.delete(`${API}/categories/fake-id`);
        expect(res.status()).toBe(404);
    });

    test('9. Special chars in category name', async ({ request }) => {
        const res = await request.post(`${API}/categories`, {
            data: { name: '🎯 Focus & <script>alert(1)</script>' },
        });
        expect(res.status()).toBe(201);
        const cat = await res.json();
        expect(cat.name).toContain('🎯');
        expect(cat.name).not.toContain('<script>');
    });

    test('10. Create multiple categories', async ({ request }) => {
        const names = [`Multi1 ${Date.now()}`, `Multi2 ${Date.now()}`, `Multi3 ${Date.now()}`];
        for (const name of names) {
            const res = await request.post(`${API}/categories`, { data: { name } });
            expect(res.status()).toBe(201);
        }

        const all = await request.get(`${API}/categories`);
        const cats = await all.json();
        expect(cats.length).toBeGreaterThanOrEqual(3);
    });
});
