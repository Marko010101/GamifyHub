import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { createLeaderboard } from '../api/leaderboard.api'
import type { Leaderboard } from '@/types/leaderboard'
import type { PaginatedResponse } from '@/types/pagination'

export function useCreateLeaderboard() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: createLeaderboard,
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: QUERY_KEYS.leaderboards.lists(),
      })
      const tempId = `__temp__${Date.now()}`
      const optimisticItem: Leaderboard = {
        id: tempId,
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: QUERY_KEYS.leaderboards.lists() },
        (old) => (old ? { data: [optimisticItem, ...old.data], total: old.total + 1 } : old),
      )
      return { previousLists, tempId }
    },
    onError: (_err, _dto, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to create leaderboard', { variant: 'error' })
    },
    onSuccess: (data, _dto, context) => {
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: QUERY_KEYS.leaderboards.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === context?.tempId ? data : item)) }
            : old,
      )
      enqueueSnackbar('Leaderboard created successfully', { variant: 'success' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
    },
  })
}
