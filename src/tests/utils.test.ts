import { describe, expect, it } from 'vitest';
import { type SearchColumn, rowMatchesSearchQuery } from '../components/utils';

type Row = {
  name: string;
  active: boolean;
  score: number;
  tags?: string[];
};

const columns: SearchColumn<Row>[] = [
  { name: 'name' },
  {
    name: 'active',
    options: {
      customSearchValue: (value) => (value ? 'Enabled' : 'Disabled'),
    },
  },
  { name: 'score' },
  { name: 'tags' },
];

describe('rowMatchesSearchQuery', () => {
  const row: Row = {
    name: 'Alice',
    active: true,
    score: 42,
    tags: ['frontend', 'react'],
  };

  it('returns true when query is empty', () => {
    expect(rowMatchesSearchQuery(row, columns, '')).toBe(true);
  });

  it('matches string raw values', () => {
    expect(rowMatchesSearchQuery(row, columns, 'ali')).toBe(true);
  });

  it('matches non-string raw values', () => {
    expect(rowMatchesSearchQuery(row, columns, '42')).toBe(true);
    expect(rowMatchesSearchQuery(row, columns, 'true')).toBe(true);
  });

  it('matches custom rendered search values', () => {
    expect(rowMatchesSearchQuery(row, columns, 'enabled')).toBe(true);
  });

  it('matches array values', () => {
    expect(rowMatchesSearchQuery(row, columns, 'react')).toBe(true);
  });

  it('is case-insensitive and returns false when not found', () => {
    expect(rowMatchesSearchQuery(row, columns, 'ALICE')).toBe(true);
    expect(rowMatchesSearchQuery(row, columns, 'missing')).toBe(false);
  });
});
