import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchRaffles } from '../api/raffle.api'

interface UseRafflesParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  status?: string
  startDateFrom?: string
  endDateTo?: string
}

export function useRaffles(params: UseRafflesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.raffles.list(params as unknown as Record<string, unknown>),
    queryFn: () =>
      fetchRaffles({
        _page: params.page,
        _limit: params.limit,
        _sort: params.sort,
        _order: params.order,
        status: params.status || undefined,
        startDate_gte: params.startDateFrom || undefined,
        endDate_lte: params.endDateTo || undefined,
      }),
    placeholderData: keepPreviousData,
  })
}
