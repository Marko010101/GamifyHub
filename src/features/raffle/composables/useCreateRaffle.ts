import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { createRaffle } from '../api/raffle.api'
import type { Raffle } from '@/types/raffle'
import type { PaginatedResponse } from '@/types/pagination'

export function useCreateRaffle() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: createRaffle,
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.raffles.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Raffle>>({
        queryKey: QUERY_KEYS.raffles.lists(),
      })
      const tempId = `__temp__${Date.now()}`
      const optimisticItem: Raffle = {
        id: tempId,
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueriesData<PaginatedResponse<Raffle>>(
        { queryKey: QUERY_KEYS.raffles.lists() },
        (old) => (old ? { data: [optimisticItem, ...old.data], total: old.total + 1 } : old),
      )
      return { previousLists, tempId }
    },
    onError: (_err, _dto, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      enqueueSnackbar('Failed to create raffle', { variant: 'error' })
    },
    onSuccess: (data, _dto, context) => {
      queryClient.setQueriesData<PaginatedResponse<Raffle>>(
        { queryKey: QUERY_KEYS.raffles.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === context?.tempId ? data : item)) }
            : old,
      )
      enqueueSnackbar('Raffle created successfully', { variant: 'success' })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.raffles.lists() })
    },
  })
}
