import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MUITable } from '../components/MUITable';
import type { Column } from '../components/MUITable';
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

  it('matches customBodyRender text in global search without customSearchValue', async () => {
    const user = userEvent.setup();

    const emojiData = [
      { id: 1, active: true },
      { id: 2, active: false },
    ];

    const emojiColumns: Column[] = [
      {
        name: 'active',
        label: 'Status',
        options: {
          customBodyRender: (value: boolean) => (value ? ':)' : ':('),
        },
      },
    ];

    render(
      <MUITable<(typeof emojiData)[number]>
        title="Emoji"
        data={emojiData}
        columns={emojiColumns}
        deactivateSelect
      />,
    );

    await user.click(getSearchButton());
    await user.type(screen.getByPlaceholderText('Search...'), ':)');

    await waitFor(() => {
      expect(screen.getByText(':)')).toBeInTheDocument();
      expect(screen.queryByText(':(')).not.toBeInTheDocument();
    });
  });

  it('matches customBodyRender text in string filters', async () => {
    const user = userEvent.setup();

    const formatDate = (value: string) => {
      if (!value) return '-';
      const date = new Date(value);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }).format(date).replace(',', '');
    };

    const dateData = [
      { id: 1, createdAt: '2026-05-20T20:01:00Z' },
      { id: 2, createdAt: '2026-01-01T10:15:00Z' },
    ];

    const dateColumns: Column[] = [
      {
        name: 'createdAt',
        label: 'Created At',
        options: {
          customBodyRender: (value: string) => formatDate(value),
        },
      },
    ];

    render(
      <MUITable<(typeof dateData)[number]>
        title="Dates"
        data={dateData}
        columns={dateColumns}
        deactivateSelect
      />,
    );

    await user.click(screen.getByLabelText('Filter list'));
    const filterInputs = screen.getAllByPlaceholderText('Search...');
    await user.type(filterInputs[filterInputs.length - 1], 'mayo');
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.getByText((content) => content.toLowerCase().includes('mayo'))).toBeInTheDocument();
      expect(screen.queryByText((content) => content.toLowerCase().includes('enero'))).not.toBeInTheDocument();
    });
  });
});
