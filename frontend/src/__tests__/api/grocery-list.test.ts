import { createMocks } from 'node-mocks-http';
import groceryHandler from '@/pages/api/grocery-list/index';
import groceryItemHandler from '@/pages/api/grocery-list/[id]';
import clearCheckedHandler from '@/pages/api/grocery-list/clear-checked';
import fromRecipeHandler from '@/pages/api/grocery-list/from-recipe/[recipeId]';

const mockAll = jest.fn().mockReturnValue([]);
const mockGet = jest.fn();
const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 2 });
const mockPrepare = jest.fn().mockReturnValue({ all: mockAll, get: mockGet, run: mockRun });

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    pragma: jest.fn(),
    exec: jest.fn(),
    prepare: mockPrepare,
  }));
});

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

beforeEach(() => jest.clearAllMocks());

describe('GET /api/grocery-list', () => {
  it('returns items', async () => {
    mockAll.mockReturnValueOnce([{ id: 1, name: 'Milk', quantity: '1', unit: 'L', checked: 0, recipe_id: null, created_at: '2024-01-01' }]);
    const { req, res } = createMocks({ method: 'GET' });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
  });
});

describe('POST /api/grocery-list', () => {
  it('requires name', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('creates item', async () => {
    mockGet.mockReturnValueOnce({ c: 0 });
    mockGet.mockReturnValueOnce({ id: 1, name: 'Eggs', quantity: '12', unit: 'pcs', checked: 0, recipe_id: null, created_at: '2024-01-01' });
    const { req, res } = createMocks({ method: 'POST', body: { name: 'Eggs', quantity: '12', unit: 'pcs' } });
    await groceryHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });
});

describe('PATCH /api/grocery-list/[id]', () => {
  it('updates item', async () => {
    mockGet.mockReturnValueOnce({ c: 0 });
    mockGet.mockReturnValueOnce({ id: 1, name: 'Milk', quantity: '1', unit: 'L', checked: 0 });
    mockGet.mockReturnValueOnce({ id: 1, name: 'Milk', quantity: '1', unit: 'L', checked: 1 });
    const { req, res } = createMocks({ method: 'PATCH', query: { id: '1' }, body: { checked: true } });
    await groceryItemHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
  });
});

describe('DELETE /api/grocery-list/[id]', () => {
  it('deletes item', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await groceryItemHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
  });
});

describe('DELETE /api/grocery-list/clear-checked', () => {
  it('clears checked items', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await clearCheckedHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(typeof data.deleted_count).toBe('number');
  });

  it('rejects non-DELETE', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await clearCheckedHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('POST /api/grocery-list/from-recipe/[recipeId]', () => {
  it('returns 404 when no ingredients', async () => {
    mockAll.mockReturnValueOnce([]);
    const { req, res } = createMocks({ method: 'POST', query: { recipeId: '999' } });
    await fromRecipeHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('creates items from recipe ingredients', async () => {
    mockAll.mockReturnValueOnce([{ name: 'Flour', quantity: '500', unit: 'g' }]);
    const { req, res } = createMocks({ method: 'POST', query: { recipeId: '1' } });
    await fromRecipeHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });
});