import { Box, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusChip } from '@/components/common/StatusChip'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Wheel } from '@/types/wheel'
import { ROUTES } from '@/constants/routes'
import { useDeleteWheel } from '../composables/useDeleteWheel'

interface WheelTableProps {
  rows: Wheel[]
  totalCount: number
  page: number
  rowsPerPage: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onRowsPerPageChange: (limit: number) => void
  onSortChange: (key: string, order: 'asc' | 'desc') => void
}

export function WheelTable({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
}: WheelTableProps) {
  const navigate = useNavigate()
  const { mutate: deleteWheel } = useDeleteWheel()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const columns: Column<Wheel>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => <strong>{row.name}</strong>,
      csvValue: (row) => row.name,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusChip status={row.status} />,
      csvValue: (row) => row.status,
    },
    {
      key: 'segments',
      header: 'Segments',
      render: (row) => `${row.segments.length} segments`,
      csvValue: (row) => String(row.segments.length),
    },
    {
      key: 'spinCost',
      header: 'Spin Cost',
      sortable: true,
      render: (row) => (row.spinCost === 0 ? 'Free' : row.spinCost.toLocaleString()),
      csvValue: (row) => (row.spinCost === 0 ? 'Free' : String(row.spinCost)),
    },
    {
      key: 'maxSpinsPerUser',
      header: 'Max Spins',
      sortable: true,
      render: (row) => row.maxSpinsPerUser,
      csvValue: (row) => String(row.maxSpinsPerUser),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(ROUTES.WHEEL.DETAIL(row.id))}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(ROUTES.WHEEL.EDIT(row.id))}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        keyExtractor={(r) => r.id}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onSortChange={onSortChange}
        onRowClick={(row) => navigate(ROUTES.WHEEL.DETAIL(row.id))}
        emptyMessage="No wheels found"
        exportFilename="wheels.csv"
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Wheel"
        message="Are you sure you want to delete this wheel? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => {
          if (deleteId) deleteWheel(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
