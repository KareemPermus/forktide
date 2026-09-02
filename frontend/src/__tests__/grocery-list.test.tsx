import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroceryList from '@/pages/grocery-list';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mockItems = [
  { id: 1, name: 'Milk', quantity: '1', unit: 'gallon', checked: false, created_at: '2025-01-01', recipe_id: null },
  { id: 2, name: 'Eggs', quantity: '12', unit: 'pcs', checked: true, created_at: '2025-01-01', recipe_id: null },
];

describe('GroceryList', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders items after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockItems });
    render(<GroceryList />);
    await waitFor(() => { expect(screen.getByText('Milk')).toBeInTheDocument(); });
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  it('shows empty state when no items', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<GroceryList />);
    await waitFor(() => { expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument(); });
  });

  it('adds a new item', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Bread', quantity: '1', unit: 'loaf', checked: false, created_at: '2025-01-01' } });
    render(<GroceryList />);
    await waitFor(() => { expect(screen.getByPlaceholderText('Item name…')).toBeInTheDocument(); });
    fireEvent.change(screen.getByPlaceholderText('Item name…'), { target: { value: 'Bread' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => { expect(screen.getByText('Bread')).toBeInTheDocument(); });
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<GroceryList />);
    await waitFor(() => { expect(screen.getByText('Failed to load grocery list')).toBeInTheDocument(); });
  });
});