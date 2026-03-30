import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchRaffle } from '../api/raffle.api'

export function useRaffle(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.raffles.detail(id),
    queryFn: () => fetchRaffle(id),
    enabled: Boolean(id),
  })
}
