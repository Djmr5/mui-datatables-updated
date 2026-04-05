import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MUITable } from '../components/MUITable';
import { type Data, rows, testDataColumns } from './test-data';

function getSearchButton() {
  return screen.getByLabelText('Search') as HTMLButtonElement;
}

describe('MUITable global search', () => {
  it('renders paginated legacy dataset on first page', () => {
    render(
      <MUITable<Data>
        title="Desserts"
        data={rows}
        columns={testDataColumns}
        deactivateSelect
      />,
    );

    expect(screen.getByText('Cupcake')).toBeInTheDocument();
    expect(screen.getByText('Gingerbread')).toBeInTheDocument();
    expect(screen.queryByText('Honeycomb')).not.toBeInTheDocument();
    expect(screen.getByText('1-5 of 31')).toBeInTheDocument();
  });

  it('filters rows using rendered search values via customSearchValue', async () => {
    const user = userEvent.setup();

    render(
      <MUITable<Data>
        title="Desserts"
        data={rows}
        columns={testDataColumns}
        deactivateSelect
      />,
    );

    await user.click(getSearchButton());
    await user.type(screen.getByPlaceholderText('Search...'), 'high protein');

    await waitFor(() => {
      expect(screen.getByText('Eclair')).toBeInTheDocument();
      expect(screen.queryByText('Cupcake')).not.toBeInTheDocument();
    });
  });

  it('still filters rows by original raw values', async () => {
    const user = userEvent.setup();

    render(
      <MUITable<Data>
        title="Desserts"
        data={rows}
        columns={testDataColumns}
        deactivateSelect
      />,
    );

    await user.click(getSearchButton());
    await user.type(screen.getByPlaceholderText('Search...'), 'donut');

    await waitFor(() => {
      expect(screen.getByText('Donut')).toBeInTheDocument();
      expect(screen.queryByText('Cupcake')).not.toBeInTheDocument();
    });
  });

  it('keeps search text when toggled and clears only with X', async () => {
    const user = userEvent.setup();

    render(
      <MUITable<Data>
        title="Desserts"
        data={rows}
        columns={testDataColumns}
        deactivateSelect
      />,
    );

    await user.click(getSearchButton());
    await user.type(screen.getByPlaceholderText('Search...'), 'donut');

    await waitFor(() => {
      expect(screen.getByText('Donut')).toBeInTheDocument();
      expect(screen.queryByText('Cupcake')).not.toBeInTheDocument();
    });

    await user.click(getSearchButton());
    await user.click(getSearchButton());

    expect(screen.getByPlaceholderText('Search...')).toHaveValue('donut');

    await user.click(screen.getByLabelText('Clear search'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      expect(screen.getByText('Cupcake')).toBeInTheDocument();
      expect(screen.getByText('Donut')).toBeInTheDocument();
    });
  });

  it('sorts by calories when clicking the calories header', async () => {
    const user = userEvent.setup();

    render(
      <MUITable<Data>
        title="Desserts"
        data={rows}
        columns={testDataColumns}
        deactivateSelect
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Calories' }));

    await waitFor(() => {
      const tableRows = screen.getAllByRole('checkbox');
      const firstRow = tableRows[0];
      expect(within(firstRow).getByText('Frozen yoghurt')).toBeInTheDocument();
    });
  });
});
