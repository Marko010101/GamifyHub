import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  csvValue?: (row: T) => string
  sortable?: boolean
  width?: string | number
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function exportToCsv<T>(columns: Column<T>[], rows: T[], filename: string) {
  const exportCols = columns.filter((c) => c.csvValue != null)
  const header = exportCols.map((c) => escapeCsvCell(c.header)).join(',')
  const body = rows
    .map((row) => exportCols.map((c) => escapeCsvCell(c.csvValue!(row))).join(','))
    .join('\n')
  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  totalCount: number
  page: number
  rowsPerPage: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onRowsPerPageChange?: (limit: number) => void
  onSortChange?: (key: string, order: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  emptyMessage?: string
  exportFilename?: string
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  totalCount,
  page,
  rowsPerPage,
  sortBy,
  sortOrder = 'asc',
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  emptyMessage,
  exportFilename,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSortChange) return
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc'
    onSortChange(key, newOrder)
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? rows.map(keyExtractor) : [])
  }

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(
      checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key),
    )
  }

  const allSelected = rows.length > 0 && rows.every((r) => selectedKeys.includes(keyExtractor(r)))
  const someSelected = rows.some((r) => selectedKeys.includes(keyExtractor(r)))

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <Box>
      {exportFilename && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportToCsv(columns, rows, exportFilename)}
          >
            Export CSV
          </Button>
        </Box>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={(_, checked) => handleSelectAll(checked)}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  width={col.width}
                  sortDirection={sortBy === col.key ? sortOrder : false}
                >
                  {col.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : 'asc'}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const key = keyExtractor(row)
              const isSelected = selectedKeys.includes(key)
              return (
                <TableRow
                  key={key}
                  hover={Boolean(onRowClick)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  selected={isSelected}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(_, checked) => handleSelectRow(key, checked)}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(row)}</TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={
          onRowsPerPageChange
            ? (e) => onRowsPerPageChange(Number(e.target.value))
            : undefined
        }
      />
    </Box>
  )
}
