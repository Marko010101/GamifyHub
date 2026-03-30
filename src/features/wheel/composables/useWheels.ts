import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchWheels } from '../api/wheel.api'

interface UseWheelsParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  status?: string
}

export function useWheels(params: UseWheelsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.wheels.list(params as unknown as Record<string, unknown>),
    queryFn: () =>
      fetchWheels({
        _page: params.page,
        _limit: params.limit,
        _sort: params.sort,
        _order: params.order,
        status: params.status || undefined,
      }),
    placeholderData: keepPreviousData,
  })
}
