import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/home';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockRecipes = [
  { id: 1, title: 'Test Recipe', description: 'Desc', image_url: '', prep_time: 10, cook_time: 20, servings: 4, created_at: '2025-01-01T00:00:00Z' },
];
const mockGrocery = [
  { id: 1, name: 'Eggs', quantity: '12', unit: 'pcs', checked: false, recipe_id: 1, created_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Milk', quantity: '1', unit: 'L', checked: true, recipe_id: null, created_at: '2025-01-01T00:00:00Z' },
];

describe('Home page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders KPI cards and recipes after loading', async () => {
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/recipes') return Promise.resolve({ data: mockRecipes });
      if (url === '/api/grocery-list') return Promise.resolve({ data: mockGrocery });
      return Promise.resolve({ data: [] });
    });

    render(<Home />);
    await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument(); // total recipes
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows empty state when no recipes', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Home />);
    await waitFor(() => expect(screen.getByText('No recipes yet')).toBeInTheDocument());
  });

  it('handles API errors gracefully', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Failed to load data')).toBeInTheDocument());
  });
});