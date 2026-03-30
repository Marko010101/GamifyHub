import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { fetchLeaderboard } from '../api/leaderboard.api'

export function useLeaderboard(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboards.detail(id),
    queryFn: () => fetchLeaderboard(id),
    enabled: Boolean(id),
  })
}
