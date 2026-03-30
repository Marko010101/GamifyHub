import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { PageHeader } from '@/components/common/PageHeader'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ErrorDisplay } from '@/components/common/ErrorDisplay'
import { ROUTES } from '@/constants/routes'
import { useRaffles } from '../composables/useRaffles'
import { RaffleFilters } from '../components/RaffleFilters'
import { RaffleDirectory } from '../components/RaffleDirectory'

export function RaffleListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [endDateTo, setEndDateTo] = useState('')

  const { data, isLoading, isError, error, refetch } = useRaffles({
    page,
    limit,
    sort,
    order,
    status: statusFilter,
    startDateFrom: startDateFrom ? `${startDateFrom}T00:00:00.000Z` : '',
    endDateTo: endDateTo ? `${endDateTo}T23:59:59.000Z` : '',
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
        title="Raffles"
        subtitle="Manage prize raffles with ticket-based entry"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.RAFFLE.CREATE)}
          >
            Create Raffle
          </Button>
        }
      />

      <RaffleFilters
        status={statusFilter}
        onStatusChange={handleFilterChange}
        startDateFrom={startDateFrom}
        onStartDateFromChange={(d) => { setStartDateFrom(d); setPage(1) }}
        endDateTo={endDateTo}
        onEndDateToChange={(d) => { setEndDateTo(d); setPage(1) }}
      />

      {isLoading ? (
        <TableSkeleton rows={limit} columns={7} />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      ) : (
        <RaffleDirectory
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
