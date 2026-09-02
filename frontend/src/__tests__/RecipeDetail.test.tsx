import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecipeDetailPage from '@/pages/recipes/[id]';
import apiClient from '@/api/client';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' } }),
}));

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockRecipe = {
  id: 1,
  title: 'Lemon Herb Salmon',
  description: 'Delicious salmon',
  image_url: '',
  prep_time: 10,
  cook_time: 20,
  servings: 4,
  instructions: 'Season the salmon\nBake at 400F\nServe with lemon',
  created_at: '2025-01-01T00:00:00Z',
  ingredients: [
    { id: 1, name: 'Salmon', quantity: '2', unit: 'fillets' },
    { id: 2, name: 'Lemon', quantity: '1', unit: '' },
  ],
};

describe('RecipeDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders recipe details on success', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Lemon Herb Salmon')).toBeInTheDocument());
    expect(screen.getByText('Salmon')).toBeInTheDocument();
    expect(screen.getByText('Season the salmon')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Failed to load recipe.')).toBeInTheDocument());
  });

  it('adds ingredients to grocery list', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: [] });
    render(<RecipeDetailPage />);
    await waitFor(() => screen.getByText('Lemon Herb Salmon'));
    fireEvent.click(screen.getByText('Add to List'));
    await waitFor(() => expect(screen.getByText('✓ Added to grocery list!')).toBeInTheDocument());
    expect(apiClient.post).toHaveBeenCalledWith('/api/grocery-list/from-recipe/1');
  });
});