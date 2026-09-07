import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GroceryList from '@/pages/grocery-list';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('framer-motion', () => ({
  motion: { div: (props: any) => <div {...props} /> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockItems = [
  { id: 1, name: 'Milk', quantity: '1', unit: 'gallon', checked: false, recipe_id: null },
  { id: 2, name: 'Eggs', quantity: '12', unit: 'pcs', checked: true, recipe_id: 1 },
];

describe('GroceryList page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders items after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockItems });
    render(<GroceryList />);
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument());
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  it('shows empty state when no items', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<GroceryList />);
    await waitFor(() => expect(screen.getByText('Your grocery list is empty')).toBeInTheDocument());
  });

  it('adds an item', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { id: 3, name: 'Butter', quantity: '1', unit: 'lb', checked: false, recipe_id: null },
    });
    render(<GroceryList />);
    await waitFor(() => screen.getByPlaceholderText('Item name…'));
    fireEvent.change(screen.getByPlaceholderText('Item name…'), { target: { value: 'Butter' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(screen.getByText('Butter')).toBeInTheDocument());
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<GroceryList />);
    await waitFor(() => expect(screen.getByText('Failed to load grocery list')).toBeInTheDocument());
  });
});