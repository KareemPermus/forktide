import { createMocks } from 'node-mocks-http';
import groceryHandler from '@/pages/api/grocery-list/index';
import groceryPatchHandler from '@/pages/api/grocery-list/[id]';
import groceryGenerateHandler from '@/pages/api/grocery-list/generate';

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/grocery-list', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates item', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { name: 'Milk', quantity: '1', unit: 'L' } });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData()).name).toBe('Milk');
  });

  it('POST without name returns 400', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('DELETE clears all', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});

describe('/api/grocery-list/[id]', () => {
  it('PATCH invalid id returns 400', async () => {
    const { req, res } = createMocks({ method: 'PATCH', query: { id: 'abc' }, body: { checked: true } });
    await groceryPatchHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/grocery-list/generate', () => {
  it('POST without recipe_ids returns 400', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await groceryGenerateHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('GET returns 405', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await groceryGenerateHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});