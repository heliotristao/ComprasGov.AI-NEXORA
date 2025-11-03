import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrWizardPage from '../page';

const mockRouter = {
  replace: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams('?id=123&step=1&tipo=bens'),
}));

jest.mock('../_api/tr.client', () => ({
  fetchTrDocument: jest.fn().mockResolvedValue({
    document: { id: '123', tipo: 'bens', step: 1, updatedAt: new Date().toISOString() },
    values: {},
  }),
  createTrDraft: jest.fn(),
  autosaveTrDocument: jest.fn(),
  validateTrDocument: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({
    data: {
      document: { id: '123', tipo: 'bens', step: 1, updatedAt: new Date().toISOString() },
      values: {},
    },
    isLoading: false,
    error: null,
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('TrWizardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fall into an infinite loop on render', async () => {
    render(<TrWizardPage />);

    await waitFor(() => {
      expect(screen.getByText('Identificação')).toBeInTheDocument();
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should navigate to the next step when the next button is clicked', async () => {
    render(<TrWizardPage />);

    const nextButton = await screen.findByText('Avançar');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('?id=123&step=2&tipo=bens', { scroll: false });
    });
  });
});
