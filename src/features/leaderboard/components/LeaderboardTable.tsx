import { Box, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/common/DataTable'
import { StatusChip } from '@/components/common/StatusChip'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useState } from 'react'
import type { Leaderboard } from '@/types/leaderboard'
import { ROUTES } from '@/constants/routes'
import { useDeleteLeaderboard } from '../composables/useDeleteLeaderboard'

interface LeaderboardTableProps {
  rows: Leaderboard[]
  totalCount: number
  page: number
  rowsPerPage: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onRowsPerPageChange: (limit: number) => void
  onSortChange: (key: string, order: 'asc' | 'desc') => void
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export function LeaderboardTable({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  selectedIds,
  onSelectionChange,
}: LeaderboardTableProps) {
  const navigate = useNavigate()
  const { mutate: deleteLeaderboard } = useDeleteLeaderboard()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const columns: Column<Leaderboard>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (row) => <strong>{row.title}</strong>,
      csvValue: (row) => row.title,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusChip status={row.status} />,
      csvValue: (row) => row.status,
    },
    {
      key: 'scoringType',
      header: 'Scoring',
      render: (row) => row.scoringType,
      csvValue: (row) => row.scoringType,
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
      key: 'maxParticipants',
      header: 'Max Players',
      sortable: true,
      render: (row) => row.maxParticipants.toLocaleString(),
      csvValue: (row) => String(row.maxParticipants),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(ROUTES.LEADERBOARD.DETAIL(row.id))}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(ROUTES.LEADERBOARD.EDIT(row.id))}>
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
        onRowClick={(row) => navigate(ROUTES.LEADERBOARD.DETAIL(row.id))}
        selectable
        selectedKeys={selectedIds}
        onSelectionChange={onSelectionChange}
        emptyMessage="No leaderboards found"
        exportFilename="leaderboards.csv"
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Leaderboard"
        message="Are you sure you want to delete this leaderboard? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => {
          if (deleteId) deleteLeaderboard(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
