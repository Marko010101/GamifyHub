import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { deleteLeaderboard } from '../api/leaderboard.api'
import type { Leaderboard } from '@/types/leaderboard'
import type { PaginatedResponse } from '@/types/pagination'

export function useDeleteLeaderboard() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: deleteLeaderboard,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: QUERY_KEYS.leaderboards.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: QUERY_KEYS.leaderboards.lists() },
        (old) =>
          old ? { data: old.data.filter((item) => item.id !== id), total: old.total - 1 } : old,
      )
      return { previousLists }
    },
    onError: (_err, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to delete leaderboard', { variant: 'error' })
    },
    onSuccess: () => {
      enqueueSnackbar('Leaderboard deleted', { variant: 'info' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
    },
  })
}
