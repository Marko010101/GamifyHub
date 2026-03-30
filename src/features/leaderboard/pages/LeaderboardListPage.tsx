import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { PageHeader } from '@/components/common/PageHeader'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useLeaderboards } from '../composables/useLeaderboards'
import { LeaderboardFilters } from '../components/LeaderboardFilters'
import { LeaderboardTable } from '../components/LeaderboardTable'
import { BulkStatusToggle } from '../components/BulkStatusToggle'

export function LeaderboardListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading, isError, error, refetch } = useLeaderboards({
    page,
    limit,
    sort,
    order,
    status: statusFilter,
  })

  const handleFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleSortChange = (newSort: string, newOrder: 'asc' | 'desc') => {
    setSort(newSort)
    setOrder(newOrder)
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Leaderboards"
        subtitle="Manage competitive leaderboards and prizes"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.LEADERBOARD.CREATE)}
          >
            Create Leaderboard
          </Button>
        }
      />

      <LeaderboardFilters status={statusFilter} onStatusChange={handleFilterChange} />

      <BulkStatusToggle
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />

      {isLoading ? (
        <TableSkeleton rows={limit} columns={7} />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      ) : (
        <LeaderboardTable
          rows={data?.data ?? []}
          totalCount={data?.total ?? 0}
          page={page}
          rowsPerPage={limit}
          sortBy={sort}
          sortOrder={order}
          onPageChange={setPage}
          onRowsPerPageChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
          onSortChange={handleSortChange}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </>
  )
}
