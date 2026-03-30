import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchWheel } from '../api/wheel.api'

export function useWheel(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.wheels.detail(id),
    queryFn: () => fetchWheel(id),
    enabled: Boolean(id),
  })
}
