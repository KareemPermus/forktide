import { createMocks } from 'node-mocks-http';
import recipesHandler from '@/pages/api/recipes/index';
import recipeDetailHandler from '@/pages/api/recipes/[id]';

// Mock better-sqlite3 for tests
const mockAll = jest.fn().mockReturnValue([]);
const mockGet = jest.fn();
const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 });
const mockPrepare = jest.fn().mockReturnValue({ all: mockAll, get: mockGet, run: mockRun });
const mockExec = jest.fn();
const mockPragma = jest.fn();

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    pragma: mockPragma,
    exec: mockExec,
    prepare: mockPrepare,
  }));
});

// Ensure no supabase env
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

// Reset db module cache
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/recipes', () => {
  it('returns list of recipes', async () => {
    mockAll.mockReturnValueOnce([{ id: 1, title: 'Test', description: '', image_url: '', prep_time: 10, cook_time: 20, servings: 2, created_at: '2024-01-01' }]);
    const { req, res } = createMocks({ method: 'GET' });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
  });

  it('rejects unsupported methods', async () => {
    const { req, res } = createMocks({ method: 'PATCH' });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('POST /api/recipes', () => {
  it('requires title and instructions', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('creates recipe with valid data', async () => {
    mockGet.mockReturnValueOnce({ c: 0 }); // seed check
    mockGet.mockReturnValueOnce({ id: 1, title: 'New', description: null, image_url: null, prep_time: null, cook_time: null, servings: null, instructions: 'Do it', created_at: '2024-01-01' });
    const { req, res } = createMocks({ method: 'POST', body: { title: 'New', instructions: 'Do it' } });
    await recipesHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });
});

describe('GET /api/recipes/[id]', () => {
  it('returns 404 for missing recipe', async () => {
    mockGet.mockReturnValueOnce({ c: 0 }); // seed
    mockGet.mockReturnValueOnce(undefined);
    const { req, res } = createMocks({ method: 'GET', query: { id: '999' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('returns 400 for invalid id', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: 'abc' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('DELETE /api/recipes/[id]', () => {
  it('deletes a recipe', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await recipeDetailHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});