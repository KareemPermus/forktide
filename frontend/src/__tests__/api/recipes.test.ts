import { createMocks } from 'node-mocks-http';
import recipesHandler from '@/pages/api/recipes/index';
import recipeDetailHandler from '@/pages/api/recipes/[id]';

// Force SQLite path
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/recipes', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  it('POST creates recipe', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Recipe', ingredients: [{ name: 'Salt', quantity: '1', unit: 'tsp' }], steps: [{ step_number: 1, instruction: 'Do it' }] },
    });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Recipe');
    expect(data.ingredients).toHaveLength(1);
    expect(data.steps).toHaveLength(1);
  });

  it('POST without title returns 400', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/recipes/[id]', () => {
  it('GET with invalid id returns 400', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: 'abc' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('GET non-existent returns 404', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('DELETE returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '99999' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});