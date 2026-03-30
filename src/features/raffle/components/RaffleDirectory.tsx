import { Box, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusChip } from '@/components/common/StatusChip'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { Raffle } from '@/types/raffle'
import { ROUTES } from '@/constants/routes'
import { useDeleteRaffle } from '../composables/useDeleteRaffle'

interface RaffleDirectoryProps {
  rows: Raffle[]
  totalCount: number
  page: number
  rowsPerPage: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onRowsPerPageChange: (limit: number) => void
  onSortChange: (key: string, order: 'asc' | 'desc') => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export function RaffleDirectory({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
}: RaffleDirectoryProps) {
  const navigate = useNavigate()
  const { mutate: deleteRaffle } = useDeleteRaffle()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const columns: Column<Raffle>[] = [
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
      key: 'ticketPrice',
      header: 'Ticket Price',
      sortable: true,
      render: (row) => row.ticketPrice.toLocaleString(),
      csvValue: (row) => String(row.ticketPrice),
    },
    {
      key: 'startDate',
      header: 'Start',
      sortable: true,
      render: (row) => formatDate(row.startDate),
      csvValue: (row) => formatDate(row.startDate),
    },
    {
      key: 'endDate',
      header: 'End',
      sortable: true,
      render: (row) => formatDate(row.endDate),
      csvValue: (row) => formatDate(row.endDate),
    },
    {
      key: 'drawDate',
      header: 'Draw',
      sortable: true,
      render: (row) => formatDate(row.drawDate),
      csvValue: (row) => formatDate(row.drawDate),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(ROUTES.RAFFLE.DETAIL(row.id))}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.status === 'drawn' ? 'Cannot edit drawn raffle' : 'Edit'}>
            <span>
              <IconButton
                size="small"
                disabled={row.status === 'drawn'}
                onClick={() => navigate(ROUTES.RAFFLE.EDIT(row.id))}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
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
        onRowClick={(row) => navigate(ROUTES.RAFFLE.DETAIL(row.id))}
        emptyMessage="No raffles found"
        exportFilename="raffles.csv"
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Raffle"
        message="Are you sure you want to delete this raffle? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => {
          if (deleteId) deleteRaffle(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
