import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { deleteRaffle } from '../api/raffle.api'
import type { Raffle } from '@/types/raffle'
import type { PaginatedResponse } from '@/types/pagination'

export function useDeleteRaffle() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: deleteRaffle,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.raffles.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Raffle>>({
        queryKey: QUERY_KEYS.raffles.lists(),
      })
      queryClient.setQueriesData<PaginatedResponse<Raffle>>(
        { queryKey: QUERY_KEYS.raffles.lists() },
        (old) =>
          old ? { data: old.data.filter((item) => item.id !== id), total: old.total - 1 } : old,
      )
      return { previousLists }
    },
    onError: (_err, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to delete raffle', { variant: 'error' })
    },
    onSuccess: () => {
      enqueueSnackbar('Raffle deleted', { variant: 'info' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.raffles.lists() })
    },
  })
}
