import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchLeaderboards } from '../api/leaderboard.api'

interface UseLeaderboardsParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  status?: string
}

export function useLeaderboards(params: UseLeaderboardsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboards.list(params as unknown as Record<string, unknown>),
    queryFn: () =>
      fetchLeaderboards({
        _page: params.page,
        _limit: params.limit,
        _sort: params.sort,
        _order: params.order,
        status: params.status || undefined,
      }),
    placeholderData: keepPreviousData,
  })
}
