import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateLeaderboard } from '../api/leaderboard.api'
import type { Leaderboard, UpdateLeaderboardDto } from '@/types/leaderboard'
import type { PaginatedResponse } from '@/types/pagination'

export function useUpdateLeaderboard() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLeaderboardDto }) =>
      updateLeaderboard(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.leaderboards.detail(id) })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Leaderboard>>({
        queryKey: QUERY_KEYS.leaderboards.lists(),
      })
      const previousDetail = queryClient.getQueryData<Leaderboard>(
        QUERY_KEYS.leaderboards.detail(id),
      )
      queryClient.setQueriesData<PaginatedResponse<Leaderboard>>(
        { queryKey: QUERY_KEYS.leaderboards.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === id ? { ...item, ...dto } : item)) }
            : old,
      )
      if (previousDetail) {
        queryClient.setQueryData<Leaderboard>(QUERY_KEYS.leaderboards.detail(id), {
          ...previousDetail,
          ...dto,
        })
      }
      return { previousLists, previousDetail }
    },
    onError: (_err, { id }, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      if (context?.previousDetail) {
        queryClient.setQueryData(QUERY_KEYS.leaderboards.detail(id), context.previousDetail)
      }
      enqueueSnackbar('Failed to update leaderboard', { variant: 'error' })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.leaderboards.detail(data.id), data)
      enqueueSnackbar('Leaderboard updated successfully', { variant: 'success' })
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboards.detail(id) })
    },
  })
}
