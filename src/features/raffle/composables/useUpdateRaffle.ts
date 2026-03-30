import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { updateRaffle } from '../api/raffle.api'
import type { Raffle, UpdateRaffleDto } from '@/types/raffle'
import type { PaginatedResponse } from '@/types/pagination'

export function useUpdateRaffle() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRaffleDto }) => updateRaffle(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.raffles.lists() })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.raffles.detail(id) })
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Raffle>>({
        queryKey: QUERY_KEYS.raffles.lists(),
      })
      const previousDetail = queryClient.getQueryData<Raffle>(QUERY_KEYS.raffles.detail(id))
      queryClient.setQueriesData<PaginatedResponse<Raffle>>(
        { queryKey: QUERY_KEYS.raffles.lists() },
        (old) =>
          old
            ? { ...old, data: old.data.map((item) => (item.id === id ? { ...item, ...dto } : item)) }
            : old,
      )
      if (previousDetail) {
        queryClient.setQueryData<Raffle>(QUERY_KEYS.raffles.detail(id), {
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
        queryClient.setQueryData(QUERY_KEYS.raffles.detail(id), context.previousDetail)
      }
      enqueueSnackbar('Failed to update raffle', { variant: 'error' })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.raffles.detail(data.id), data)
      enqueueSnackbar('Raffle updated successfully', { variant: 'success' })
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.raffles.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.raffles.detail(id) })
    },
  })
}
