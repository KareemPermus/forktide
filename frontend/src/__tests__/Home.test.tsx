import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/index';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
}));

const mockRecipes = [
  { id: 1, title: 'Test Recipe', description: 'Desc', image_url: '', prep_time_minutes: 10, cook_time_minutes: 20, servings: 4, created_at: '2024-01-01' },
];

describe('Home page', () => {
  it('renders hero and stats', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });
    render(<Home />);
    expect(screen.getByText('Good morning, Chef')).toBeInTheDocument();
    expect(screen.getByText('Total Recipes')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Test Recipe')).toBeInTheDocument());
  });

  it('shows error state on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Failed to load recipes')).toBeInTheDocument());
  });

  it('shows empty state when no recipes', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Home />);
    await waitFor(() => expect(screen.getByText('No recipes yet. Add some!')).toBeInTheDocument());
  });
});