export type Order = 'asc' | 'desc';

export interface SearchColumn<T extends object> {
  name: string;
  options?: {
    customSearchValue?: (value: any, row: Record<string, any>) => unknown;
  };
}

export function getComparator<T, Key extends keyof T>(
  order: Order,
  orderBy: Key,
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a[orderBy], b[orderBy])
    : (a, b) => -descendingComparator(a[orderBy], b[orderBy]);
}

function descendingComparator<T>(a: T, b: T): number {
  if (b < a) return -1;
  if (b > a) return 1;
  return 0;
}

function toSearchTokens(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value.reduce<string[]>((tokens, item: unknown) => {
      tokens.push(...toSearchTokens(item));
      return tokens;
    }, []);
  }

  if (value instanceof Date) {
    return [value.toISOString().toLowerCase()];
  }

  const valueType = typeof value;
  if (
    valueType === 'string' ||
    valueType === 'number' ||
    valueType === 'boolean' ||
    valueType === 'bigint'
  ) {
    return [String(value).toLowerCase()];
  }

  return [];
}

export function rowMatchesSearchQuery<T extends object>(
  row: T,
  columns: SearchColumn<T>[],
  searchQuery: string,
): boolean {
  const normalizedQuery = searchQuery.toLowerCase();

  if (!normalizedQuery) return true;

  return columns.some((column) => {
    const rawValue = (row as Record<string, unknown>)[column.name];
    const rawTokens = toSearchTokens(rawValue);

    if (rawTokens.some((token) => token.includes(normalizedQuery))) {
      return true;
    }

    const customSearchValue = column.options?.customSearchValue;
    if (!customSearchValue) {
      return false;
    }

    const renderedTokens = toSearchTokens(customSearchValue(rawValue, row));
    return renderedTokens.some((token) => token.includes(normalizedQuery));
  });
}

