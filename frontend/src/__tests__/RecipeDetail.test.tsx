import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecipeDetailPage from '@/pages/recipes/[id]';
import apiClient from '@/api/client';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' }, push: jest.fn() }),
}));

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockRecipe = {
  id: 1,
  title: 'Test Recipe',
  description: 'A tasty dish',
  image_url: 'https://example.com/img.jpg',
  prep_time_minutes: 10,
  cook_time_minutes: 20,
  servings: 4,
  ingredients: [{ id: 1, name: 'Salt', quantity: '1', unit: 'tsp' }],
  steps: [{ id: 1, step_number: 1, instruction: 'Mix everything' }],
};

describe('RecipeDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders recipe details after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
    expect(screen.getByText('A tasty dish')).toBeInTheDocument();
    expect(screen.getByText(/Salt/)).toBeInTheDocument();
    expect(screen.getByText('Mix everything')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<RecipeDetailPage />);
    await waitFor(() => expect(screen.getByText('Failed to load recipe.')).toBeInTheDocument());
  });

  it('calls grocery generate on button click', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipe });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: [] });
    render(<RecipeDetailPage />);
    await waitFor(() => screen.getByText('Test Recipe'));
    fireEvent.click(screen.getByText('🛒 Add to Grocery List'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/grocery-list/generate', { recipe_ids: [1] }));
  });
});