import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MUITable } from '../components/MUITable';
import { type Data, rows, testDataColumns } from './test-data';

function getMaximumDepthErrors(calls: unknown[][]): unknown[][] {
  return calls.filter((call) =>
    call.some(
      (value) =>
        typeof value === 'string' && value.includes('Maximum update depth exceeded'),
    ),
  );
}

describe('MUITable stability and performance regressions', () => {
  it('does not trigger max update depth when columns are auto-generated across rerenders', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const { rerender } = render(
        <MUITable<Data>
          title="Desserts"
          data={rows}
          deactivateSelect
        />,
      );

      for (let iteration = 0; iteration < 8; iteration += 1) {
        rerender(
          <MUITable<Data>
            title={`Desserts ${iteration}`}
            data={[...rows]}
            deactivateSelect
          />,
        );
      }

      await user.click(screen.getByLabelText('Search'));
      await user.type(screen.getByPlaceholderText('Search...'), 'donut');

      await waitFor(() => {
        expect(screen.getByText('Donut')).toBeInTheDocument();
      });

      const maxDepthErrors = getMaximumDepthErrors(consoleErrorSpy.mock.calls);
      expect(maxDepthErrors).toHaveLength(0);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('stays stable while repeatedly toggling search and filters', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <MUITable<Data>
          title="Desserts"
          data={rows}
          columns={testDataColumns}
          deactivateSelect
        />,
      );

      for (let iteration = 0; iteration < 5; iteration += 1) {
        await user.click(screen.getByLabelText('Search'));
        await user.click(screen.getByLabelText('Filter list'));
        await user.click(screen.getByRole('button', { name: 'Reset' }));
        await user.click(document.body);
      }

      await waitFor(() => {
        expect(screen.getByText('Cupcake')).toBeInTheDocument();
      });

      const maxDepthErrors = getMaximumDepthErrors(consoleErrorSpy.mock.calls);
      expect(maxDepthErrors).toHaveLength(0);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
