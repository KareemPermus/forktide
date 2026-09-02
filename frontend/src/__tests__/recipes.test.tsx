import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Recipes from '@/pages/recipes';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockRecipes = [
  { id: 1, title: 'Pasta', description: 'Delicious', image_url: '', prep_time: 10, cook_time: 20, servings: 4, created_at: '2025-01-01' },
  { id: 2, title: 'Salad', description: 'Fresh', image_url: null, prep_time: 5, cook_time: 0, servings: 2, created_at: '2025-01-02' },
];

beforeEach(() => { jest.clearAllMocks(); });

test('renders recipes after loading', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  render(<Recipes />);
  await waitFor(() => { expect(screen.getByText('Pasta')).toBeInTheDocument(); });
  expect(screen.getByText('Salad')).toBeInTheDocument();
  expect(screen.getByText('2 recipes in your library')).toBeInTheDocument();
});

test('shows error state', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Recipes />);
  await waitFor(() => { expect(screen.getByText('Failed to load recipes')).toBeInTheDocument(); });
});

test('filters recipes by search', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
  render(<Recipes />);
  await waitFor(() => { expect(screen.getByText('Pasta')).toBeInTheDocument(); });
  fireEvent.change(screen.getByPlaceholderText('Search recipes…'), { target: { value: 'salad' } });
  expect(screen.queryByText('Pasta')).not.toBeInTheDocument();
  expect(screen.getByText('Salad')).toBeInTheDocument();
});

test('opens and closes add recipe modal', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
  render(<Recipes />);
  await waitFor(() => { expect(screen.getByText('Add Recipe')).toBeInTheDocument(); });
  fireEvent.click(screen.getByText('Add Recipe'));
  expect(screen.getByText('Add a Recipe')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.queryByText('Add a Recipe')).not.toBeInTheDocument();
});