import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { PageHeader } from '@/components/common/PageHeader'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useWheels } from '../composables/useWheels'
import { WheelFilters } from '../components/WheelFilters'
import { WheelTable } from '../components/WheelTable'

export function WheelListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, isError, error, refetch } = useWheels({
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
        title="Spin Wheels"
        subtitle="Configure spin-to-win game wheels with weighted segments"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.WHEEL.CREATE)}
          >
            Create Wheel
          </Button>
        }
      />

      <WheelFilters status={statusFilter} onStatusChange={handleFilterChange} />

      {isLoading ? (
        <TableSkeleton rows={limit} columns={6} />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      ) : (
        <WheelTable
          rows={data?.data ?? []}
          totalCount={data?.total ?? 0}
          page={page}
          rowsPerPage={limit}
          sortBy={sort}
          sortOrder={order}
          onPageChange={setPage}
          onRowsPerPageChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
          onSortChange={handleSortChange}
        />
      )}
    </>
  )
}
