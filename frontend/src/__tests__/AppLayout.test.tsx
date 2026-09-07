import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

import AppLayout from '@/components/layout/AppLayout';

describe('AppLayout', () => {
  it('renders brand name and nav links', () => {
    render(<AppLayout><div>Test Content</div></AppLayout>);
    expect(screen.getByText('Forktide')).toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Grocery List')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});