import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import { Column } from './MUITable';
import { Order } from './utils';

interface EnhancedTableProps<T> {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: keyof T;
  rowCount: number;
  columns: Column[];
  deactivateSelectAll?: boolean;
}

export function EnhancedTableHead<T>({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  columns,
  deactivateSelectAll,
}: EnhancedTableProps<T>) {
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {!deactivateSelectAll &&
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all items',
              }}
            />
          </TableCell>
        }
        {columns.map((column) => (
          <TableCell
            key={String(column.name)}
            padding='normal'
            sortDirection={orderBy === column.name ? order : false}
          >
            {column.options?.sort !== false ? (
              <TableSortLabel
                active={orderBy === column.name}
                direction={orderBy === column.name ? order : 'asc'}
                onClick={createSortHandler(column.name as keyof T)}
                sx={{ fontWeight: 'bold' }}
              >
                {column.label}
                {orderBy === column.name ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              <span style={{ fontWeight: 700 }}>{column.label}</span>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
