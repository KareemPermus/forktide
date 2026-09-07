import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Recipes from '@/pages/recipes';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
}));

const mockRecipes = [
  { id: 1, title: 'Pasta Primavera', description: 'Veggie pasta', image_url: '', prep_time_minutes: 10, cook_time_minutes: 15, servings: 4, created_at: '2024-01-01' },
  { id: 2, title: 'Slow Roast Beef', description: 'Tender beef', image_url: '', prep_time_minutes: 20, cook_time_minutes: 120, servings: 6, created_at: '2024-01-02' },
];

beforeEach(() => jest.clearAllMocks());

test('renders recipes after loading', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  render(<Recipes />);
  expect(screen.getByText('Loading recipes…')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Pasta Primavera')).toBeInTheDocument());
  expect(screen.getByText('Slow Roast Beef')).toBeInTheDocument();
});

test('filters by search', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  render(<Recipes />);
  await waitFor(() => screen.getByText('Pasta Primavera'));
  fireEvent.change(screen.getByPlaceholderText('Search recipes…'), { target: { value: 'beef' } });
  expect(screen.queryByText('Pasta Primavera')).not.toBeInTheDocument();
  expect(screen.getByText('Slow Roast Beef')).toBeInTheDocument();
});

test('shows error on API failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Recipes />);
  await waitFor(() => expect(screen.getByText('Failed to load recipes.')).toBeInTheDocument());
});

test('filter tags work', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  render(<Recipes />);
  await waitFor(() => screen.getByText('Pasta Primavera'));
  fireEvent.click(screen.getByText('Quick (< 30 min)'));
  expect(screen.getByText('Pasta Primavera')).toBeInTheDocument();
  expect(screen.queryByText('Slow Roast Beef')).not.toBeInTheDocument();
});